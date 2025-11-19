/**
 * Order.js
 *
 * Modelo de la orden principal
 */

module.exports = {

  attributes: {

    // ------- RELACIONES -------
    customer: { model: 'customerprofile', required: true }, // Cliente dueño del pedido
    vendor: { model: 'vendorprofile'},     // Vendedor (si aplica)
    company: { model: 'company', required: true },           // Empresa dueña del producto

    items: {                                                  // Items dentro de la orden
      collection: 'orderitem',
      via: 'order'
    },

    statusHistory: {                                          // Historial de cambios
      collection: 'orderstatushistory',
      via: 'order'
    },

    // ------- INFO BÁSICA -------
    code: { type: 'string', unique: true },                   // Ej: ORD-123456

    paymentType: {                                            // 'online' | 'cod'
      type: 'string',
      isIn: ['online', 'cod'],
      required: true
    },

    paymentStatus: {                                          // 'pending', 'paid', 'failed'
      type: 'string',
      isIn: ['pending', 'paid', 'failed'],
      defaultsTo: 'pending'
    },

    status: {                                                 // Estado actual
      type: 'string',
      isIn: ['nuevo', 'preparacion', 'transito', 'entregado', 'devuelto'],
      defaultsTo: 'nuevo'
    },

    // ------- TOTALES (lo que tu OrderService calcula) -------
    totalBruto: { type: 'number', columnType: 'float', defaultsTo: 0 },
    totalComisionVendedor: { type: 'number', columnType: 'float', defaultsTo: 0 },
    totalComisionPlataforma: { type: 'number', columnType: 'float', defaultsTo: 0 },
    totalNetoEmpresa: { type: 'number', columnType: 'float', defaultsTo: 0 },

    // ------- INFO DE ENVÍO -------
    shippingInfo: { type: 'json' },

    // SI USAS compras agrupadas, déjalo. Si no, quítalo:
    purchase: { model: 'purchase'},

  }
};
