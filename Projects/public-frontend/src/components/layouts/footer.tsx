import Link from 'next/link'
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { ROUTES, SITE_NAME } from '@/lib/constants'

const footerLinks = {
  aboutUs: [
    { name: 'Về IPD8', href: ROUTES.ABOUT },
    { name: 'Tầm nhìn & Sứ mệnh', href: `${ROUTES.ABOUT}#vision` },
    { name: 'Đội ngũ chuyên gia', href: ROUTES.EXPERTS },
    { name: 'Tin tức', href: ROUTES.BLOG },
  ],
  courses: [
    { name: 'Khóa học Mẹ bầu', href: `${ROUTES.COURSES}?audience=me-bau` },
    { name: 'Khóa học 0-12 tháng', href: `${ROUTES.COURSES}?audience=0-12-thang` },
    { name: 'Khóa học 13-24 tháng', href: `${ROUTES.COURSES}?audience=13-24-thang` },
    { name: 'Lịch học', href: ROUTES.SCHEDULE },
  ],
  support: [
    { name: 'FAQs', href: ROUTES.FAQS },
    { name: 'Chính sách', href: ROUTES.POLICIES },
    { name: 'Liên hệ', href: ROUTES.CONTACT },
  ],
}

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t w-full max-w-full overflow-x-hidden">
      <div className="container-custom py-8 md:py-12 overflow-x-hidden w-full max-w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-full">
          {/* Company Info */}
          <div>
            <Link href={ROUTES.HOME} className="flex items-center space-x-2 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-2xl">I</span>
              </div>
              <span className="font-bold text-2xl">{SITE_NAME}</span>
            </Link>
            <p className="text-xs md:text-sm text-muted-foreground mb-4 break-words">
              Nền tảng học tập trực tuyến hàng đầu cho mẹ và bé, cung cấp các khóa học
              chất lượng cao với đội ngũ chuyên gia giàu kinh nghiệm.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Facebook className="h-4 w-4 text-primary" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Instagram className="h-4 w-4 text-primary" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Youtube className="h-4 w-4 text-primary" />
              </a>
            </div>
          </div>

          {/* About Us Links */}
          <div>
            <h3 className="font-semibold mb-4">Về chúng tôi</h3>
            <ul className="space-y-3">
              {footerLinks.aboutUs.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Course Links */}
          <div>
            <h3 className="font-semibold mb-4">Khóa học</h3>
            <ul className="space-y-3">
              {footerLinks.courses.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  Tầng 8, Tòa nhà Vietnam Business Center số 57-59 đường Hồ Tùng Mậu, Phường Sài Gòn, TP. HCM
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <a
                  href="tel:+84947701010"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  +84 94 770 10 10
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <a
                  href="mailto:contact@ipd8.org"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  contact@ipd8.org
                </a>
              </li>
            </ul>
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2">Hỗ trợ</h4>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href={ROUTES.POLICIES}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Chính sách bảo mật
              </Link>
              <Link
                href={ROUTES.POLICIES}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
