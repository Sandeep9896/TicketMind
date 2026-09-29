import axiosClient from './axiosClient';

export const analyzeTicketRequest = async (description) => {
  const response = await axiosClient.post('/ai/analyze', { description });
  return response.data;
};

export const suggestDescriptionsRequest = async (title) => {
  const response = await axiosClient.post('/ai/suggest-descriptions', { title });
  return response.data;
};

export const chatReplyRequest = async (payload) => {
  const response = await axiosClient.post('/ai/reply', payload);
  return response.data;
};

export const createTicketFromChatbotRequest = async (description) =>
  (await axiosClient.post('/ai/reply', { description, forceCreateTicket: true })).data;

export const getTicketConversationRequest = async (ticketId) => {
  const response = await axiosClient.get(`/ai/conversation/${ticketId}`);
  return response.data;
};

export const getChatHistoryRequest = async (ticketId) =>
  (await axiosClient.get(`/ai/chat/history/${ticketId}`)).data;
export const sendChatMessageRequest = async (ticketId, content) =>
  (await axiosClient.post('/ai/chat/message', { ticketId, content })).data;
