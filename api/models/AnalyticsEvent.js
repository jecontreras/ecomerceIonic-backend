/**
 * AnalyticsEvent.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    type: {
      type: 'string',
      isIn: ['store_visit', 'product_view', 'add_to_cart', 'share', 'checkout'],
      required: true
    },

    vendor: { model: 'vendorprofile'},
    company: { model: 'company'},
    product: { model: 'product'},

    user: { model: 'user'},

    metadata: { type: 'json', defaultsTo: {} }

  }

};

