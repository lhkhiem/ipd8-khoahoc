'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AuthGuard component - Protects routes by checking authentication
 * - Verifies session on mount using cookie
 * - Redirects to /login if not authenticated
 * - Shows loading state while checking auth
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter();
  const { user, hydrate } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;
    
    const checkAuth = async () => {
      try {
        // If no user in store, try to hydrate from cookie
        if (!user) {
          await hydrate();
          
          if (!isMounted) return;
          
          // After hydration, check if we have a user
          const currentUser = useAuthStore.getState().user;
          
          if (!currentUser) {
            // No valid session, redirect to login
            // 401 is expected when not logged in, don't log as error
            router.push('/login');
            return;
          }
        }
      } catch (error: unknown) {
        if (!isMounted) return;
        
        // 401 (Unauthorized) và 429 (Too Many Requests) là expected responses
        // Không nên log như error
        const axiosError = error as { response?: { status?: number; data?: unknown }; message?: string; stack?: string };
        const status = axiosError?.response?.status;
        if (status !== 401 && status !== 429) {
          // Chỉ log các lỗi thực sự (network error, 500, etc.)
          console.error('[AuthGuard] Auth check failed:', {
            message: axiosError?.message,
            stack: axiosError?.stack,
            response: axiosError?.response?.data,
            status: axiosError?.response?.status,
          });
        }
        router.push('/login');
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    // Debounce để tránh gọi hydrate quá nhiều lần khi component re-render
    timeoutId = setTimeout(() => {
      checkAuth();
    }, 100);
    
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, hydrate, router]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Verifying authentication...</p>
          </div>
        </div>
      )
    );
  }

  // Only render children if user is authenticated
  if (!user) {
    return null;
  }

  return <>{children}</>;
}


