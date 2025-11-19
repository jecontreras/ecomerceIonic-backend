/**
 * VendorProduct.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * VendorProduct.js
 */

module.exports = {

  attributes: {

    vendedor: { 
      model: 'user'
    },

    product: { 
      model: 'product',
      required: true 
    },

    // personalización opcional
    precioPersonalizado: { type: 'number' },
    tituloPersonalizado: { type: 'string' },

    orden: { type: 'number', defaultsTo: 0 },

    isActive: { type: 'boolean', defaultsTo: true },

    vendor: {
      collection: 'VendorProfile',
      via: 'products'
    },

  }

};

