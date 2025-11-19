/**
 * CommissionRecord.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    order: { model: 'order', required: true },

    vendorAmount: { type: 'number', defaultsTo: 0 },
    companyAmount: { type: 'number', defaultsTo: 0 },
    platformAmount: { type: 'number', defaultsTo: 0 }

  }

};

