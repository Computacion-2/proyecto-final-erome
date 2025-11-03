import axios, { type AxiosInstance } from 'axios';

const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
// In dev, call backend REST directly to avoid proxy/CORS issues.
const API_BASE_URL = isDev
  ? 'http://localhost:8081/pensamientoComputacional-0.0.1-SNAPSHOT/api'
  : (import.meta.env.VITE_API_BASE_URL || '/api');

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores y refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: any = error.config || {};

    // Si es error de red, propagar un mensaje claro
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return Promise.reject(new Error('No se puede conectar con el servidor. Verifica que el backend esté en 8081.'));
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await api.post(
            '/auth/refresh',
            { refreshToken }
          );
          const { token, refreshToken: newRefreshToken } = response.data as any;
          localStorage.setItem('accessToken', token);
          localStorage.setItem('refreshToken', newRefreshToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

