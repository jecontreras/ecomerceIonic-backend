// api/services/OrderService.js

module.exports = {

  /**
   * Crear una orden completa
   * @param {Object} payload
   * @param {Object} payload.customerUser  // req.me (User)
   * @param {Number} payload.companyId
   * @param {Number} [payload.vendorId]
   * @param {String} payload.paymentType   // 'online' | 'cod'
   * @param {Array}  payload.items         // [{ productId, vendorProductId?, quantity, talla?, color? }]
   * @param {Object} payload.shipping      // dirección, ciudad, etc
   */
  createOrder: async function (payload) {
    const {
      customerUser,
      companyId,
      vendorId,
      paymentType,
      items,
      shipping
    } = payload;

    // 1. Perfiles
    const customerProfile = await CustomerProfile.findOne({ user: customerUser.id });
    if (!customerProfile) {
      throw new Error('Perfil de cliente no encontrado');
    }

    const company = await Company.findOne({ id: companyId });
    if (!company) {
      throw new Error('Empresa no válida');
    }

    let vendorProfile = null;
    if (vendorId) {
      vendorProfile = await VendorProfile.findOne({ id: vendorId });
      if (!vendorProfile) {
        throw new Error('Vendedor no válido');
      }
    }

    if (!items || !items.length) {
      throw new Error('La orden debe tener al menos un item');
    }

    // 2. Calcular totales
    let totalBruto = 0;
    let totalComisionVendedor = 0;
    let totalComisionPlataforma = 0;
    let totalNetoEmpresa = 0;

    const orderItemsData = [];

    for (const item of items) {
      const product = await Product.findOne({ id: item.productId });
      if (!product || !product.isActive) {
        throw new Error(`Producto inválido: ${item.productId}`);
      }

      // Precio base: oferta > base
      let unitPrice = product.precioOferta > 0 ? product.precioOferta : product.precioBase;

      // Si hay VendorProduct y un precio personalizado, úsalo
      let vendorProduct = null;
      if (item.vendorProductId) {
        vendorProduct = await VendorProduct.findOne({ id: item.vendorProductId });
        if (vendorProduct && vendorProduct.precioPersonalizado) {
          unitPrice = vendorProduct.precioPersonalizado;
        }
      }

      const quantity = Number(item.quantity || 1);
      const subtotal = unitPrice * quantity;

      // Comisiones (puedes mover reglas a config o Plan más adelante)
      const comisionVendedorPct = vendorProfile ? (product.comisionVendedor || 0) : 0;
      const comisionPlataformaPct = 5; // Ejemplo: 5% fijo (luego lo sacas de Plan o config)

      const comisionVendedor = vendorProfile ? (subtotal * comisionVendedorPct / 100) : 0;
      const comisionPlataforma = subtotal * comisionPlataformaPct / 100;
      const netoEmpresa = subtotal - comisionVendedor - comisionPlataforma;

      totalBruto += subtotal;
      totalComisionVendedor += comisionVendedor;
      totalComisionPlataforma += comisionPlataforma;
      totalNetoEmpresa += netoEmpresa;

      orderItemsData.push({
        product: product.id,
        vendorProduct: vendorProduct ? vendorProduct.id : null,
        quantity,
        unitPrice,
        subtotal,
        talla: item.talla || null,
        color: item.color || null,
        comisionVendedor,
        comisionPlataforma,
        netoEmpresa
      });
    }

    // 3. Crear Order
    const order = await Order.create({
      code: 'ORD-' + Date.now(),
      customer: customerProfile.id,
      vendor: vendorProfile ? vendorProfile.id : null,
      company: company.id,
      paymentType,
      paymentStatus: paymentType === 'online' ? 'pending' : 'pending',
      status: 'nuevo',
      totalBruto,
      totalComisionVendedor,
      totalComisionPlataforma,
      totalNetoEmpresa,
      shippingInfo: shipping
    }).fetch();

    // 4. Crear Items
    for (const itemData of orderItemsData) {
      await OrderItem.create({
        order: order.id,
        product: itemData.product,
        vendorProduct: itemData.vendorProduct,
        quantity: itemData.quantity,
        unitPrice: itemData.unitPrice,
        subtotal: itemData.subtotal,
        talla: itemData.talla,
        color: itemData.color,
        comisionVendedor: itemData.comisionVendedor,
        comisionPlataforma: itemData.comisionPlataforma,
        netoEmpresa: itemData.netoEmpresa
      });
    }

    // 5. Historial de estado
    await OrderStatusHistory.create({
      order: order.id,
      status: 'nuevo',
      changedBy: customerUser.id,
      note: 'Orden creada'
    });

    // 6. (Opcional) Crear registro de comisiones global
    await CommissionRecord.create({
      order: order.id,
      vendorAmount: totalComisionVendedor,
      companyAmount: totalNetoEmpresa,
      platformAmount: totalComisionPlataforma
    });

    // Notificar vendedor
if (vendorProfile) {
  await NotificationService.notifyTemplate({
    key: 'order.new',
    userId: vendorProfile.user,
    data: {
      orderCode: order.code,
      total: totalBruto
    },
    sendWhatsApp: true
  });
}

// Notificar empresa
await NotificationService.notifyTemplate({
  key: 'order.new',
  userId: company.user,
  data: { orderCode: order.code, total: totalBruto },
  sendWhatsApp: true
});

    return await Order.findOne({ id: order.id })
      .populate('items')
      .populate('customer')
      .populate('vendor')
      .populate('company');
  },

  /**
   * Cambiar estado de la orden y registrar historial
   */
  async changeStatus({ orderId, newStatus, userId, note, tracking }) {

    const order = await Order.findOne({ id: orderId })
      .populate('customer')
      .populate('vendor')
      .populate('company');

    if (!order) throw new Error('Orden no encontrada');

    const updateData = { status: newStatus };

    if (tracking) {
      updateData.shippingInfo = {
        ...(order.shippingInfo || {}),
        trackingNumber: tracking.trackingNumber || null,
        carrier: tracking.carrier || null
      };
    }

    await Order.updateOne({ id: orderId }).set(updateData);

    await OrderStatusHistory.create({
      order: orderId,
      status: newStatus,
      changedBy: userId,
      note: note || '',
      visibleToCustomer: true
    });

    // Notificar cliente
    await NotificationService.notifyTemplate({
      key: 'order.status_changed',
      userId: order.customer?.user || order.customer,
      data: {
        orderCode: order.code,
        newStatus,
        tracking: tracking?.trackingNumber || null
      },
      sendWhatsApp: true
    });

    // Notificar vendedor
    if (order.vendor?.user) {
      await NotificationService.notifyTemplate({
        key: 'order.status_changed',
        userId: order.vendor.user,
        data: { orderCode: order.code, newStatus },
        sendWhatsApp: true
      });
    }

    // Notificar empresa
    if (order.company?.user) {
      await NotificationService.notifyTemplate({
        key: 'order.status_changed',
        userId: order.company.user,
        data: { orderCode: order.code, newStatus },
        sendWhatsApp: true
      });
    }

    return await Order.findOne({ id: orderId })
      .populate('items')
      .populate('customer')
      .populate('vendor')
      .populate('company')
      .populate('statusHistory');
  }



};
