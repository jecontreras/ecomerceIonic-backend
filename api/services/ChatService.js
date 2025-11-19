module.exports = {

  async sendMessage({ roomId, senderId, message, attachments = [] }) {

    // crear mensaje
    const msg = await ChatMessage.create({
      room: roomId,
      sender: senderId,
      message,
      attachments
    }).fetch();

    // actualizar room
    await ChatRoom.updateOne({ id: roomId }).set({
      lastMessage: message,
      lastMessageAt: new Date()
    });

    // emitir mensaje por socket
    sails.sockets.broadcast(`room-${roomId}`, 'newMessage', {
      ...msg,
      sender: senderId
    });

    return msg;
  },

  async markAsRead(roomId, userId) {
    await ChatMessage.update({
      room: roomId,
      sender: { '!=': userId },
      isRead: false
    }).set({ isRead: true });

    // emitir evento de lectura
    sails.sockets.broadcast(`room-${roomId}`, 'messagesRead', {
      roomId,
      userId
    });
  }

};
