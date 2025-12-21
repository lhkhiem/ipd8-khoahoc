'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, user, hydrate } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        await hydrate();
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          // Already authenticated, redirect to dashboard
          console.log('[LoginPage] User already authenticated, redirecting to dashboard');
          router.push('/dashboard');
        } else {
          // Not authenticated - this is normal, stay on login page
          console.log('[LoginPage] No active session, showing login form');
        }
      } catch (error: any) {
        // 401 errors are expected when not logged in, don't treat as error
        if (error?.response?.status !== 401) {
          console.error('[LoginPage] Auth check error:', error);
        }
        // Not authenticated, stay on login page
      }
    };
    
    checkExistingAuth();
  }, [hydrate, router]);

  // Avoid SSR hydration mismatch due to password-manager/browser extensions injecting attributes
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    console.log('[LoginPage] Form submitted:', { email, hasPassword: !!password });

    try {
      console.log('[LoginPage] Calling login function...');
      await login(email, password);
      console.log('[LoginPage] Login successful, verifying session...');
      
      // Wait a bit for cookie to be set by browser
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verify session by calling hydrate
      try {
        await hydrate();
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) {
          console.warn('[LoginPage] Session not verified after login, retrying...');
          await new Promise(resolve => setTimeout(resolve, 300));
          await hydrate();
        }
      } catch (hydrateError: any) {
        console.warn('[LoginPage] Hydrate failed, but continuing with redirect:', hydrateError?.message);
      }
      
      // Check if there's a redirect URL in the query params
      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get('redirect') || '/dashboard';
      
      console.log('[LoginPage] Redirecting to:', redirectUrl);
      
      // After successful login, redirect to intended page or dashboard
      // Use window.location.href instead of router.push to ensure full page reload
      // This ensures middleware can read the cookie
      window.location.href = redirectUrl;
    } catch (err: any) {
      console.error('[LoginPage] Login failed:', {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
        url: err?.config?.url,
      });
      setLocalError(err?.response?.data?.error || 'Email hoặc mật khẩu không chính xác');
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32">
            <Image src="/logo.png" alt={process.env.NEXT_PUBLIC_SITE_NAME || 'CMS'} fill className="object-contain" priority />
          </div>
        </div>

        <div className="bg-card dark:bg-slate-800/50 border border-border dark:border-slate-700 rounded-lg shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-foreground mb-2 text-center">Bảng điều khiển CMS</h1>
          <p className="text-muted-foreground dark:text-slate-400 text-center mb-6">Đăng nhập vào tài khoản của bạn</p>

          {(error || localError) && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
              {error || localError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Địa chỉ Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="abc@example.com" className="w-full rounded border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" autoComplete="username" required suppressHydrationWarning />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">Mật khẩu</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded border border-input bg-background text-foreground px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" autoComplete="current-password" required suppressHydrationWarning />
            </div>

            <button type="submit" disabled={isLoading} className="w-full rounded bg-primary text-primary-foreground px-3 py-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200">
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* ============================================
              TEST USER INFO - XÓA KHI HOÀN THÀNH DỰ ÁN
              ============================================ */}
          <div className="mt-6 pt-6 border-t border-border dark:border-slate-700">
            <p className="text-center text-sm text-muted-foreground dark:text-slate-400">
              Thông tin đăng nhập test:
            </p>
            <div className="mt-3 space-y-1.5 text-center">
              <p className="text-xs text-muted-foreground dark:text-slate-400">
                Email: <span className="text-foreground dark:text-slate-200 font-mono">test1766026824022@example.com</span>
              </p>
              <p className="text-xs text-muted-foreground dark:text-slate-400">
                Mật khẩu: <span className="text-foreground dark:text-slate-200 font-mono">Test123!</span>
              </p>
              <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                ⚠️ Chỉ dùng cho môi trường test/development
              </p>
            </div>
          </div>
          {/* ============================================
              END TEST USER INFO
              ============================================ */}
        </div>

        <p className="text-center text-muted-foreground dark:text-slate-500 text-sm mt-6">© {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME || 'CMS'}. Bảo lưu mọi quyền.</p>
      </div>
    </div>
  );
}
