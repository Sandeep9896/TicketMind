import axios from 'axios';

const axiosClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:4000/api/v1',

  headers: {
    'Content-Type': 'application/json'
  },

  withCredentials: true // IMPORTANT
});


// REQUEST INTERCEPTOR
axiosClient.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('tm_access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);


// RESPONSE INTERCEPTOR
axiosClient.interceptors.response.use(

  (response) => response,

  async (error) => {

    const originalRequest = error.config;

    // Access token expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true;

      try {

        // CALL REFRESH TOKEN API
        const response = await axios.post(
          'http://localhost:4000/api/v1/auth/refresh-token',
          {},
          {
            withCredentials: true
          }
        );

        const newAccessToken =
          response.data.data.accessToken;

        // SAVE NEW TOKEN
        localStorage.setItem(
          'tm_access_token',
          newAccessToken
        );

        // UPDATE HEADER
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        // RETRY ORIGINAL REQUEST
        return axiosClient(originalRequest);

      } catch (refreshError) {

        // refresh token expired

        localStorage.removeItem('tm_access_token');

        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;