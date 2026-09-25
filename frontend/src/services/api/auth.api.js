import axiosClient from './axiosClient';

export const registerRequest = async (payload) => {
  const response = await axiosClient.post('/auth/register', payload);
  return response.data;
};

export const loginRequest = async (payload) => {
  const response = await axiosClient.post('/auth/login', payload);
  return response.data;
};

export const meRequest = async () => {
  const response = await axiosClient.get('/auth/me');
  return response.data;
};

export const adminAgentsRequest = async () => {
  const response = await axiosClient.get('/auth/agents');
  return response.data;
};

export const changePasswordRequest = async (payload) => {
  const response = await axiosClient.post('/auth/change-password', payload);
  return response.data;
};

export const googleLoginRequest = async (token) => {
  const response = await axiosClient.post('/auth/google-login', { credential: token });
  return response.data;
}

export const forgetPasswordRequest = async (email) => {
  const response = await axiosClient.post('/auth/forgot-password', { email });
  return response.data;
}

export const resetPasswordRequest = async (payload) => {
  const response = await axiosClient.post('/auth/reset-password', payload);
  return response.data;
}
