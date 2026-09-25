import Conversation from '../models/conversation.model.js';

const toMessage = ({ role, content, action = null, metadata = {} }) => ({
  role,
  content: content.trim(),
  action,
  metadata,
  createdAt: new Date()
});

const appendConversationMessages = async ({ ticketId, userId, messages }) => {
  if (!ticketId || !userId || !Array.isArray(messages) || messages.length === 0) {
    return null;
  }

  const validMessages = messages
    .filter((message) => message?.role && message?.content?.trim())
    .map(toMessage);

  if (validMessages.length === 0) {
    return null;
  }

  return Conversation.findOneAndUpdate(
    { ticketId, userId },
    {
      $setOnInsert: { ticketId, userId },
      $push: { messages: { $each: validMessages } }
    },
    { upsert: true, new: true }
  );
};

const createTicketConversation = async ({ ticket, userId, content }) => {
  const conversation = await appendConversationMessages({
    ticketId: ticket._id,
    userId,
    messages: [
      {
        role: 'user',
        content: content || ticket.description,
        action: 'ticket_created',
        metadata: {
          title: ticket.title,
          priority: ticket.priority,
          category: ticket.category,
          status: ticket.status
        }
      }
    ]
  });

  return conversation;
};

const appendTicketCommunication = async ({ ticketId, userId, communication, senderRole }) => {
  const role = senderRole === 'user' ? 'user' : 'assistant';

  return appendConversationMessages({
    ticketId,
    userId,
    messages: [
      {
        role,
        content: communication,
        action: 'communication_added',
        metadata: { senderRole }
      }
    ]
  });
};

const getConversationContext = async ({ ticketId, userId, limit = 30 }) => {
  if (!ticketId || !userId) return '';

  const conversation = await Conversation.findOne({ ticketId, userId }).lean();

  return (conversation?.messages || [])
    .slice(-limit)
    .map((message) => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`)
    .join('\n\n');
};

const getConversationMessages = async ({ ticketId, userId }) => {
  if (!ticketId || !userId) {
    return [];
  }

  const conversation = await Conversation.findOne({ ticketId, userId }).lean();

  return (conversation?.messages || []).map((message) => ({
    role: message.role,
    content: message.content,
    action: message.action,
    metadata: message.metadata,
    createdAt: message.createdAt
  }));
};

export {
  appendConversationMessages,
  appendTicketCommunication,
  createTicketConversation,
  getConversationContext,
  getConversationMessages
};
