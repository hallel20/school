import axios from 'axios';
import { getCookie, deleteCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// Function to check if a token is expired
const isTokenExpired = (token: string): boolean => {
  const decodedToken = jwtDecode(token);
  const currentTime = Date.now() / 1000;
  return decodedToken.exp! < currentTime;
};

api.interceptors.request.use(
  (config) => {
    const token = getCookie('token');
    // If the access token is expired, redirect to login
    if (token && isTokenExpired(token as string)) {
      deleteCookie('token'); // Clear expired token
      localStorage.removeItem('user'); // Clear user data
      if (window.location.pathname !== '/login') {
        // Prevent redirect loop
        window.location.href = '/login'; // Redirect to login page
      }
      return config;
    }
    console.log(import.meta.env.VITE_API_BASE_URL)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to an expired access token, redirect to login
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      localStorage.removeItem("accessToken"); // Clear expired token
      if (window.location.pathname !== '/login') {
        // Prevent redirect loop
        window.location.href = '/login'; // Redirect to login page
      }
    }
    return Promise.reject(error);
  })


export default api;