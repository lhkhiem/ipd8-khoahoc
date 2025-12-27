'use client'

import Link from 'next/link'
import NextImage from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Menu, X, User, ShoppingCart, Phone, Mail, ChevronDown, Bell, ArrowLeft } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { SearchBox } from '@/components/shared/search-box'
import { ROUTES, SITE_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { USFlagIcon, VietnamFlagIcon } from './navbar-flags'
import { mockCourses } from '@/data/courses'
import { allPackages } from '@/data/packages'
import { AuthModal } from '@/components/auth/AuthModal'

const navigation = [
  { name: 'TRANG CHỦ', href: ROUTES.HOME, hasDropdown: false },
  { name: 'VỀ IPD8', href: ROUTES.ABOUT, hasDropdown: false },
  { 
    name: 'CÁC GÓI HỌC', 
    href: ROUTES.COURSES, 
    hasDropdown: true,
    subMenu: [] // Sẽ được populate động
  },
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hoveredDropdown, setHoveredDropdown] = useState<string | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [currentLang, setCurrentLang] = useState<'vi' | 'en'>('vi')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')
  const { isAuthenticated } = useAuth()

  // Check for auth query parameter and open modal
  useEffect(() => {
    const authParam = searchParams.get('auth')
    if (authParam === 'login' || authParam === 'register') {
      setAuthModalMode(authParam)
      setAuthModalOpen(true)
      // Remove query parameter from URL
      router.replace(pathname, { scroll: false })
    }
  }, [searchParams, router, pathname])
  
  // Mock notification data - in real app, this would come from a context or API
  const mockNotifications = [
    { id: '1', title: 'BUỔI HỌC 01', date: '2025-12-02', time: '09:00', course: 'Dành cho mẹ bầu' },
    { id: '2', title: 'BUỔI HỌC 02', date: '2025-12-04', time: '09:00', course: 'Dành cho mẹ bầu' },
  ]

  // Tạo submenu động cho CÁC GÓI HỌC
  const navigationWithSubMenu = useMemo(() => {
    const coursesMenu = mockCourses.slice(0, 6).map((course, index) => ({
      name: course.title,
      href: `/${course.slug}`,
      column: index < 3 ? 'left' : 'right' // 3 courses bên trái, 3 courses bên phải
    }))

    const packagesMenu = allPackages.slice(0, 6).map((pkg, index) => ({
      name: pkg.title.toUpperCase(),
      href: `/packages/${pkg.slug}`,
      column: index < 3 ? 'left' : 'right' // 3 packages bên trái, 3 packages bên phải
    }))

    // Kết hợp: courses ở cột trái, packages ở cột phải
    const combinedMenu = [
      ...coursesMenu.map(item => ({ ...item, column: 'left' as const })),
      ...packagesMenu.map(item => ({ ...item, column: 'right' as const }))
    ]

    return navigation.map(item => {
      if (item.name === 'CÁC GÓI HỌC') {
        return {
          ...item,
          subMenu: combinedMenu.length > 0 ? combinedMenu : [
            { name: 'Các khóa học', href: ROUTES.COURSES, column: 'left' },
            { name: 'Các gói học', href: `${ROUTES.COURSES}#packages`, column: 'right' }
          ]
        }
      }
      return item
    })
  }, [])

  const handleBackClick = () => {
    // TODO: Implement back functionality
    console.log('Back button clicked')
  }

  const handleLanguageToggle = () => {
    // Toggle to opposite language
    const newLang = currentLang === 'vi' ? 'en' : 'vi'
    setCurrentLang(newLang)
    // TODO: Implement language switching
    console.log('Language changed to:', newLang)
  }

  // Get the opposite language flag
  const oppositeLang = currentLang === 'vi' ? 'en' : 'vi'


  return (
    <header className="fixed top-0 left-0 right-0 z-[100] w-full bg-background">
      {/* Top Bar - Hotline, Email, Search, Auth */}
      <div className="bg-gray-50 border-b w-full">
        <div className="container-custom w-full">
          <div className="flex flex-wrap items-center justify-between gap-3 md:gap-6 py-2 md:py-3 text-xs md:text-sm w-full">
            <div className="flex flex-wrap items-center gap-3 md:gap-6 min-w-0">
              <a href="tel:+84947701010" className="flex items-center gap-1 md:gap-2 text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                <Phone className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                <span className="truncate">Hotline: <strong>94 770 10 10</strong></span>
              </a>
              <a href="mailto:contact@ipd8.org" className="hidden sm:flex items-center gap-1 md:gap-2 text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                <Mail className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                <span className="truncate">Email: <strong>contact@ipd8.org</strong></span>
              </a>
            </div>
            <div className="flex items-center gap-1 md:gap-2 min-w-0">
              <div className="hidden md:flex md:w-[21.6rem] lg:w-[28.8rem] xl:w-[36rem] min-w-0">
                <SearchBox placeholder="Tìm kiếm gói học..." />
              </div>
              <div className="flex items-center gap-1 md:gap-1.5 min-w-0">
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
                    <Button 
                      variant="ghost" 
                      className="text-sm"
                      onClick={() => {
                        setAuthModalMode('login')
                        setAuthModalOpen(true)
                      }}
                    >
                      Đăng nhập
                    </Button>
                    <Button 
                      className="btn-gradient-pink text-sm"
                      onClick={() => {
                        setAuthModalMode('register')
                        setAuthModalOpen(true)
                      }}
                    >
                      Đăng ký
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
        <nav className="container-custom flex h-16 md:h-20 items-center justify-between w-full min-w-0 gap-2 md:gap-4">
          {/* Left: Back Button + Logo */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Back Button - TODO: Implement functionality */}
            <button
              onClick={handleBackClick}
              className="hidden md:flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Quay lại"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            
            {/* Logo */}
            <Link href={ROUTES.HOME} className="flex items-center shrink-0">
              <NextImage
                src="/ipd8-logo.png"
                alt="IPD8 Logo"
                width={64}
                height={26}
                className="object-contain md:w-[80px] md:h-[32px]"
                priority
              />
            </Link>
          </div>

          {/* Center: Navigation Menu - Visible on landscape (md: and up) */}
          <div className="hidden md:flex md:items-center md:gap-2 lg:gap-3 xl:gap-4 flex-1 justify-center mx-2 lg:mx-4 min-w-0 overflow-visible">
            <div className="flex items-center gap-1.5 lg:gap-2 xl:gap-3 min-w-0 flex-wrap justify-center overflow-visible">
              {navigationWithSubMenu.map((item) => (
                <div
                  key={item.name}
                  className="relative group"
                  onMouseEnter={() => item.hasDropdown && setHoveredDropdown(item.name)}
                  onMouseLeave={() => setHoveredDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'text-[0.63rem] md:text-[0.675rem] lg:text-[0.675rem] xl:text-[0.7875rem] font-semibold transition-colors hover:text-primary flex items-center gap-0.5 lg:gap-1 whitespace-nowrap px-1',
                      pathname === item.href || (item.subMenu && item.subMenu.some(sub => sub.href === pathname))
                        ? 'text-primary'
                        : 'text-gray-700'
                    )}
                  >
                    {item.name}
                    {item.hasDropdown && (
                      <ChevronDown className="h-2.5 w-2.5 md:h-3 md:w-3 shrink-0" />
                    )}
                  </Link>
                  {item.hasDropdown && item.subMenu && (
                    <div
                      className={cn(
                        'absolute left-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[9999] transition-all duration-200',
                        hoveredDropdown === item.name
                          ? 'opacity-100 visible'
                          : 'opacity-0 invisible',
                        // Special styling for 2-column menu (CÁC GÓI HỌC)
                        item.name === 'CÁC GÓI HỌC' ? 'min-w-[400px]' : 'min-w-[180px]'
                      )}
                      onMouseEnter={() => setHoveredDropdown(item.name)}
                      onMouseLeave={() => setHoveredDropdown(null)}
                      style={{ maxWidth: 'calc(100vw - 2rem)' }}
                    >
                      {item.name === 'CÁC GÓI HỌC' ? (
                        // 2-column layout for CÁC GÓI HỌC
                        <div className="flex">
                          <div className="flex-1 px-4 py-2">
                            {item.subMenu.filter((sub: any) => sub.column === 'left').map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={cn(
                                  'block py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors',
                                  pathname === subItem.href && 'bg-gray-50 text-primary font-medium'
                                )}
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                          {/* Divider */}
                          <div className="w-px bg-gray-200 my-2"></div>
                          <div className="flex-1 px-4 py-2">
                            {item.subMenu.filter((sub: any) => sub.column === 'right').map((subItem) => (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={cn(
                                  'block py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors',
                                  pathname === subItem.href && 'bg-gray-50 text-primary font-medium'
                                )}
                              >
                                {subItem.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        // Single column for other menus
                        item.subMenu.map((subItem) => (
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
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Language Switcher - Show opposite language flag */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language Switcher - Single button showing opposite language */}
            <button
              onClick={handleLanguageToggle}
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-md bg-gray-100 hover:bg-gray-200 transition-all p-1.5"
              aria-label={oppositeLang === 'vi' ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
              title={oppositeLang === 'vi' ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
            >
              {oppositeLang === 'vi' ? (
                <VietnamFlagIcon className="w-full h-full" />
              ) : (
                <USFlagIcon className="w-full h-full" />
              )}
            </button>

            {/* Mobile menu button - Only visible on portrait mobile */}
            <button
              type="button"
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu - Only visible on portrait mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container-custom py-4 space-y-4">
            {/* Mobile Search */}
            <SearchBox placeholder="Tìm khóa học..." />
            
            {/* Mobile Language Switcher - Single button showing opposite language */}
            <div className="flex items-center gap-2 pb-2 border-b">
              <span className="text-sm text-gray-600">Ngôn ngữ:</span>
              <button
                onClick={() => {
                  handleLanguageToggle()
                  setMobileMenuOpen(false)
                }}
                className="flex items-center justify-center w-9 h-9 rounded-md bg-gray-100 hover:bg-gray-200 transition-all p-1.5"
                aria-label={oppositeLang === 'vi' ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
              >
                {oppositeLang === 'vi' ? (
                  <VietnamFlagIcon className="w-full h-full" />
                ) : (
                  <USFlagIcon className="w-full h-full" />
                )}
              </button>
            </div>
            
            {/* Mobile Navigation */}
            <div className="space-y-2">
              {navigationWithSubMenu.map((item) => (
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
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setAuthModalMode('login')
                      setAuthModalOpen(true)
                      setMobileMenuOpen(false)
                    }}
                  >
                    Đăng nhập
                  </Button>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      setAuthModalMode('register')
                      setAuthModalOpen(true)
                      setMobileMenuOpen(false)
                    }}
                  >
                    Đăng ký
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        initialMode={authModalMode}
      />
    </header>
  )
}
