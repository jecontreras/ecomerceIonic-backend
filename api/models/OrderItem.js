/**
 * OrderItem.js
 *
 * Representa cada producto dentro de una orden.
 */

module.exports = {

  attributes: {

    // Relación con la orden
    order: { model: 'order', required: true },

    // Producto base
    product: { model: 'product', required: true },

    // Producto del vendedor (si existe)
    vendorProduct: { model: 'vendorproduct' },

    // Cantidad
    quantity: { type: 'number', required: true },

    // Precio unitario usado en la orden
    unitPrice: { type: 'number', columnType: 'float', required: true },

    // Subtotal = unitPrice * quantity
    subtotal: { type: 'number', columnType: 'float', required: true },

    // Variaciones seleccionadas
    talla: { type: 'string', allowNull: true },
    color: { type: 'string', allowNull: true },

    // Comisiones
    comisionVendedor: { type: 'number', columnType: 'float', defaultsTo: 0 },
    comisionPlataforma: { type: 'number', columnType: 'float', defaultsTo: 0 },

    // Lo que recibe la empresa finalmente
    netoEmpresa: { type: 'number', columnType: 'float', defaultsTo: 0 },

    // ------ Campos opcionales recomendados ------
    // Útiles para render frontend sin demasiadas "populate"
    tituloProducto: { type: 'string', allowNull: true },
    imagenProducto: { type: 'string', allowNull: true },

  }
};
