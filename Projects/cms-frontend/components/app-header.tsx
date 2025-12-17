'use client';

import { useRouter } from 'next/navigation';
import { Bell, Search, Moon, Sun, LogOut, User, Menu } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/authStore';
import { useSidebar } from '@/components/app-sidebar';
import { cn } from '@/lib/utils';

export function AppHeader() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { logout, user } = useAuthStore();
  const { isCollapsed, isMobile, toggleCollapse } = useSidebar();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout API fails
      router.push('/login');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between gap-4 px-6">
        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={toggleCollapse}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg md:hidden',
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              'transition-colors'
            )}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        
        {/* Search */}
        <div className="flex flex-1 items-center gap-4 md:max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Tìm kiếm... (Ctrl+K)"
              className={cn(
                'h-9 w-full rounded-lg border border-input bg-background pl-9 pr-4',
                'text-sm placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'transition-colors'
              )}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg',
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              'transition-colors'
            )}
            aria-label="Chuyển đổi giao diện"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {/* Notifications */}
          <button
            className={cn(
              'relative flex h-9 w-9 items-center justify-center rounded-lg',
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              'transition-colors'
            )}
            aria-label="Thông báo"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          </button>

          {/* Divider */}
          <div className="mx-2 h-6 w-px bg-border" />

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <button
              className={cn(
                'flex h-9 items-center gap-2 rounded-lg px-3',
                'text-sm font-medium text-foreground',
                'hover:bg-accent hover:text-accent-foreground',
                'transition-colors'
              )}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden md:inline">{user?.name || user?.email || 'Người dùng'}</span>
            </button>

            <button
              onClick={handleLogout}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg',
                'text-destructive hover:bg-destructive/10',
                'transition-colors'
              )}
              aria-label="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
