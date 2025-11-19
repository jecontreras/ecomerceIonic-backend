module.exports = {

  attributes: {

    room: {
      model: 'chatroom',
      required: true
    },

    sender: {
      model: 'user',
      required: true
    },

    message: {
      type: 'string',
      required: true
    },

    isRead: { 
      type: 'boolean', 
      defaultsTo: false 
    },

    attachments: { 
      type: 'json', 
      defaultsTo: [] 
    },

    thread: {
      collection: 'chatthread',
      via: 'messages'
    },

  }
};
