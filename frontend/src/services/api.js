import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRequestInterceptorSet = false;
let isResponseInterceptorSet = false;

if (!isRequestInterceptorSet) {
  api.interceptors.request.use(
    (config) => {
      if (config.url && !config.url.includes('auth/login') && !config.url.includes('auth/refresh')) {
        const rawToken = localStorage.getItem('token');
        
        if (rawToken && rawToken !== 'undefined' && rawToken !== 'null') {
          if (rawToken.includes('.') && rawToken.length > 100) {
            config.headers.Authorization = `Bearer ${rawToken}`;
          }
        }
      }
      
      return config;
    },
    (error) => {
      console.error('Error en interceptor de REQUEST:', error);
      return Promise.reject(error);
    }
  );
  
  isRequestInterceptorSet = true;
}

if (!isResponseInterceptorSet) {
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (originalRequest.url === 'auth/refresh') {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        try {
          const refreshResponse = await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            { 
              withCredentials: true,
              headers: { 'Content-Type': 'application/json' }
            }
          );
          
          if (refreshResponse.data.success) {
            localStorage.setItem('token', refreshResponse.data.accessToken);
            
            if (refreshResponse.data.user?.role) {
              localStorage.setItem('role', refreshResponse.data.user.role);
            }
            
            originalRequest._retry = true;
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
            
            return api(originalRequest);
          }
        } catch (refreshError) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          
          if (refreshError.response?.status === 401) {
            alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          }
          
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  isResponseInterceptorSet = true;
}

export default api;