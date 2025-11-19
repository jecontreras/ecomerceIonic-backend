/**
 * OrderStatusHistory.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    order: { model: 'order', required: true },
    status: { type: 'string', required: true },
    notes: { type: 'string', allowNull: true },

    trackingNumber: { type: 'string', allowNull: true },
    carrier: { type: 'string', allowNull: true },

    changedAt: { type: 'ref', columnType: 'datetime' },
    visibleToCustomer: { type: 'boolean', defaultsTo: true },


  },
  beforeCreate: function (valuesToSet, proceed) {
      valuesToSet.changedAt = new Date();
    return proceed();
  }

};


