'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAppearance } from '@/hooks/use-appearance';
import {
  LayoutDashboard,
  FileText,
  Image,
  Users,
  Settings,
  BarChart3,
  Folder,
  Tags,
  ChevronRight,
  ChevronLeft,
  Package,
  Grid3x3,
  Tag,
  PackageOpen,
  Menu,
  // ShoppingCart, // Disabled: Customer cart management not needed
  Receipt, // Orders for admin management
  // Heart, // Disabled: Customer wishlist management not needed
  // Star, // Disabled: Customer review management not needed
  Code,
  Sparkles,
  MessageSquareQuote,
  Mail,
  PhoneCall,
  Info,
  HelpCircle,
} from 'lucide-react';

// Sidebar Context
const SidebarContext = createContext<{
  isCollapsed: boolean;
  isMobile: boolean;
  toggleCollapse: () => void;
}>({
  isCollapsed: false,
  isMobile: false,
  toggleCollapse: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

// Sidebar Provider Component
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      // Auto-collapse on mobile
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load collapsed state from localStorage (only on desktop)
  useEffect(() => {
    if (!isMobile) {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved !== null) {
        setIsCollapsed(JSON.parse(saved));
      }
    }
  }, [isMobile]);

  // Save collapsed state to localStorage (only on desktop)
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    }
  }, [isCollapsed, isMobile]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, isMobile, toggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  );
}

const navigation = [
  {
    title: 'Dashboard',
    items: [
      {
        title: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'Analytics',
        href: '/dashboard/analytics',
        icon: BarChart3,
      },
    ],
  },
  {
    title: 'Content',
    items: [
      {
        title: 'Posts',
        href: '/dashboard/posts',
        icon: FileText,
      },
      {
        title: 'Topics',
        href: '/dashboard/topics',
        icon: Folder,
      },
      {
        title: 'Tags',
        href: '/dashboard/tags',
        icon: Tags,
      },
    ],
  },
  {
    title: 'Products',
    items: [
      {
        title: 'All Products',
        href: '/dashboard/products',
        icon: Package,
      },
      {
        title: 'Categories',
        href: '/dashboard/products/categories',
        icon: Grid3x3,
      },
      {
        title: 'Brands',
        href: '/dashboard/products/brands',
        icon: Tag,
      },
      {
        title: 'Inventory',
        href: '/dashboard/products/inventory',
        icon: PackageOpen,
      },
    ],
  },
  // E-Commerce section - Only Orders (admin management, not customer management)
  {
    title: 'E-Commerce',
    items: [
      {
        title: 'Orders',
        href: '/dashboard/orders',
        icon: Receipt,
      },
      {
        title: 'Contact Messages',
        href: '/dashboard/contacts',
        icon: Mail,
      },
      {
        title: 'Consultations',
        href: '/dashboard/consultations',
        icon: PhoneCall,
      },
      {
        title: 'Newsletter',
        href: '/dashboard/newsletter',
        icon: Mail,
      },
      {
        title: 'FAQs',
        href: '/dashboard/faqs',
        icon: HelpCircle,
      },
      // Disabled: Customer management features not needed
      // {
      //   title: 'Shopping Cart',
      //   href: '/dashboard/cart',
      //   icon: ShoppingCart,
      // },
      // {
      //   title: 'Wishlists',
      //   href: '/dashboard/wishlist',
      //   icon: Heart,
      // },
      // {
      //   title: 'Reviews',
      //   href: '/dashboard/reviews',
      //   icon: Star,
      // },
    ],
  },
  {
    title: 'Media',
    items: [
      {
        title: 'Media Library',
        href: '/dashboard/media',
        icon: Image,
      },
    ],
  },
  {
    title: 'Appearance',
    items: [
      {
        title: 'Sliders',
        href: '/dashboard/sliders',
        icon: Image,
      },
      {
        title: 'Value Props',
        href: '/dashboard/value-props',
        icon: Sparkles,
      },
      {
        title: 'Testimonials',
        href: '/dashboard/testimonials',
        icon: MessageSquareQuote,
      },
      {
        title: 'Menus',
        href: '/dashboard/menus',
        icon: Menu,
      },
      {
        title: 'About Page',
        href: '/dashboard/about',
        icon: Info,
      },
    ],
  },
  {
    title: 'SEO',
    items: [
      {
        title: 'Quản lý SEO',
        href: '/dashboard/seo',
        icon: Code,
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        title: 'Users & Roles',
        href: '/dashboard/users',
        icon: Users,
      },
      {
        title: 'Tracking Scripts',
        href: '/dashboard/tracking-scripts',
        icon: Code,
      },
      {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
      },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { appearance } = useAppearance();
  const { isCollapsed, isMobile, toggleCollapse } = useSidebar();

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleCollapse}
        />
      )}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64',
          // On mobile, sidebar slides in/out
          isMobile && (isCollapsed ? '-translate-x-full' : 'translate-x-0')
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            <Link
              href="/dashboard"
              className={cn(
                'flex items-center gap-2 transition-opacity',
                isCollapsed ? 'w-full justify-center' : ''
              )}
            >
              {appearance?.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={appearance.logo_url}
                  alt="Logo"
                  className="h-8 w-8 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm flex-shrink-0">
                  P
                </div>
              )}
              {!isCollapsed && (
                <span className="text-lg font-semibold text-sidebar-foreground whitespace-nowrap">
                  Banyco CMS
                </span>
              )}
            </Link>
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors flex-shrink-0"
              title={isCollapsed ? 'Mở rộng menu' : 'Thu nhỏ menu'}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
          <div className="space-y-6">
            {navigation.map((section) => (
              <div key={section.title}>
                {!isCollapsed && (
                  <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                    {section.title}
                  </h3>
                )}
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    // Exact match only - no parent highlighting
                    const isActive = pathname === item.href;
                    
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                            isCollapsed ? 'justify-center' : ''
                          )}
                          title={isCollapsed ? item.title : undefined}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          {!isCollapsed && (
                            <>
                              <span className="flex-1">{item.title}</span>
                              {isActive && (
                                <ChevronRight className="h-4 w-4 text-primary" />
                              )}
                            </>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="border-t border-sidebar-border p-4">
            <div className="text-xs text-sidebar-foreground/50 text-center">
              Được phát hành bởi <span className="font-semibold">Pressup.vn</span>
            </div>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
