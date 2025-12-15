'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ContactForm } from '@/components/shared/contact-form'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Phone, MapPin, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'
import { sanitizeGoogleMapsUrl } from '@/lib/security'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function ContactPage() {
  // Google Maps embed URL - sanitized for security
  // Công Ty Tnhh Công Đẳng Bình Đẳng
  const googleMapsUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31353.39462262783!2d106.67916375499026!3d10.797956718522848!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529b15e5c002f%3A0xbda7eafb741d93e2!2zQ8O0bmcgVHkgVG5oaCBDw7TMo25nIMSQw7TMgG5nIELDosyAdQ!5e0!3m2!1sen!2s!4v1765356643102!5m2!1sen!2s'
  
  const [sanitizedMapUrl, setSanitizedMapUrl] = useState<string | null>(null)
  const [mapError, setMapError] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    // Sanitize Google Maps URL on client side
    const sanitized = sanitizeGoogleMapsUrl(googleMapsUrl)
    if (sanitized) {
      setSanitizedMapUrl(sanitized)
      // Set a timeout to check if map loads
      const timer = setTimeout(() => {
        if (!mapLoaded) {
          // If map hasn't loaded after 5 seconds, show error
          setMapError(true)
        }
      }, 5000)
      return () => clearTimeout(timer)
    } else {
      setMapError(true)
    }
  }, [mapLoaded])

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section with Parallax */}
      <section 
        className="relative w-full max-w-full min-h-[400px] sm:min-h-[500px] md:min-h-[600px] overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1920&h=1080&fit=crop&q=80)',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F441A5]/80 to-[#FF5F6D]/80"></div>
        
        {/* Content - Centered */}
        <div className="container-custom relative z-10 h-full flex items-center justify-center py-12 md:py-20 w-full max-w-full px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center w-full"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white break-words" style={{ lineHeight: '1.2' }}>
              Liên hệ với chúng tôi
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed break-words">
              Bạn có câu hỏi? Hãy liên hệ với chúng tôi, đội ngũ của IPD8 luôn sẵn sàng hỗ trợ
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="section-wrapper bg-white w-full max-w-full overflow-x-hidden">
        <div className="container-custom w-full max-w-full">
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-full">
        <div className="lg:col-span-2">
          <ContactForm />
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Địa chỉ</h3>
                  <p className="text-sm text-muted-foreground leading-[1.2]">
                    <span className="block">123 Nguyễn Huệ, Quận 1</span>
                    <span className="block mt-[0.2em]">TP. Hồ Chí Minh, Việt Nam</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Điện thoại</h3>
                  <p className="text-sm text-muted-foreground leading-[1.2]">
                    <span className="block">Hotline: +84 123 456 789</span>
                    <span className="block mt-[0.2em]">Tư vấn: +84 987 654 321</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-sm text-muted-foreground leading-[1.2]">
                    <span className="block">contact@ipd8.vn</span>
                    <span className="block mt-[0.2em]">support@ipd8.vn</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Giờ làm việc</h3>
                  <p className="text-sm text-muted-foreground leading-[1.2]">
                    <span className="block">Thứ 2 - Thứ 6: 8:00 - 18:00</span>
                    <span className="block mt-[0.2em]">Thứ 7: 8:00 - 12:00</span>
                    <span className="block mt-[0.2em]">Chủ nhật: Nghỉ</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="section-wrapper bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-8 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ lineHeight: '1.2' }}>
              Vị trí của chúng tôi
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Đến thăm trung tâm IPD8 tại địa chỉ của chúng tôi
            </p>
          </motion.div>
          
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-200"
          >
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-100">
              {mapError || !sanitizedMapUrl ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4">
                  <MapPin className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 text-center mb-4">
                    Không thể tải bản đồ. Vui lòng xem địa chỉ bên dưới.
                  </p>
                  <a
                    href="https://www.google.com/maps/search/Công+Ty+Tnhh+Công+Đẳng+Bình+Đẳng"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#F441A5] hover:underline"
                  >
                    Mở trên Google Maps
                  </a>
                </div>
              ) : (
                <iframe
                  src={sanitizedMapUrl || undefined}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                  title="Vị trí IPD8 trên Google Maps"
                  allow="fullscreen"
                  onLoad={() => setMapLoaded(true)}
                  onError={() => {
                    setMapError(true)
                    setMapLoaded(false)
                  }}
                />
              )}
            </div>
            <div className="bg-white p-6 border-t">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Địa chỉ</h3>
                  <p className="text-sm text-gray-600 leading-[1.2]">
                    <span className="block">123 Nguyễn Huệ, Quận 1</span>
                    <span className="block mt-[0.2em]">TP. Hồ Chí Minh, Việt Nam</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section with Parallax */}
      <section 
        className="relative w-full py-20 md:py-24 lg:py-28 overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=1920&h=1080&fit=crop&q=80)',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>
        
        {/* Content */}
        <div className="container-custom relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white" style={{ lineHeight: '1.2' }}>
              Sẵn sàng bắt đầu hành trình cùng IPD8?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Đăng ký ngay để nhận tư vấn miễn phí và khám phá các khóa học phù hợp nhất cho bạn và bé
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={ROUTES.COURSES}>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white hover:opacity-90 hover:scale-105 transition-all duration-200 px-8 py-6 text-lg font-semibold"
                >
                  Xem các khóa học
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={ROUTES.TRIAL}>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white/20 hover:scale-105 transition-all duration-200 px-8 py-6 text-lg font-semibold"
                >
                  Đăng ký học thử
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
