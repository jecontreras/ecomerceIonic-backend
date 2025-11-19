module.exports = {

  /**
   * Crear una notificación interna y opcionalmente enviar WhatsApp
   */
  async notify({ userId, type, title, message, data = {}, sendWhatsApp = false }) {
    // 1. Crear notificación interna
    const notif = await Notification.create({
      user: userId,
      type,
      title,
      message,
      data,
    }).fetch();

    // 2. (Opcional) WhatsApp
    if (sendWhatsApp) {
      await this.sendViaWhatsApp(userId, message, data);
    }

    // 3. Retornar
    return notif;
  },

  /**
   * Enviar un mensaje WhatsApp (usando WhatsAppService)
   */
  async sendViaWhatsApp(userId, message, data) {
    const user = await User.findOne({ id: userId });
    if (!user || !user.phone) return;

    return await WhatsAppService.sendMessage({
      phone: user.phone,
      template: 'default_message',
      variables: { message, ...data }
    });
  },

  /**
   * Usar plantilla desde NotificationTemplate
   */
  async notifyTemplate({ key, userId, data = {}, sendWhatsApp = false }) {
    const tpl = await NotificationTemplate.findOne({ key });
    if (!tpl) throw new Error('Template no encontrado: ' + key);

    let title = tpl.titleTemplate;
    let message = tpl.messageTemplate;

    // reemplazar {{variable}}
    Object.keys(data).forEach(k => {
      const placeholder = '{{' + k + '}}';
      title = title.replace(new RegExp(placeholder, 'g'), data[k]);
      message = message.replace(new RegExp(placeholder, 'g'), data[k]);
    });

    return await this.notify({
      userId,
      type: key.split('.')[0],
      title,
      message,
      data,
      sendWhatsApp
    });
  },

};
