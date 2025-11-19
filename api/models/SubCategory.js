/**
 * SubCategory.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    name: { type: 'string', required: true },
    slug: { type: 'string', unique: true },

    category: {
      model: 'category',
      required: true
    },

    products: {
      collection: 'product',
      via: 'subcategory'
    }

  }

};
