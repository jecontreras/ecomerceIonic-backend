/**
 * WhatsAppLog.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
module.exports = {

  attributes: {

    phone: { type: 'string', required: true },

    template: { type: 'string' },

    payload: { type: 'json' },

    response: { type: 'json' },

    status: {
      type: 'string',
      isIn: ['pending', 'sent', 'failed'],
      defaultsTo: 'pending'
    }

  }

};
