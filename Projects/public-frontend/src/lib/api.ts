/**
 * API Helper for Public Frontend
 * Centralized API configuration and helper functions
 */

// Support both NEXT_PUBLIC_API_URL and NEXT_PUBLIC_API_BASE_URL for compatibility
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3101/api';

/**
 * Build full API URL
 */
export const buildApiUrl = (path: string): string => {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

/**
 * Make API request with error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const url = buildApiUrl(endpoint);
    
    // Log the request URL in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[API] Requesting:', url);
    }
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Important for cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      return {
        success: false,
        error: `Invalid response format: ${response.status} ${response.statusText}`,
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `Request failed: ${response.statusText}`,
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error: any) {
    // Handle different types of fetch errors
    let errorMessage = 'Network error occurred';
    const apiUrl = buildApiUrl(endpoint);
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      // This usually means server is not running, CORS issue, or network problem
      errorMessage = `Unable to connect to API at ${apiUrl}`;
      
      // Only log detailed error in development and not for auth endpoints (expected to fail)
      if (process.env.NODE_ENV === 'development' && !endpoint.includes('/auth/me')) {
        console.warn(
          `[API] Connection failed to ${endpoint}\n` +
          `Possible causes: API server not running, CORS issue, or network problem\n` +
          `URL: ${apiUrl}`
        );
      }
    } else if (error.message) {
      errorMessage = error.message;
      // Only log non-network errors
      if (process.env.NODE_ENV === 'development' && !endpoint.includes('/auth/me')) {
        console.error('[API] Request error:', {
          endpoint,
          url: apiUrl,
          error: error.message,
          type: error.constructor.name,
        });
      }
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Auth API functions
 */
export const authApi = {
  /**
   * Register new user
   */
  register: async (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    location?: string;
    age?: number;
  }) => {
    return apiRequest<{
      token: string;
      user: {
        id: string;
        email: string;
        name: string;
        phone?: string;
        role: string;
      };
    }>('/public/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Login user
   * Support login by email or phone
   */
  login: async (data: { email?: string; phone?: string; password: string }) => {
    return apiRequest<{
      token: string;
      user: {
        id: string;
        email: string;
        name: string;
        phone?: string;
        role: string;
        avatar_url?: string;
      };
    }>('/public/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Logout user
   */
  logout: async () => {
    return apiRequest('/public/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Get current user
   */
  getMe: async () => {
    return apiRequest<{
      id: string;
      email: string;
      name: string;
      phone?: string;
      address?: string;
      gender?: string;
      dob?: string;
      avatar_url?: string;
      role: string;
      is_active: boolean;
      email_verified: boolean;
      phone_verified: boolean;
      last_login_at?: string;
      created_at: string;
    }>('/public/auth/me', {
      method: 'GET',
    });
  },
};

