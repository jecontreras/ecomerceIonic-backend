/**
 * Subscription.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    company: { model: 'company', required: true },
    plan: { model: 'subscriptionplan', required: true },

    renewAt: { type: 'ref', columnType: 'datetime' },

    isActive: { type: 'boolean', defaultsTo: true }

  }

};

