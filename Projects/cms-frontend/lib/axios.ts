/**
 * Axios instance với default configuration
 * - Tự động gửi credentials (cookies) trong mọi request
 * - Bám sát yêu cầu kiến trúc: CMS backend <-> CMS frontend
 */

import axios from 'axios';
import { resolveApiBaseUrl } from './api';

// Tạo axios instance với default config
const axiosInstance = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true, // Tự động gửi cookies trong mọi request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để log trong development
if (process.env.NODE_ENV === 'development') {
  axiosInstance.interceptors.request.use(
    (config) => {
      console.log('[Axios] Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        withCredentials: config.withCredentials,
      });
      return config;
    },
    (error) => {
      console.error('[Axios] Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor để log errors
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        console.log('[Axios] 401 Unauthorized - No valid session');
      } else if (error.response?.status !== 401 && error.response?.status !== 429) {
        console.error('[Axios] Response error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
      }
      return Promise.reject(error);
    }
  );
}

export default axiosInstance;


