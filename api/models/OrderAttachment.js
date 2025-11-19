/**
 * OrderAttachment.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    order: { model: 'order', required: true },
    url: { type: 'string', required: true },
    filename: { type: 'string' },
    type: { type: 'string' }, // image/png, application/pdf, etc
    visibleToCustomer: { type: 'boolean', defaultsTo: false },
    uploadedBy: { model: 'user', required: true },
  }
};
