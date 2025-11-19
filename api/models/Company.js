/**
 * Company.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * Company.js
 */

module.exports = {

  attributes: {

    user: { model: 'user', unique: true, required: true },

    name: { type: 'string', required: true },
    slug: { type: 'string', unique: true, required: true },

    logo: { type: 'string', allowNull: true },
    banners: { type: 'json', defaultsTo: [] },

    facebookPixel: { type: 'string', allowNull: true },

    products: {
      collection: 'product',
      via: 'company'
    },

    orders: {
      collection: 'order',
      via: 'company'
    },

    plan: { model: 'subscription' }

  }

};
