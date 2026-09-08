import axios from 'axios';

// Resolve base URL from environment variables, defaulting to '/api' for Vite proxy
const baseURL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '/api';

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach bearer token if available
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('careerpilot_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore localStorage access failures in restricted environments
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract response or normalize error
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred';

    return Promise.reject({
      status: error.response?.status,
      message,
      data: error.response?.data,
    });
  }
);

export default api;
