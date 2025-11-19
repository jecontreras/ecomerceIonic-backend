/**
 * Category.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

/**
 * Category.js
 */

module.exports = {

  attributes: {

    name: { type: 'string', required: true },

    slug: { type: 'string', unique: true },

    image: { type: 'string', allowNull: true },

    isActive: { type: 'boolean', defaultsTo: true },

    products: {
      collection: 'product',
      via: 'category'
    },

    subcategories: {
      collection: 'subcategory',
      via: 'category'
    }

  }

};
