/**
 * CustomerProfile.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * CustomerProfile.js
 */

module.exports = {

  attributes: {

    user: { model: 'user', required: true, unique: true },

    vendor: { model: 'vendorprofile'},

    orders: {
      collection: 'order',
      via: 'customer'
    },

    favorites: {
      collection: 'product',
      via: 'favoritedBy'
    }

  }

};
