/**
 * NotificationControllerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

  // GET /api/v1/notifications
  async list(req, res) {
    try {
      const list = await Notification.find({ user: req.me.id })
        .sort('createdAt DESC')
        .limit(50);

      return res.ok(list);
    } catch (err) {
      sails.log.error(err);
      return res.serverError();
    }
  },

  // PUT /api/v1/notifications/:id/read
  async markAsRead(req, res) {
    try {
      const id = req.params.id;

      const notif = await Notification.updateOne({
        id,
        user: req.me.id
      }).set({ isRead: true });

      if (!notif) return res.notFound();

      return res.ok({ message: 'Notificación marcada como leída' });
    } catch (err) {
      sails.log.error(err);
      return res.serverError();
    }
  },

  // DELETE /api/v1/notifications/:id
  async delete(req, res) {
    try {
      await Notification.destroyOne({ id: req.params.id, user: req.me.id });
      return res.ok({ message: 'Notificación eliminada' });
    } catch (err) {
      sails.log.error(err);
      return res.serverError();
    }
  }

};
