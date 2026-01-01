'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Users, Heart, Baby, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/lib/constants'
import { PackageSection } from '@/components/packages/PackageSection'
import { allPackages } from '@/data/packages'
import { useState, useEffect } from 'react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.8 }
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 }
}

import { mockCourses } from '@/data/courses'
import { formatCurrency } from '@/lib/utils'

// Course packages data - Top 3 featured courses for hero section
const coursePackages = [
  {
    id: 1,
    title: 'CHO CON KHỞI ĐẦU TUYỆT VỜI NHẤT',
    image: '/image/PressUp - lYlp5nadcO-1.webp',
    description: 'Gói thành viên khởi đầu – món quà đặc biệt giúp mẹ bước vào hành trình 1.000 ngày đầu đời cùng con',
    price: '49.000đ',
    duration: 'Truy cập không giới hạn',
    instructor: 'Chuyên gia IPD8',
    benefits: ['50 bản nhạc chuyên biệt', 'Lớp học trải nghiệm', 'Tư vấn 1:1 với chuyên gia']
  },
  {
    id: 2,
    title: 'CHO CON SỨC KHỎE TUYỆT VỜI NHẤT',
    image: '/image/PressUp - Hszb0PiRwI-5.webp',
    description: 'Gói toàn diện cho sức khỏe của con: Bí quyết nuôi con bằng sữa mẹ, E-book chăm con đúng y khoa',
    price: '299.000đ',
    duration: 'Truy cập không giới hạn',
    instructor: 'Chuyên gia IPD8',
    benefits: ['Bí quyết nuôi con bằng sữa mẹ', 'E-book chăm con đúng y khoa', 'Phương pháp kích hoạt 8 loại hình trí thông minh']
  },
  {
    id: 3,
    title: 'CHO CON SỰ HỌC TUYỆT VỜI NHẤT',
    image: '/image/PressUp - LKdyw7R9L3-11.webp',
    description: 'Hạng thẻ cao cấp nhất - Hành trình 1.000 ngày đầu đời trọn vẹn nhất',
    price: '299.000đ',
    duration: 'Truy cập không giới hạn',
    instructor: 'Chuyên gia IPD8',
    benefits: ['Khai phá tiềm năng tối ưu', 'Môi trường phát triển trí não', 'Checklist 100 kỹ năng đầu đời']
  }
]

// Featured courses data - Top 6 featured courses
const featuredCourses = mockCourses
  .filter(course => course.featured)
  .slice(0, 6)
  .map(course => ({
    id: course.id,
    title: course.title,
    image: course.thumbnailUrl || 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=400&fit=crop',
    duration: course.durationMinutes === 0 ? 'Truy cập không giới hạn' : `${Math.round(course.durationMinutes / 60)} giờ`,
    instructor: 'Chuyên gia IPD8',
    benefitsMom: course.benefitsMom || '',
    benefitsBaby: course.benefitsBaby || '',
    price: course.price === 0 ? 'Miễn phí' : formatCurrency(course.price),
    slug: course.slug
  }))

// Experts data
const experts = [
  {
    id: 1,
    name: 'TS. Nguyễn Thị Lan',
    role: 'Chuyên gia Nhi khoa',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop',
    description: 'Hơn 20 năm kinh nghiệm trong lĩnh vực chăm sóc và phát triển trẻ em'
  },
  {
    id: 2,
    name: 'BS. Trần Minh Anh',
    role: 'Chuyên gia Dinh dưỡng',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=600&fit=crop',
    description: 'Chuyên gia dinh dưỡng cho mẹ bầu và trẻ nhỏ, tác giả nhiều công trình nghiên cứu'
  },
  {
    id: 3,
    name: 'TS. Phạm Văn Hùng',
    role: 'Chuyên gia Tâm lý',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=600&fit=crop',
    description: 'Chuyên gia tâm lý trẻ em với phương pháp giáo dục hiện đại'
  },
  {
    id: 4,
    name: 'BS. Lê Thị Mai',
    role: 'Chuyên gia Sản khoa',
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&h=600&fit=crop',
    description: 'Bác sĩ sản khoa với hơn 15 năm kinh nghiệm chăm sóc mẹ bầu'
  }
]

