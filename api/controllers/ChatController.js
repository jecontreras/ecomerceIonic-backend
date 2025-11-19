/**
 * ChatController.js
 */

module.exports = {

  // listar las salas donde participa el usuario
  async myRooms(req, res) {
    const userId = req.me.id;

    const rooms = await ChatRoom.find({
      or: [
        { seller: userId },
        { client: userId },
        { company: userId }
      ]
    })
    .sort('lastMessageAt DESC')
    .populate('seller')
    .populate('client')
    .populate('company');

    return res.ok(rooms);
  },

  // obtener mensajes de una room
  async messages(req, res) {
    const roomId = req.params.id;

    const messages = await ChatMessage.find({
      room: roomId
    })
    .sort('createdAt ASC')
    .populate('sender');

    return res.ok(messages);
  },

  // enviar mensaje
  async send(req, res) {
    const { roomId, message, attachments } = req.body;

    const msg = await ChatService.sendMessage({
      roomId,
      senderId: req.me.id,
      message,
      attachments
    });

    return res.ok(msg);
  },

  // marcar mensajes como leídos
  async read(req, res) {
    const roomId = req.params.id;

    await ChatService.markAsRead(roomId, req.me.id);

    return res.ok({});
  }

};
