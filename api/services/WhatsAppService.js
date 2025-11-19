const axios = require('axios');

module.exports = {

  /**
   * Enviar un mensaje WhatsApp usando la API de Meta
   * (Stub que puedes mejorar cuando tengas credenciales reales)
   */
  async sendMessage({ phone, template, variables }) {
    try {
      // Stub: solo guarda en BD
      const log = await WhatsAppLog.create({
        phone,
        template,
        payload: variables,
        status: 'pending'
      }).fetch();

      // Si tienes credenciales de Meta, reemplaza esto:
      // const response = await axios.post(
      //   'https://graph.facebook.com/v18.0/YOUR_PHONE_ID/messages',
      //   {
      //     messaging_product: 'whatsapp',
      //     to: phone,
      //     type: 'template',
      //     template: {
      //       name: template,
      //       language: { code: 'es' },
      //       components: [...]
      //     }
      //   },
      //   { headers: { Authorization: `Bearer ${YOUR_ACCESS_TOKEN}` } }
      // );

      await WhatsAppLog.updateOne({ id: log.id }).set({
        status: 'sent',
        response: { success: true }
      });

      return true;
    } catch (err) {
      sails.log.error('WhatsApp error:', err);
      return false;
    }
  }

};
