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

export const getTicketConversationRequest = async (ticketId) => {
  const response = await axiosClient.get(`/ai/conversation/${ticketId}`);
  return response.data;
};