// Events data
const events = [
  {
    id: 1,
    title: 'LOREM IPSUM DOLOR SIT AMET, CONSECTETUER ADIPISCING ELIT, SED',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop',
    date: '2025-12-15'
  },
  {
    id: 2,
    title: 'LOREM IPSUM DOLOR SIT AMET, CONSECTETUER ADIPISCING ELIT, SED',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=400&fit=crop',
    date: '2025-12-20'
  },
  {
    id: 3,
    title: 'LOREM IPSUM DOLOR SIT AMET, CONSECTETUER ADIPISCING ELIT, SED',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop',
    date: '2025-12-25'
  },
  {
    id: 4,
    title: 'LOREM IPSUM DOLOR SIT AMET, CONSECTETUER ADIPISCING ELIT, SED',
    image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&h=400&fit=crop',
    date: '2026-01-05'
  },
  {
    id: 5,
    title: 'LOREM IPSUM DOLOR SIT AMET, CONSECTETUER ADIPISCING ELIT, SED',
    image: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=600&h=400&fit=crop',
    date: '2026-01-10'
  },
  {
    id: 6,
    title: 'LOREM IPSUM DOLOR SIT AMET, CONSECTETUER ADIPISCING ELIT, SED',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop',
    date: '2026-01-15'
  }
]

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: 'LOREM IPSUM',
    role: 'Mẹ bầu',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    content: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.'
  },
  {
    id: 2,
    name: 'LOREM IPSUM',
    role: 'Mẹ có con 8 tháng',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    content: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.'
  },
  {
    id: 3,
    name: 'LOREM IPSUM',
    role: 'Mẹ có con 18 tháng',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop',
    content: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.'
  }
]

