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
    userType?: 'pregnant' | 'mom';
    dueDate?: string; // YYYY-MM-DD
    childAge?: number; // in months
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

/**
 * Profile API functions
 */
export const profileApi = {
  /**
   * Get user profile
   */
  getProfile: async () => {
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
    }>('/public/profile', {
      method: 'GET',
    });
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: {
    name?: string;
    phone?: string;
    address?: string;
    gender?: string;
    dob?: string;
  }) => {
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
    }>('/public/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Upload avatar
   */
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    // For FormData, we need to use fetch directly to avoid JSON.stringify
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3101/api';
    const url = `${API_BASE_URL}/public/profile/avatar`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include', // Important for cookies
        body: formData,
        // Don't set Content-Type header - browser will set it automatically with boundary for FormData
      });

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
      return {
        success: false,
        error: error.message || 'Network error occurred',
      };
    }
  },
};

/**
 * User Profile API functions
 */
export const userProfileApi = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    return apiRequest<{
      id: string;
      user_id: string;
      user_type: 'pregnant' | 'mom' | 'both';
      current_due_date?: string;
      current_pregnancy_start_date?: string;
      notes?: string;
      created_at: string;
      updated_at: string;
    }>('/public/users/me/profile', {
      method: 'GET',
    });
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: {
    user_type?: 'pregnant' | 'mom' | 'both';
    current_due_date?: string;
    current_pregnancy_start_date?: string;
    notes?: string;
  }) => {
    return apiRequest<{
      id: string;
      user_id: string;
      user_type: 'pregnant' | 'mom' | 'both';
      current_due_date?: string;
      current_pregnancy_start_date?: string;
      notes?: string;
      created_at: string;
      updated_at: string;
    }>('/public/users/me/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all pregnancies
   */
  getPregnancies: async () => {
    return apiRequest<Array<{
      id: string;
      user_id: string;
      user_profile_id?: string;
      due_date: string;
      start_date?: string;
      pregnancy_weeks?: number;
      status: 'active' | 'completed' | 'cancelled';
      actual_delivery_date?: string;
      notes?: string;
      created_at: string;
      updated_at: string;
    }>>('/public/users/me/pregnancies', {
      method: 'GET',
    });
  },

  /**
   * Create pregnancy
   */
  createPregnancy: async (data: {
    due_date: string;
    start_date?: string;
    pregnancy_weeks?: number;
    notes?: string;
  }) => {
    return apiRequest<{
      id: string;
      user_id: string;
      user_profile_id?: string;
      due_date: string;
      start_date?: string;
      pregnancy_weeks?: number;
      status: 'active' | 'completed' | 'cancelled';
      actual_delivery_date?: string;
      notes?: string;
      created_at: string;
      updated_at: string;
    }>('/public/users/me/pregnancies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update pregnancy
   */
  updatePregnancy: async (id: string, data: {
    due_date?: string;
    start_date?: string;
    pregnancy_weeks?: number;
    status?: 'active' | 'completed' | 'cancelled';
    actual_delivery_date?: string;
    notes?: string;
  }) => {
    return apiRequest<{
      id: string;
      user_id: string;
      user_profile_id?: string;
      due_date: string;
      start_date?: string;
      pregnancy_weeks?: number;
      status: 'active' | 'completed' | 'cancelled';
      actual_delivery_date?: string;
      notes?: string;
      created_at: string;
      updated_at: string;
    }>(`/public/users/me/pregnancies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete pregnancy
   */
  deletePregnancy: async (id: string) => {
    return apiRequest('/public/users/me/pregnancies/' + id, {
      method: 'DELETE',
    });
  },

  /**
   * Get all children
   */
  getChildren: async () => {
    return apiRequest<Array<{
      id: string;
      user_id: string;
      user_profile_id?: string;
      pregnancy_id?: string;
      name: string;
      birth_date: string;
      gender?: 'male' | 'female' | 'other';
      age_in_months?: number;
      notes?: string;
      created_at: string;
      updated_at: string;
    }>>('/public/users/me/children', {
      method: 'GET',
    });
  },

  /**
   * Create child
   */
  createChild: async (data: {
    name: string;
    birth_date: string;
    gender?: 'male' | 'female' | 'other';
    age_in_months?: number;
    pregnancy_id?: string;
    notes?: string;
  }) => {
    return apiRequest<{
      id: string;
      user_id: string;
      user_profile_id?: string;
      pregnancy_id?: string;
      name: string;
      birth_date: string;
      gender?: 'male' | 'female' | 'other';
      age_in_months?: number;
      notes?: string;
      created_at: string;
      updated_at: string;
    }>('/public/users/me/children', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update child
   */
  updateChild: async (id: string, data: {
    name?: string;
    birth_date?: string;
    gender?: 'male' | 'female' | 'other';
    age_in_months?: number;
    pregnancy_id?: string;
    notes?: string;
  }) => {
    return apiRequest<{
      id: string;
      user_id: string;
      user_profile_id?: string;
      pregnancy_id?: string;
      name: string;
      birth_date: string;
      gender?: 'male' | 'female' | 'other';
      age_in_months?: number;
      notes?: string;
      created_at: string;
      updated_at: string;
    }>(`/public/users/me/children/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete child
   */
  deleteChild: async (id: string) => {
    return apiRequest('/public/users/me/children/' + id, {
      method: 'DELETE',
    });
  },
};

/**
 * Enrollment API functions
 */
export const enrollmentApi = {
  /**
   * Get my enrollments
   */
  getMyEnrollments: async () => {
    return apiRequest<Array<{
      id: string;
      user_id: string;
      course_id: string;
      type: string;
      status: string;
      progress_percent: number;
      created_at: string;
      updated_at: string;
      course?: {
        id: string;
        title: string;
        slug: string;
        thumbnail_url?: string;
        price: number;
        duration_minutes?: number;
      };
    }>>('/public/enrollments/my', {
      method: 'GET',
    });
  },

  /**
   * Get enrollment progress
   */
  getEnrollmentProgress: async (enrollmentId: string) => {
    return apiRequest<{
      enrollment: {
        id: string;
        progress_percent: number;
        status: string;
      };
      progresses: Array<{
        id: string;
        enrollment_id: string;
        module_id?: string;
        session_id?: string;
        status: string;
        completed_at?: string;
        module?: {
          id: string;
          title: string;
          order: number;
        };
        session?: {
          id: string;
          title: string;
          start_time: string;
          end_time: string;
        };
      }>;
    }>(`/public/enrollments/${enrollmentId}/progress`, {
      method: 'GET',
    });
  },

  /**
   * Create enrollment
   */
  createEnrollment: async (data: {
    courseId: string;
    type: string;
  }) => {
    return apiRequest<{
      id: string;
      user_id: string;
      course_id: string;
      type: string;
      status: string;
      progress_percent: number;
      created_at: string;
      updated_at: string;
    }>('/public/enrollments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cancel enrollment
   */
  cancelEnrollment: async (enrollmentId: string) => {
    return apiRequest(`/public/enrollments/${enrollmentId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Courses API functions
 */
export const coursesApi = {
  /**
   * Get course sessions
   */
  getCourseSessions: async (courseId: string) => {
    return apiRequest<Array<{
      id: string;
      course_id: string;
      instructor_id?: string;
      order?: number;
      title: string;
      description?: string;
      start_time: string;
      end_time: string;
      location?: string;
      capacity: number;
      enrolled_count: number;
      status: 'scheduled' | 'full' | 'cancelled' | 'done';
      meeting_link?: string;
      meeting_type?: 'google-meet' | 'zoom' | 'offline';
      created_at: string;
      updated_at: string;
      instructor?: {
        id: string;
        title: string;
        credentials?: string;
      };
    }>>(`/public/courses/${courseId}/sessions`, {
      method: 'GET',
    });
  },
};

/**
 * Payment API functions
 */
export const paymentApi = {
  /**
   * Get my orders
   */
  getMyOrders: async () => {
    return apiRequest<Array<{
      id: string;
      user_id: string;
      order_number: string;
      total_amount: number;
      status: string;
      payment_method?: string;
      created_at: string;
      updated_at: string;
      items?: Array<{
        id: string;
        order_id: string;
        course_id: string;
        enrollment_type: string;
        price: number;
        quantity: number;
        course?: {
          id: string;
          title: string;
          slug: string;
          thumbnail_url?: string;
        };
      }>;
      payments?: Array<{
        id: string;
        order_id: string;
        amount: number;
        payment_method: string;
        status: string;
        transaction_id?: string;
        paid_at?: string;
        created_at: string;
        updated_at: string;
      }>;
    }>>('/public/payments/orders/my', {
      method: 'GET',
    });
  },
};

/**
 * Helper function to get all user sessions from all enrolled courses
 */
export const getAllUserSessions = async () => {
  try {
    // Get all enrollments
    const enrollmentsResult = await enrollmentApi.getMyEnrollments()
    if (!enrollmentsResult.success || !enrollmentsResult.data) {
      return []
    }

    // Get sessions for each enrolled course
    const allSessions: Array<{
      id: string;
      title: string;
      course: string;
      course_id: string;
      date: string;
      time: string;
      endTime?: string;
      duration: string;
      instructor: string;
      location?: string;
      capacity: number;
      enrolled: number;
      type: 'group' | 'one-on-one';
      status: 'upcoming' | 'ongoing' | 'completed' | 'full' | 'cancelled';
      meetingLink?: string;
      meetingType?: 'google-meet' | 'zoom';
    }> = []

    for (const enrollment of enrollmentsResult.data) {
      if (!enrollment.course || enrollment.status !== 'active') continue

      const sessionsResult = await coursesApi.getCourseSessions(enrollment.course_id)
      if (!sessionsResult.success || !sessionsResult.data) continue

      for (const session of sessionsResult.data) {
        const startDate = new Date(session.start_time)
        const endDate = new Date(session.end_time)
        const durationMs = endDate.getTime() - startDate.getTime()
        const durationMinutes = Math.round(durationMs / (1000 * 60))
        const durationText = durationMinutes >= 60 
          ? `${Math.floor(durationMinutes / 60)} giờ ${durationMinutes % 60} phút`
          : `${durationMinutes} phút`

        // Map status
        let status: 'upcoming' | 'ongoing' | 'completed' | 'full' | 'cancelled' = 'upcoming'
        if (session.status === 'cancelled') {
          status = 'cancelled'
        } else if (session.status === 'done') {
          status = 'completed'
        } else if (session.status === 'full') {
          status = 'full'
        } else if (session.status === 'scheduled') {
          const now = new Date()
          if (now >= startDate && now <= endDate) {
            status = 'ongoing'
          } else {
            status = 'upcoming'
          }
        }

        allSessions.push({
          id: session.id,
          title: session.title,
          course: enrollment.course.title,
          course_id: enrollment.course_id,
          date: startDate.toISOString().split('T')[0],
          time: startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
          endTime: endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false }),
          duration: durationText,
          instructor: session.instructor?.title || 'Chưa có giảng viên',
          location: session.location || 'Chưa có địa điểm',
          capacity: session.capacity,
          enrolled: session.enrolled_count,
          type: session.capacity > 1 ? 'group' : 'one-on-one',
          status,
          meetingLink: session.meeting_link,
          meetingType: session.meeting_type as 'google-meet' | 'zoom' | undefined,
        })
      }
    }

    // Sort by date and time
    allSessions.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`).getTime()
      const dateB = new Date(`${b.date}T${b.time}`).getTime()
      return dateA - dateB
    })

    return allSessions
  } catch (error) {
    console.error('Error getting all user sessions:', error)
    return []
  }
}

