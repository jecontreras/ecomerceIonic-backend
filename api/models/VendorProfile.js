/**
 * VendorProfile.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * VendorProfile.js
 */
module.exports = {
  attributes: {

    user: { model: 'user', required: true, unique: true },

    storeSlug: { type: 'string', unique: true, required: true },

    theme: { type: 'json', defaultsTo: {} },

    facebookPixel: { type: 'string', allowNull: true },

    referredBy: { type: 'number', allowNull: true },

    clients: {
      collection: 'customerprofile',
      via: 'vendor'
    },

    products: {
      collection: 'vendorproduct',
      via: 'vendor'
    },

    orders: {
      collection: 'order',
      via: 'vendor'
    },

    logo: {
      type: 'string',
      allowNull: true
    }

  }
};
