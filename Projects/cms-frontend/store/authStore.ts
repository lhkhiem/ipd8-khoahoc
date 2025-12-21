// Store quản lý trạng thái xác thực (Auth)
// - Sử dụng zustand cho state management
// - Lưu trữ thông tin user và token trong localStorage
// - Cung cấp các hàm login, register, logout

import { create } from 'zustand';
import axios from 'axios';
import { resolveApiBaseUrl } from '../lib/api';
// Note: Có thể dùng axiosInstance từ lib/axios.ts trong tương lai để tự động withCredentials
interface LoginResponse {
  user: User;
}

interface RegisterResponse {
  user: User;
}

interface User {
  id: string;
  email: string;
  name: string;
  role?: 'owner' | 'admin' | 'editor' | 'author';
}

// Interface định nghĩa store auth
interface AuthStore {
  user: User | null;       // Thông tin user hiện tại
  isLoading: boolean;      // Trạng thái loading
  error: string | null;    // Thông báo lỗi nếu có
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>; // Verify session from cookie
}

const getApiUrl = () => {
  const base = resolveApiBaseUrl();
  // Remove trailing slash if present
  let url = base.endsWith('/') ? base.slice(0, -1) : base;
  // If URL already ends with /api, don't add it again
  // This handles cases where NEXT_PUBLIC_API_URL already includes /api
  
  // Debug logging
  console.log('[AuthStore] getApiUrl:', {
    base,
    url,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  });
  
  return url;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  // Đăng nhập: gửi email + password lên API
  // - Thiết lập cookie HTTP-only từ server
  // - Update state với thông tin user
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const apiUrl = getApiUrl();
      // Check if /api is already in the URL
      const authPath = apiUrl.endsWith('/api') ? '/auth/login' : '/api/auth/login';
      const fullUrl = `${apiUrl}${authPath}`;
      
      // Debug logging
      console.log('[AuthStore] Login attempt:', {
        apiUrl,
        authPath,
        fullUrl,
        email,
        hasPassword: !!password,
      });
      
      const response = await axios.post(
        fullUrl,
        { email, password },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log('[AuthStore] Login response:', response.data);
      const { user } = response.data as LoginResponse;
      set({ user, isLoading: false });
    } catch (error: any) {
      console.error('[AuthStore] Login error:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
        baseURL: error?.config?.baseURL,
      });
      set({
        error: error.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại sau',
        isLoading: false,
      });
      throw error;
    }
  },

  // Đăng ký user mới
  // - Gọi API /auth/register
  // - Chỉ lưu thông tin user vào state, không tự động login
  register: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const apiUrl = getApiUrl();
      const authPath = apiUrl.endsWith('/api') ? '/auth/register' : '/api/auth/register';
      const response = await axios.post(`${apiUrl}${authPath}`, {
        email,
        password,
        name,
      });
        const { user } = response.data as RegisterResponse;
      set({ user, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại sau',
        isLoading: false,
      });
      throw error;
    }
  },

  // Đăng xuất: gọi API để xóa cookie và xóa user khỏi state
  logout: async () => {
    try {
      const apiUrl = getApiUrl();
      const authPath = apiUrl.endsWith('/api') ? '/auth/logout' : '/api/auth/logout';
      await axios.post(`${apiUrl}${authPath}`, {}, { withCredentials: true });
    } catch {}
    set({ user: null });
  },

  // Khôi phục session từ cookie
  hydrate: async () => {
    try {
      const apiUrl = getApiUrl();
      const authPath = apiUrl.endsWith('/api') ? '/auth/verify' : '/api/auth/verify';
      const fullUrl = `${apiUrl}${authPath}`;
      
      console.log('[AuthStore] Hydrating session:', { apiUrl, authPath, fullUrl });
      
      const res = await axios.get(fullUrl, { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('[AuthStore] Hydrate response:', res.data);
      const { user } = res.data as { user: User };
      set({ user });
      console.log('[AuthStore] Session hydrated, user:', user?.email);
    } catch (error: any) {
      // 401 (Unauthorized) và 429 (Too Many Requests) là expected responses
      // 401: chưa đăng nhập (bình thường)
      // 429: rate limit (có thể do nhiều components gọi cùng lúc, không phải lỗi nghiêm trọng)
      const status = error?.response?.status;
      if (status === 401) {
        // Không có session - đây là bình thường khi chưa đăng nhập
        console.log('[AuthStore] No active session (401) - user not logged in');
        set({ user: null });
      } else if (status === 429) {
        // Rate limit - không phải lỗi nghiêm trọng, chỉ log info
        console.log('[AuthStore] Rate limited (429) - will retry later');
        set({ user: null });
      } else {
        // Lỗi thực sự (network error, 500, etc.)
        console.error('[AuthStore] Hydrate failed:', {
          message: error?.message,
          response: error?.response?.data,
          status: error?.response?.status,
          url: error?.config?.url,
        });
        set({ user: null });
      }
    }
  },
}));

