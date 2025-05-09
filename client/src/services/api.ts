import axios, { AxiosError } from 'axios';
import { getCookie, deleteCookie } from 'cookies-next';

const api = axios.create({
  baseURL: `/api`, // Adjust if needed for production
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getCookie('token');
    // console.log(token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    
    if (error.response?.status === 401) {
      const token = getCookie('jwt');

      if (token) {
        deleteCookie('jwt');
      }
    }
    return Promise.reject(error);
  }
);

export default api;