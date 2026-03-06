import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE } from '../config/api';
import { getToken, clearAuth } from '../utils/storage';

// Globální handler pro 401 — AuthContext ho zaregistruje pro force-logout
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: přidá JWT token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: 401 → odhlášení přes AuthContext
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await clearAuth();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
