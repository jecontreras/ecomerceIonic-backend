/**
 * OrderControllerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

// api/controllers/OrderController.js

module.exports = {

  // POST /api/v1/orders
  async createOrder(payload) {
    const { customerUser, items, paymentType, shipping } = payload;

    const customerProfile = await CustomerProfile.findOne({ user: customerUser.id });
    if (!customerProfile) throw new Error('Perfil cliente no encontrado');

    if (!items || !items.length)
      throw new Error('La orden debe tener al menos un item');

    // AGRUPAR ITEMS POR EMPRESA
    const itemsPorEmpresa = {};

    for (const it of items) {
      if (!it.companyId) throw new Error('Item sin companyId');

      if (!itemsPorEmpresa[it.companyId]) {
        itemsPorEmpresa[it.companyId] = [];
      }

      itemsPorEmpresa[it.companyId].push(it);
    }

    const ordenesCreadas = [];

    // CREAR UNA ORDEN POR EMPRESA
    for (const companyId of Object.keys(itemsPorEmpresa)) {

      const itemsEmpresa = itemsPorEmpresa[companyId];

      const empresa = await Company.findOne({ id: companyId });
      if (!empresa) throw new Error('Empresa inválida');

      // si viene vendorId por item, se toma el primero
      const vendorId = itemsEmpresa[0]?.vendorId || null;

      let vendorProfile = null;
      if (vendorId) {
        vendorProfile = await VendorProfile.findOne({ id: vendorId });
      }

      // ---- LÓGICA ORIGINAL DE ITEMS (SIN CAMBIAR NADA) ----
      let totalBruto = 0;
      let totalComisionVendedor = 0;
      let totalComisionPlataforma = 0;
      let totalNetoEmpresa = 0;

      const orderItemsData = [];

      for (const item of itemsEmpresa) {

        const product = await Product.findOne({ id: item.productId });
        if (!product || !product.isActive)
          throw new Error('Producto inválido ' + item.productId);

        let unitPrice = product.precioOferta > 0 ? product.precioOferta : product.precioBase;

        let vendorProduct = null;
        if (item.vendorId) {
          vendorProduct = await VendorProduct.findOne({
            vendor: vendorId,
            product: product.id
          });
          if (vendorProduct?.precioPersonalizado)
            unitPrice = vendorProduct.precioPersonalizado;
        }

        const quantity = Number(item.cantidad || 1);
        const subtotal = unitPrice * quantity;

        // comisiones
        const comisionVendedorPct = vendorProfile ? (product.comisionVendedor || 0) : 0;
        const comisionPlataformaPct = 5;

        const comisionVendedor = vendorProfile ? subtotal * comisionVendedorPct / 100 : 0;
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

      // CREAR ORDEN
      const orden = await Order.create({
        code: 'ORD-' + Date.now(),
        customer: customerProfile.id,
        vendor: vendorProfile ? vendorProfile.id : null,
        company: empresa.id,
        paymentType,
        paymentStatus: 'pending',
        status: 'nuevo',
        total: totalBruto,
        shippingInfo: shipping
      }).fetch();

      // Crear items
      for (const data of orderItemsData) {
        await OrderItem.create({ order: orden.id, ...data });
      }

      // estado
      await OrderStatusHistory.create({
        order: orden.id,
        status: 'nuevo',
        changedBy: customerUser.id,
        note: 'Orden creada'
      });

      // NOTIFICACIONES
      await NotificationService.notifyTemplate({
        key: 'order.new',
        userId: empresa.user,
        data: { orderCode: orden.code, total: totalBruto },
        sendWhatsApp: true
      });

      if (vendorProfile) {
        await NotificationService.notifyTemplate({
          key: 'order.new',
          userId: vendorProfile.user,
          data: { orderCode: orden.code, total: totalBruto },
          sendWhatsApp: true
        });
      }

      ordenesCreadas.push(orden);
    }

    return ordenesCreadas;
  },

  // GET /api/v1/orders/my (cliente)
  listForCustomer: async function (req, res) {
    try {
      const customerProfile = await CustomerProfile.findOne({ user: req.me.id });
      if (!customerProfile) {
        return res.badRequest({ message: 'Perfil cliente no encontrado' });
      }

      // ------------------------------
      // PAGINACIÓN Y FILTRO
      // ------------------------------
      let page = Number(req.query.page) || 1;
      let limit = Number(req.query.limit) || 10;
      let skip = (page - 1) * limit;

      const where = { customer: customerProfile.id };

      if (req.query.status) {
        where.status = req.query.status;
      }

      // ------------------------------
      // CONSULTA PRINCIPAL
      // ------------------------------
      const [orders, total] = await Promise.all([
        Order.find(where)
          .sort('createdAt DESC')
          .skip(skip)
          .limit(limit)
          .populate('items')
          .populate('company')
          .populate('vendor'),

        Order.count(where)
      ]);

      // ------------------------------
      // FORMATO QUE TU FRONT ESPERA
      // ------------------------------
      const data = orders.map(o => ({
        id: o.id,
        code: o.code,
        status: o.status,
        fecha: o.createdAt,
        totalBruto: o.total,
        trackingNumber: o.trackingNumber || null,
        carrier: o.carrier || null,
        items: o.items || []
      }));

      return res.ok({
        data,
        total,
        page,
        limit
      });

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error listando órdenes del cliente' });
    }
  },


  // GET /api/v1/orders/vendor (vendedor)
  listForVendor: async function (req, res) {
    try {
      const vendorProfile = await VendorProfile.findOne({ user: req.me.id });
      if (!vendorProfile) return res.badRequest({ message: 'Perfil vendedor no encontrado' });

      const orders = await Order.find({ vendor: vendorProfile.id })
        .sort('createdAt DESC')
        .populate('items')
        .populate('customer');

      return res.ok(orders);

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error listando órdenes del vendedor' });
    }
  },

  // GET /api/v1/orders/company (empresa)
  listForCompany: async function (req, res) {
    try {
      const company = await Company.findOne({ user: req.me.id });
      if (!company) return res.badRequest({ message: 'Empresa no encontrada' });

      const orders = await Order.find({ company: company.id })
        .sort('createdAt DESC')
        .populate('items')
        .populate('customer')
        .populate('vendor');

      return res.ok(orders);

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error listando órdenes de empresa' });
    }
  },

  // GET /api/v1/orders/admin (admin)
  listForAdmin: async function (req, res) {
    try {
      const { status, companyId, vendorId } = req.query;

      const where = {};
      if (status) where.status = status;
      if (companyId) where.company = companyId;
      if (vendorId) where.vendor = vendorId;

      const orders = await Order.find(where)
        .sort('createdAt DESC')
        .populate('items')
        .populate('customer')
        .populate('vendor')
        .populate('company');

      return res.ok(orders);

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error listando órdenes (admin)' });
    }
  },

  // GET /api/v1/orders/:id
  detail: async function (req, res) {
    try {
      const id = req.params.id;

      let order = await Order.findOne({ id })
        .populate('items')
        .populate('customer')
        .populate('vendor')
        .populate('company')
        .populate('statusHistory');

      if (!order) return res.notFound({ message: 'Orden no encontrada' });

      // ----------------------------------------------------
      // POPULATE product dentro de cada item
      // ----------------------------------------------------
      const items = [];

      for (const it of order.items) {
        const product = await Product.findOne({ id: it.product });

        items.push({
          id: it.id,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          subtotal: it.subtotal,
          talla: it.talla,
          color: it.color,
          product
        });
      }

      // ----------------------------------------------------
      // ORDENAR statusHistory por fecha DESC
      // ----------------------------------------------------
      const history = (order.statusHistory || []).sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      // ----------------------------------------------------
      // ESTRUCTURA PARA EL FRONT
      // ----------------------------------------------------
      const response = {
        id: order.id,
        code: order.code,
        status: order.status,
        total: order.total,               // 🔹 YA NO totalBruto
        createdAt: order.createdAt,       // para listar y detalle

        shippingInfo: order.shippingInfo || null,

        trackingNumber: order.trackingNumber || null,
        carrier: order.carrier || null,

        customer: order.customer || null,
        vendor: order.vendor || null,
        company: order.company || null,

        items,

        statusHistory: history.map(h => ({
          id: h.id,
          status: h.status,
          note: h.note || null,
          createdAt: h.createdAt,
          changedBy: h.changedBy,
          changedByName: h.changedByName || null
        }))
      };

      return res.ok(response);

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error obteniendo detalle de orden' });
    }
  },


  // PUT /api/v1/orders/:id/status
  changeStatus: async function (req, res) {
    try {
      const id = req.params.id;
      const { status, note, trackingNumber, carrier } = req.body;

      // 1. Validar estado
      const validStatuses = ['nuevo', 'preparacion', 'transito', 'entregado', 'devuelto'];
      if (!validStatuses.includes(status)) {
        return res.badRequest({ message: 'Estado no válido' });
      }

      // 2. Buscar la orden
      const order = await Order.findOne({ id }).populate('company');
      if (!order) return res.notFound({ message: 'Orden no encontrada' });

      // 3. Permisos:
      // Admin SIEMPRE puede
      // Empresa dueña puede
      if (req.me.role !== 'admin') {
        const company = await Company.findOne({ user: req.me.id });
        if (!company || company.id !== order.company.id) {
          return res.forbidden({ message: 'No autorizado para cambiar esta orden' });
        }
      }

      // 4. Preparar tracking
      let tracking = null;
      if (trackingNumber || carrier) {
        tracking = {
          trackingNumber: trackingNumber || null,
          carrier: carrier || null
        };
      }

      // 5. Ejecutar cambio en OrderService
      const updatedOrder = await OrderService.changeStatus({
        orderId: id,
        newStatus: status,
        userId: req.me.id,
        note,
        tracking
      });

      // 6. Respuesta OK
      return res.ok(updatedOrder);

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: err.message || 'Error cambiando estado de orden' });
    }
  },
  // POST /api/v1/orders/:id/add-note
  addNote: async function (req, res) {
    try {
      const id = req.params.id;
      const { note } = req.body;

      if (!note || note.trim().length === 0) {
        return res.badRequest({ message: 'La nota no puede estar vacía' });
      }

      const order = await Order.findOne({ id });
      if (!order) return res.notFound({ message: 'Orden no encontrada' });

      // Validar permisos
      if (req.me.role !== 'admin') {
        const company = await Company.findOne({ user: req.me.id });
        if (!company || company.id !== order.company) {
          return res.forbidden({ message: 'No autorizado' });
        }
      }

      // Crear historial
      await OrderStatusHistory.create({
        order: id,
        status: order.status,
        changedBy: req.me.id,
        note,
        visibleToCustomer: req.body.visibleToCustomer !== false
      });


      const updated = await Order.findOne({ id })
        .populate('statusHistory')
        .populate('items')
        .populate('customer')
        .populate('vendor')
        .populate('company');

      return res.ok(updated);

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error agregando nota' });
    }
  },
  uploadAttachment: async function (req, res) {
    try {
      const orderId = req.params.id;
      const order = await Order.findOne({ id: orderId });
      if (!order) return res.notFound({ message: 'Orden no encontrada' });

      const file = req.file('file');
      if (!file) return res.badRequest({ message: 'Archivo requerido' });

      file.upload({
        dirname: require('path').resolve(sails.config.appPath, 'uploads/order-attachments')
      },
      async (err, uploadedFiles) => {
        if (err) return res.serverError(err);
        if (!uploadedFiles.length) return res.badRequest({ message: 'Archivo inválido' });

        const path = uploadedFiles[0].fd.replace(/^.*uploads/, '/uploads');

        const attachment = await OrderAttachment.create({
          order: orderId,
          url: path,
          filename: uploadedFiles[0].filename,
          type: uploadedFiles[0].type,
          uploadedBy: req.me.id,
          visibleToCustomer: req.body.visibleToCustomer === 'true'
        }).fetch();

        return res.ok(attachment);
      });

    } catch (err) {
      sails.log.error(err);
      return res.serverError({ message: 'Error subiendo archivo' });
    }
  }




};
