'use client'

import Link from 'next/link'
import NextImage from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, User, ShoppingCart, Phone, Mail, ChevronDown, Bell } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SearchBox } from '@/components/shared/search-box'
import { ROUTES, SITE_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { name: 'TRANG CHỦ', href: ROUTES.HOME, hasDropdown: false },
  { name: 'VỀ IPD8', href: ROUTES.ABOUT, hasDropdown: false },
  { name: 'CÁC GÓI HỌC', href: ROUTES.COURSES, hasDropdown: true },
  { name: 'LỊCH HỌC', href: ROUTES.SCHEDULE, hasDropdown: false },
  { 
    name: 'CHUYÊN GIA IPD8', 
    href: ROUTES.EXPERTS, 
    hasDropdown: true,
    subMenu: [
      { name: 'Góc chuyên gia', href: ROUTES.EXPERT_PERSPECTIVE }
    ]
  },
  { 
    name: 'BÀI VIẾT', 
    href: ROUTES.BLOG, 
    hasDropdown: true,
    subMenu: [
      { name: 'Tin tức chung', href: ROUTES.NEWS },
      { name: 'Sự kiện', href: ROUTES.EVENTS }
    ]
  },
  { name: 'FAQS & CHÍNH SÁCH', href: ROUTES.FAQS, hasDropdown: false },
  { name: 'LIÊN HỆ', href: ROUTES.CONTACT, hasDropdown: false },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const { isAuthenticated } = useAuth()
  
  // Mock notification data - in real app, this would come from a context or API
  const mockNotifications = [
    { id: '1', title: 'BUỔI HỌC 01', date: '2025-12-02', time: '09:00', course: 'Dành cho mẹ bầu' },
    { id: '2', title: 'BUỔI HỌC 02', date: '2025-12-04', time: '09:00', course: 'Dành cho mẹ bầu' },
  ]


  return (
    <header className="fixed top-0 left-0 right-0 z-[100] w-full bg-background">
      {/* Top Bar - Hotline, Email, Search, Auth */}
      <div className="bg-gray-50 border-b w-full">
        <div className="container-custom w-full">
          <div className="flex flex-wrap items-center justify-between gap-3 md:gap-6 py-2 md:py-3 text-xs md:text-sm w-full">
            <div className="flex flex-wrap items-center gap-3 md:gap-6 min-w-0">
              <a href="tel:967701010" className="flex items-center gap-1 md:gap-2 text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                <Phone className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                <span className="truncate">Hotline: <strong>96 770 10 10</strong></span>
              </a>
              <a href="mailto:contact@ipd8.org" className="hidden sm:flex items-center gap-1 md:gap-2 text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                <Mail className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                <span className="truncate">Email: <strong>contact@ipd8.org</strong></span>
              </a>
            </div>
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <div className="hidden md:flex md:w-48 lg:w-64 xl:w-80 min-w-0">
                <SearchBox placeholder="Tìm kiếm gói học..." />
              </div>
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                {isAuthenticated ? (
                  <>
                    <Button variant="ghost" size="icon">
                      <ShoppingCart className="h-5 w-5" />
                    </Button>
                    <div className="relative">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative"
                      >
                        <Bell className="h-5 w-5" />
                        {mockNotifications.length > 0 && (
                          <span className="absolute top-1 right-1 h-2 w-2 bg-[#F441A5] rounded-full" />
                        )}
                      </Button>
                      {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999]" style={{ maxWidth: 'calc(100vw - 2rem)' }}>
                          <div className="p-4 border-b">
                            <h4 className="font-semibold text-gray-900">Thông báo</h4>
                          </div>
                          <div className="max-h-96 overflow-y-auto overflow-x-hidden">
                            {mockNotifications.map((notification) => (
                              <div key={notification.id} className="p-4 border-b hover:bg-gray-50 cursor-pointer">
                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {new Date(notification.date).toLocaleDateString('vi-VN')} lúc {notification.time} - {notification.course}
                                </p>
                              </div>
                            ))}
                            {mockNotifications.length === 0 && (
                              <div className="p-4 text-center text-gray-600 text-sm">
                                Không có thông báo mới
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <Link href={ROUTES.DASHBOARD.ROOT}>
                      <Button variant="ghost" size="icon">
                        <User className="h-5 w-5" />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href={ROUTES.LOGIN}>
                      <Button variant="ghost" className="text-sm">Đăng nhập</Button>
                    </Link>
                    <Link href={ROUTES.REGISTER}>
                      <Button className="text-sm">Đăng ký</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
        <nav className="container-custom flex h-16 md:h-20 items-center justify-between w-full min-w-0">
        {/* Logo */}
        <Link href={ROUTES.HOME} className="flex items-center shrink-0">
          <NextImage
            src="/ipd8-logo.png"
            alt="IPD8 Logo"
            width={80}
            height={32}
            className="object-contain md:w-[100px] md:h-[40px]"
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:gap-4 xl:gap-6 flex-1 mx-4 xl:mx-8 min-w-0 overflow-visible">
          <div className="flex items-center gap-2 xl:gap-4 min-w-0 flex-wrap overflow-visible">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative group"
                onMouseEnter={() => item.hasDropdown && setHoveredDropdown(item.name)}
                onMouseLeave={() => setHoveredDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'text-xs xl:text-sm font-semibold transition-colors hover:text-primary flex items-center gap-1 whitespace-nowrap',
                    pathname === item.href || (item.subMenu && item.subMenu.some(sub => sub.href === pathname))
                      ? 'text-primary'
                      : 'text-gray-700'
                  )}
                >
                  {item.name}
                  {item.hasDropdown && (
                    <ChevronDown className="h-3 w-3 xl:h-4 xl:w-4 shrink-0" />
                  )}
                </Link>
                {item.hasDropdown && item.subMenu && (
                  <div
                    className={cn(
                      'absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[180px] z-[9999] transition-all duration-200',
                      hoveredDropdown === item.name
                        ? 'opacity-100 visible'
                        : 'opacity-0 invisible'
                    )}
                    onMouseEnter={() => setHoveredDropdown(item.name)}
                    onMouseLeave={() => setHoveredDropdown(null)}
                    style={{ maxWidth: 'calc(100vw - 2rem)' }}
                  >
                    {item.subMenu.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={cn(
                          'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors whitespace-nowrap break-words',
                          pathname === subItem.href && 'bg-gray-50 text-primary font-medium'
                        )}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>


        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t">
          <div className="container-custom py-4 space-y-4">
            {/* Mobile Search */}
            <SearchBox placeholder="Tìm khóa học..." />
            
            {/* Mobile Navigation */}
            <div className="space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'block px-4 py-2 text-sm font-medium rounded-md transition-colors',
                      pathname === item.href
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.subMenu && (
                    <div className="pl-6 space-y-1 mt-1">
                      {item.subMenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={cn(
                            'block px-4 py-2 text-sm rounded-md transition-colors',
                            pathname === subItem.href
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-gray-600 hover:bg-accent'
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Auth */}
            <div className="flex flex-col gap-2 pt-4 border-t">
              {isAuthenticated ? (
                <>
                  <Link href={ROUTES.DASHBOARD.ROOT}>
                    <Button variant="outline" className="w-full">
                      Tài khoản của tôi
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href={ROUTES.LOGIN}>
                    <Button variant="outline" className="w-full">
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href={ROUTES.REGISTER}>
                    <Button className="w-full">Đăng ký</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
