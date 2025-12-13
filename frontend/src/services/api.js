import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,      // ya incluye /api
  withCredentials: true, // importante para cookies HttpOnly
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token JWT automáticamente en Authorization
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;