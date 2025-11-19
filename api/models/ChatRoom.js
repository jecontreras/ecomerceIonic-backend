module.exports = {
  attributes: {
    order: {
      model: 'order'
    },
    seller: {
      model: 'user',
    },
    client: {
      model: 'user',
    },
    company: {
      model: 'company',
    },
    lastMessage: {
      type: 'string'
    },
    lastMessageAt: {
      type: 'ref',
      columnType: 'datetime'
    },
    messages: {
      collection: 'chatmessage',
      via: 'room'
    }
  }
};
