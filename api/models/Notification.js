/**
 * Notification.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {

    user: {
      model: 'user',
      required: true
    },

    type: {
      type: 'string',
      isIn: ['order', 'status', 'offer', 'system', 'chat'],
      required: true
    },

    title: { type: 'string', required: true },
    message: { type: 'string', required: true },

    data: { type: 'json', defaultsTo: {} },

    isRead: { type: 'boolean', defaultsTo: false },

  }
};



