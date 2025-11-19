/**
 * NotificationTemplate.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {

    key: { type: 'string', required: true, unique: true },

    // Ej: "Nueva compra", "Tu pedido cambió a ENVIADO"
    titleTemplate: { type: 'string' },
    messageTemplate: { type: 'string' },

    whatsappTemplateCode: { type: 'string' },

  }
};


