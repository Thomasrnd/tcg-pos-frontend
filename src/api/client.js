import axios from 'axios';
import config from '../config/env';

// Create axios instance with base URL from environment variables
const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor to inject auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle 401 unauthorized errors (token expired, etc.)
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;