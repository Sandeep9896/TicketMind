import axiosClient from './axiosClient';

export const createTicketRequest = async (payload) => {
  const response = await axiosClient.post('/tickets', payload);
  return response.data;
};

export const myTicketsRequest = async () => {
  const response = await axiosClient.get('/tickets/my');
  return response.data;
};

export const adminTicketsRequest = async () => {
  const response = await axiosClient.get('/tickets');
  return response.data;
};

export const updateStatusRequest = async ({ ticketId, status }) => {
  const response = await axiosClient.patch(`/tickets/${ticketId}/status`, { status });
  return response.data;
};

export const assignTicketRequest = async ({ ticketId, agentId }) => {
  const response = await axiosClient.patch(`/tickets/${ticketId}/assign`, { agentId });
  return response.data;
};

export const addCommunicationRequest = async ({ ticketId, communication }) => {
  const response = await axiosClient.post(`/tickets/${ticketId}/communications`, { communication });
  return response.data;
};