export default function HomePage() {
  const [sectionHeight, setSectionHeight] = useState<string>('100vh')
  const [headerHeight, setHeaderHeight] = useState<string>('104px')

  useEffect(() => {
    // Function to get actual header height from DOM
    const updateHeaderHeight = () => {
      if (typeof window === 'undefined') return

      // Get actual header height from DOM
      const header = document.querySelector('header')
      if (header) {
        const actualHeight = header.offsetHeight
        setHeaderHeight(`${actualHeight}px`)
      } else {
        // Fallback to CSS variable
        setHeaderHeight(window.innerWidth >= 768 ? '140px' : '104px')
      }
    }

    // Function to calculate and set section height
    const updateSectionHeight = () => {
      if (typeof window === 'undefined') return

      // Get actual viewport height
      const viewportHeight = window.visualViewport?.height || window.innerHeight
      
      // Get actual header height from DOM
      const header = document.querySelector('header')
      const headerHeight = header ? header.offsetHeight : (window.innerWidth >= 768 ? 140 : 104)
      
      // Calculate section height
      const calculatedHeight = viewportHeight - headerHeight
      
      // Set height in pixels for precision
      setSectionHeight(`${calculatedHeight}px`)
    }

    // Initial calculations
    updateHeaderHeight()
    updateSectionHeight()

    // Update on resize
    const handleResize = () => {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        updateHeaderHeight()
        updateSectionHeight()
      })
    }

    // Listen to all relevant events
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      window.visualViewport.addEventListener('scroll', handleResize)
    }

    // Also update when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateSectionHeight)
    } else {
      updateSectionHeight()
    }

    // Update after a short delay to ensure header is rendered
    const timeoutId = setTimeout(updateSectionHeight, 100)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
        window.visualViewport.removeEventListener('scroll', handleResize)
      }
      document.removeEventListener('DOMContentLoaded', updateSectionHeight)
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Independent section, starts right after navbar */}
      <section 
        className="relative gradient-primary text-white flex flex-col items-center justify-center w-full max-w-full overflow-hidden" 
        style={{ 
          marginTop: headerHeight,
          marginBottom: 0,
          paddingTop: 0,
          paddingBottom: 0,
          height: sectionHeight,
          minHeight: sectionHeight,
          maxHeight: sectionHeight,
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Overlay - phủ toàn bộ section từ mép dưới navbar */}
        <div 
          className="absolute bg-black/10 z-0" 
          style={{ 
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        ></div>
        <div className="container-custom max-w-[1400px] relative z-10 flex flex-col items-center justify-center w-full h-full pt-6 md:pt-8 lg:pt-10 pb-4 md:pb-6 lg:pb-8">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="text-center mb-1 md:mb-1.5 lg:mb-2 relative z-10 w-full flex flex-col items-center justify-center"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-0.5 md:mb-1 lg:mb-1 leading-tight break-words px-2">
              TRUNG TÂM 1.000 NGÀY VÀNG ĐẦU ĐỜI
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-1.5 md:mb-2 lg:mb-2.5 leading-tight break-words px-2">
              <span className="text-yellow-300">VIỆT NAM - NEW ZEALAND IPD8</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto break-words px-4">
              Đồng hành cùng mẹ và bé từ thai kỳ đến 02 tuổi
            </p>
          </motion.div>

          {/* Course Packages - Grid on desktop, Swiper on mobile */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="relative flex-grow flex flex-col items-center justify-center w-full max-w-full overflow-visible mt-1 md:mt-1.5 lg:mt-2"
          >
            {/* Desktop Grid - 2 cards always visible */}
            <div className="hidden lg:flex lg:justify-center lg:items-center w-full max-w-full px-4 xl:px-6 py-2 relative z-20" style={{ gap: '1rem' }}>
              {coursePackages.slice(0, 2).map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="h-full w-full max-w-[380px] min-w-0 relative z-20 p-2"
                >
                  <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-card-lg h-full flex flex-col group hover:shadow-card-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 rounded-2xl overflow-hidden w-full max-w-full relative z-20" style={{ transformOrigin: 'center', borderRadius: '1rem', willChange: 'transform', backfaceVisibility: 'hidden' }}>
                    <div className="relative h-64 lg:h-72 xl:h-80 overflow-hidden shrink-0 w-full" style={{ aspectRatio: '3/4' }}>
                      <Image
                        src={pkg.image}
                        alt={pkg.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 1024px) 380px, 380px"
                      />
                    </div>
                    <CardContent className="p-5 lg:p-6 flex flex-col flex-grow min-w-0">
                      <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-3 min-h-[3rem] flex items-start line-clamp-2 break-words">
                        {pkg.title}
                      </h3>
                      <div className="space-y-2 mb-4 text-sm text-gray-600 flex-grow min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className="h-4 w-4 shrink-0" />
                          <span className="truncate">Thời lượng: {pkg.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <Users className="h-4 w-4 shrink-0" />
                          <span className="truncate">Giáo viên: {pkg.instructor}</span>
                        </div>
                      </div>
                      <div className="mt-auto pt-4 w-full">
                        <Link href={pkg.id === 1 ? '/cho-con-khoi-dau-tuyet-voi-nhat' : pkg.id === 2 ? '/cho-con-suc-khoe-tuyet-voi-nhat' : pkg.id === 3 ? '/cho-con-su-hoc-tuyet-voi-nhat' : `${ROUTES.COURSES}?package=${pkg.id}`} className="block w-full">
                          <Button className="w-full bg-transparent border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white hover:scale-105 transition-all duration-200 text-sm py-2.5 whitespace-nowrap">
                            Chi tiết gói học
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Mobile/Tablet Swiper */}
            <div className="lg:hidden relative w-full max-w-full px-2 sm:px-4 md:px-6 overflow-visible z-20 py-2">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={16}
                slidesPerView={1}
                breakpoints={{
                  640: { slidesPerView: 2, spaceBetween: 20 }
                }}
                navigation={{
                  nextEl: '.swiper-button-next-custom',
                  prevEl: '.swiper-button-prev-custom'
                }}
                pagination={{ clickable: true, el: '.swiper-pagination-custom' }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop
                className="w-full hero-swiper"
                style={{ paddingBottom: '35px', width: '100%', maxWidth: '100%', paddingTop: '7px', paddingLeft: '7px', paddingRight: '7px' }}
              >
                {coursePackages.map((pkg) => (
                  <SwiperSlide key={pkg.id} style={{ height: 'auto', width: '100%', maxWidth: '100%' }}>
                    <div className="h-full px-1 sm:px-2 py-2 w-full max-w-full relative z-20">
                      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-card-lg h-full flex flex-col group hover:shadow-card-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 rounded-2xl overflow-hidden w-full max-w-full relative z-20" style={{ transformOrigin: 'center', borderRadius: '1rem', willChange: 'transform', backfaceVisibility: 'hidden' }}>
                        <div className="relative h-56 md:h-64 overflow-hidden shrink-0 w-full" style={{ aspectRatio: '3/4' }}>
                          <Image
                            src={pkg.image}
                            alt={pkg.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, 50vw"
                          />
                        </div>
                        <CardContent className="p-4 md:p-5 flex flex-col flex-grow min-w-0">
                          <h3 className="text-sm md:text-base font-bold text-gray-900 mb-2 md:mb-3 min-h-[2.5rem] md:min-h-[3rem] flex items-start line-clamp-2 break-words">
                            {pkg.title}
                          </h3>
                          <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4 text-xs md:text-sm text-gray-600 flex-grow min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                              <span className="truncate">Thời lượng: {pkg.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                              <Users className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
                              <span className="truncate">Giáo viên: {pkg.instructor}</span>
                            </div>
                          </div>
                          <div className="mt-auto pt-3 md:pt-4 w-full">
                            <Link href={pkg.id === 1 ? '/cho-con-khoi-dau-tuyet-voi-nhat' : pkg.id === 2 ? '/cho-con-suc-khoe-tuyet-voi-nhat' : pkg.id === 3 ? '/cho-con-su-hoc-tuyet-voi-nhat' : `${ROUTES.COURSES}?package=${pkg.id}`} className="block w-full">
                              <Button className="w-full bg-transparent border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white hover:scale-105 transition-all duration-200 text-xs md:text-sm py-2 md:py-2.5 whitespace-nowrap">
                                Chi tiết gói học
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Custom Navigation - Only for mobile/tablet */}
              <button className="swiper-button-prev-custom hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110 items-center justify-center" style={{ maxWidth: '42px', maxHeight: '42px', width: '42px', height: '42px' }}>
                <ChevronLeft className="h-5 w-5 text-[#F441A5]" />
              </button>
              <button className="swiper-button-next-custom hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110 items-center justify-center" style={{ maxWidth: '42px', maxHeight: '42px', width: '42px', height: '42px' }}>
                <ChevronRight className="h-5 w-5 text-[#F441A5]" />
              </button>
              
              {/* Custom Pagination - Only for mobile/tablet */}
              <div className="swiper-pagination-custom !relative flex justify-center gap-2 mt-4 md:mt-6 w-full max-w-full"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose IPD8 Section */}
      <section className="section-wrapper bg-white w-full max-w-full overflow-x-hidden relative" style={{ zIndex: 2, marginTop: 0 }}>
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="relative h-[437.5px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <iframe
                src="https://drive.google.com/file/d/1VZ4ngD60fNvjliydEaeghBFGAgXI4cdi/preview"
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Tại sao chọn IPD8"
              />
            </motion.div>
            
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Tại sao chọn IPD8?
              </h2>
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  Trung tâm 1.000 ngày vàng đầu đời Việt Nam - New Zealand IPD8 được thành lập ngày 16/04/2025, 
                  là đơn vị tiên phong trong lĩnh vực giáo dục và chăm sóc sức khỏe cho mẹ và bé.
                </p>
                <p>
                  Chúng tôi tập trung vào giai đoạn quan trọng từ thai kỳ đến 12 tuổi, tuân thủ các khuyến nghị 
                  của WHO và UNICEF về "1.000 ngày đầu đời" - giai đoạn vàng quyết định sự phát triển toàn diện của trẻ.
                </p>
                <p>
                  Với đội ngũ chuyên gia giàu kinh nghiệm và phương pháp giáo dục hiện đại, IPD8 cam kết đồng hành 
                  cùng các gia đình trong hành trình nuôi dạy con khỏe mạnh và hạnh phúc.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Experts Slider Section */}
      <section className="section-wrapper bg-gray-50 overflow-visible w-full max-w-full">
        <div className="container-custom overflow-visible">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 px-4">
              ĐỘI NGŨ CHUYÊN GIA
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Các chuyên gia hàng đầu trong lĩnh vực chăm sóc và phát triển trẻ em
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="relative py-4 px-2 sm:px-4 overflow-visible w-full max-w-full"
          >
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 20 },
                1024: { slidesPerView: 4, spaceBetween: 24 }
              }}
              navigation={{
                nextEl: '.swiper-button-next-experts',
                prevEl: '.swiper-button-prev-experts'
              }}
              loop
              className="swiper-container w-full max-w-full"
            >
              {experts.map((expert) => (
                <SwiperSlide key={expert.id} style={{ height: 'auto' }}>
                  <div className="px-1 sm:px-2 py-2 h-full">
                    <Card className="bg-white border-0 shadow-card-lg overflow-hidden h-full flex flex-col group hover:shadow-card-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 w-full max-w-full">
                      <div className="relative h-64 overflow-hidden shrink-0 w-full">
                        <Image
                          src={expert.image}
                          alt={expert.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      </div>
                      <CardContent className="p-4 md:p-6 text-center flex flex-col flex-grow min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-2 break-words">{expert.name}</h3>
                        <p className="text-sm text-[#F441A5] font-semibold mb-3 line-clamp-1">{expert.role}</p>
                        <p className="text-sm text-gray-600 line-clamp-3 flex-grow break-words">{expert.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            <button className="swiper-button-prev-experts absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 rounded-full p-2 md:p-3 shadow-lg transition-all hover:scale-110" style={{ maxWidth: '48px', maxHeight: '48px' }}>
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-[#F441A5]" />
            </button>
            <button className="swiper-button-next-experts absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 rounded-full p-2 md:p-3 shadow-lg transition-all hover:scale-110" style={{ maxWidth: '48px', maxHeight: '48px' }}>
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-[#F441A5]" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Experts Slider Section 2 */}
      <section className="section-wrapper bg-white overflow-visible w-full max-w-full">
        <div className="container-custom overflow-visible">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 px-4">
              CÁC GÓI HỌC NỔI BẬT
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Chọn gói học phù hợp với nhu cầu của bạn
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-12 py-6 w-full max-w-full">
            {featuredCourses.slice(0, 6).map((course, index) => (
              <motion.div
                key={`course-2-${course.id}`}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-50px" }}
                variants={scaleIn}
                transition={{ delay: index * 0.1 }}
                className="h-full w-full max-w-full min-w-0"
              >
                <div className="px-1 sm:px-2 py-2 h-full">
                  <Card className="bg-white border-0 shadow-card-lg overflow-hidden h-full flex flex-col w-full max-w-full">
                    <div className="relative h-64 overflow-hidden shrink-0 w-full">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                        className="object-cover scale-110"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                    <CardContent className="p-4 md:p-6 flex flex-col flex-grow min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 line-clamp-2 break-words">{course.title}</h3>
                      <div className="space-y-2 mb-4 text-sm text-gray-600 min-w-0 flex-grow">
                      <div className="flex items-center gap-2 min-w-0">
                        <Clock className="h-4 w-4 shrink-0" />
                        <span className="truncate">Thời lượng: {course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <Users className="h-4 w-4 shrink-0" />
                        <span className="truncate">Giáo viên: {course.instructor}</span>
                      </div>
                      <div className="flex items-start gap-2 min-w-0">
                        <Heart className="h-4 w-4 mt-0.5 shrink-0" />
                        <span className="line-clamp-1 break-words">Lợi ích cho mẹ: {course.benefitsMom}</span>
                      </div>
                      <div className="flex items-start gap-2 min-w-0">
                        <Baby className="h-4 w-4 mt-0.5 shrink-0" />
                        <span className="line-clamp-1 break-words">Lợi ích cho bé: {course.benefitsBaby}</span>
                      </div>
                    </div>
                      <div className="mt-auto">
                    <Link href={course.slug ? `/${course.slug}` : `${ROUTES.COURSES}`} className="block w-full">
                      <Button className="w-full bg-transparent border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white hover:scale-105 transition-all duration-200 text-sm">
                        Chi tiết gói học
                      </Button>
                    </Link>
                      </div>
                  </CardContent>
                </Card>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mt-12"
          >
            <Link href={ROUTES.COURSES}>
              <Button size="lg" className="bg-transparent border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white hover:scale-105 transition-all duration-200 px-8 py-6 text-lg">
                XEM THÊM CÁC GÓI HỌC
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Packages Section - Slider */}
      <PackageSection
        title="Gói học 8i - Giải pháp toàn diện"
        subtitle="Các gói học được thiết kế chuyên biệt cho từng giai đoạn phát triển của con, giúp mẹ đồng hành trọn vẹn trong 1.000 ngày vàng đầu đời"
        packages={allPackages}
        showLargeCard={false}
      />

      {/* Events Grid Section */}
      <section 
        className="section-wrapper relative w-full max-w-full overflow-x-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1920&h=1080&fit=crop)',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/95 z-0"></div>
        
        <div className="container-custom relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              SỰ KIỆN NỔI BẬT
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 py-6 px-2 w-full max-w-full">
            {events.slice(0, 3).map((event, index) => (
              <motion.div
                key={event.id}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-50px" }}
                variants={scaleIn}
                transition={{ delay: index * 0.1 }}
                className="h-full w-full max-w-full min-w-0 p-2"
              >
                <Card className="bg-white border-0 shadow-card-lg overflow-hidden group hover:shadow-card-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 cursor-pointer h-full w-full max-w-full">
                  <div className="relative h-48 overflow-hidden w-full">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-4 md:p-6 min-w-0">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-2 mb-2 break-words">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString('vi-VN')}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="flex justify-center"
          >
            <Link href={ROUTES.EVENTS}>
              <Button size="lg" className="bg-transparent border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white hover:scale-105 transition-all duration-200 px-8 py-6 text-lg">
                Xem tất cả
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Expert Testimonials Section */}
      <section className="section-wrapper bg-white">
        <div className="container-custom">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              ĐÁNH GIÁ CHUYÊN GIA
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Những chia sẻ từ các chuyên gia hàng đầu
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="relative py-4"
          >
            <div className="relative w-full max-w-full px-2 sm:px-4 overflow-visible py-2">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={16}
                slidesPerView={1}
                breakpoints={{
                  768: { slidesPerView: 2, spaceBetween: 20 },
                  1024: { slidesPerView: 3, spaceBetween: 24 }
                }}
                navigation={{
                  nextEl: '.swiper-button-next-testimonials',
                  prevEl: '.swiper-button-prev-testimonials'
                }}
                loop
                className="swiper-container w-full max-w-full"
                style={{ paddingTop: '8px', paddingBottom: '8px', paddingLeft: '8px', paddingRight: '8px' }}
              >
                {testimonials.map((testimonial) => (
                  <SwiperSlide key={testimonial.id} style={{ height: 'auto' }}>
                    <div className="px-1 sm:px-2 py-2 h-full">
                      <Card className="bg-white border-2 border-gray-200 shadow-card-lg p-4 md:p-6 lg:p-8 h-full flex flex-col w-full max-w-full hover:shadow-card-2xl hover:-translate-y-2 transition-all duration-300">
                        <div className="flex flex-col items-center text-center mb-4 md:mb-6 shrink-0">
                          <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-4 ring-4 ring-[#F441A5]/20">
                            <Image
                              src={testimonial.image}
                              alt={testimonial.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                          <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-1 line-clamp-1">{testimonial.name}</h4>
                          <p className="text-sm text-[#F441A5] font-semibold line-clamp-1">{testimonial.role}</p>
                        </div>
                        <p className="text-sm md:text-base text-gray-700 leading-relaxed italic flex-grow break-words line-clamp-4">
                          "{testimonial.content}"
                        </p>
                        <div className="flex gap-1 mt-4 justify-center shrink-0">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className="h-4 w-4 md:h-5 md:w-5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </Card>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              <button className="swiper-button-prev-testimonials absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 rounded-full p-2 md:p-3 shadow-lg transition-all hover:scale-110" style={{ maxWidth: '48px', maxHeight: '48px' }}>
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-[#F441A5]" />
              </button>
              <button className="swiper-button-next-testimonials absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-20 bg-white hover:bg-gray-50 rounded-full p-2 md:p-3 shadow-lg transition-all hover:scale-110" style={{ maxWidth: '48px', maxHeight: '48px' }}>
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-[#F441A5]" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-wrapper gradient-primary text-white relative w-full max-w-full overflow-x-hidden">
        <div className="absolute inset-0 bg-black/10 z-0"></div>
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="space-y-8 text-center lg:text-left"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                SẴN SÀNG BẮT ĐẦU HÀNH TRÌNH?
              </h2>
              <p className="text-xl md:text-2xl text-white/90">
                Tham gia cùng hàng nghìn gia đình đã tin tưởng chọn IPD8 để đồng hành cùng con
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href={ROUTES.COURSES}>
                  <Button size="lg" className="bg-white text-[#F441A5] hover:bg-gray-100 hover:scale-105 transition-all duration-200 px-8 py-6 text-lg font-semibold">
                    Đăng ký ngay
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href={ROUTES.CONTACT}>
                  <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white/10 hover:scale-105 transition-all duration-200 px-8 py-6 text-lg font-semibold">
                    Liên hệ tư vấn
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right Column - Video */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
              style={{ aspectRatio: '16/9' }}
            >
              <iframe
                src="https://drive.google.com/file/d/1QLhnW_tJ9HxYW2sXwikB6EiHLNiAfGfY/preview"
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Sẵn sàng bắt đầu hành trình cùng IPD8"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
