/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */


module.exports = {

  attributes: {

    fullName: { type: 'string', required: true },
    phone: { type: 'string', unique: true, required: true },
    email: { type: 'string', allowNull: true },
    password: { type: 'string', required: true },

    role: {
      type: 'string',
      isIn: ['admin', 'company_owner', 'vendor', 'customer'],
      required: true
    },

    isActive: { type: 'boolean', defaultsTo: true },

    lastLoginAt: { type: 'ref', columnType: 'datetime' },

    // Relaciones
    vendorProfile: {
      model: 'vendorprofile'
    },

    companyProfile: {
      model: 'company'
    },

    customerProfile: {
      model: 'customerprofile'
    },

    notifications: {
      collection: 'notification',
      via: 'user'
    },

     chatThreads: {
      collection: 'chatthread',
      via: 'participants'
    },

  },

};