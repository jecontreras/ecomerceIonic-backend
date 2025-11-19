/**
 * Product.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    // Empresa que lo creó
    company: {
      model: 'company',
      required: true
    },

    titulo: { type: 'string', required: true },
    slug:   { type: 'string', required: true, unique: true },

    descripcion: { type: 'string' },

    precioBase:  { type: 'number', required: true },
    precioCompra:{ type: 'number', defaultsTo: 0 },
    precioOferta:{ type: 'number', defaultsTo: 0 },

    image:       { type: 'string', defaultsTo: 'default.jpg' },
    gallery:     { type: 'json', defaultsTo: [] },

    category:    { model: 'category', required: true },
    subcategory: { model: 'subcategory' },

    colores:     { type: 'json', defaultsTo: [] },
    tallas:      { type: 'json', defaultsTo: [] },

    marca:       { type: 'string' },
    genero:      { type: 'string' },

    peso:        { type: 'number', defaultsTo: 1 },

    isActive:    { type: 'boolean', defaultsTo: true },

    comisionVendedor: { type: 'number', defaultsTo: 5 },

    // reverse relation
    vendorProducts: {
      collection: 'vendorproduct',
      via: 'product'
    },

     favoritedBy: {
      collection: 'CustomerProfile',
      via: 'favorites'
    }

  }

};


