import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('talent_ai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      // Only redirect if not already on login or public pages
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register') &&
        window.location.pathname !== '/'
      ) {
        localStorage.removeItem('talent_ai_token');
        localStorage.removeItem('talent_ai_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
