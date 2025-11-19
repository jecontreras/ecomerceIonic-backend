/**
 * Purchase.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    customer: { model: 'user', required: true },
    vendor:   { model: 'vendorprofile', required: true },

    // total final de toda la compra
    total: { type: 'number', defaultsTo: 0 },

    orders: {
      collection: 'order',
      via: 'purchase'
    },
  }
}
