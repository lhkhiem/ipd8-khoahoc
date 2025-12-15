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

// Course packages data
const coursePackages = [
  {
    id: 1,
    title: 'DÀNH CHO MẸ BẦU/ CÓ CON TỪ 0 – 12 THÁNG',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop',
    description: 'Chương trình toàn diện cho mẹ bầu và bé sơ sinh',
    price: 'Liên hệ',
    duration: '12 tháng',
    instructor: 'Đội ngũ chuyên gia IPD8',
    benefits: ['Chăm sóc thai kỳ', 'Dinh dưỡng mẹ và bé', 'Phát triển trí tuệ']
  },
  {
    id: 2,
    title: 'DÀNH CHO MẸ CÓ CON TỪ 13 – 24 THÁNG',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=600&fit=crop',
    description: 'Hỗ trợ phát triển toàn diện cho bé từ 13-24 tháng',
    price: 'Liên hệ',
    duration: '12 tháng',
    instructor: 'Đội ngũ chuyên gia IPD8',
    benefits: ['Phát triển vận động', 'Kỹ năng giao tiếp', 'Dinh dưỡng hợp lý']
  },
  {
    id: 3,
    title: 'GÓI HỌC THỬ 01 BUỔI 99K',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
    description: 'Trải nghiệm một buổi học với giá ưu đãi',
    price: '99.000đ',
    duration: '1 buổi',
    instructor: 'Đội ngũ chuyên gia IPD8',
    benefits: ['Trải nghiệm thực tế', 'Tư vấn miễn phí', 'Đánh giá nhu cầu']
  }
]

// Featured courses data
const featuredCourses = [
  {
    id: 1,
    title: 'GÓI HỌC THỬ 1 BUỔI 99K',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop',
    duration: '1 buổi',
    instructor: 'Chuyên gia IPD8',
    benefitsMom: 'Hiểu rõ phương pháp',
    benefitsBaby: 'Đánh giá phát triển',
    price: '99.000đ'
  },
  {
    id: 2,
    title: 'GÓI COMBO 06 BUỔI',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=400&fit=crop',
    duration: '6 buổi',
    instructor: 'Chuyên gia IPD8',
    benefitsMom: 'Kiến thức toàn diện',
    benefitsBaby: 'Phát triển đúng giai đoạn',
    price: 'Liên hệ'
  },
  {
    id: 3,
    title: 'GÓI 03 THÁNG',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop',
    duration: '3 tháng',
    instructor: 'Chuyên gia IPD8',
    benefitsMom: 'Hỗ trợ liên tục',
    benefitsBaby: 'Theo dõi tiến độ',
    price: 'Liên hệ'
  },
  {
    id: 4,
    title: 'GÓI 06 THÁNG',
    image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&h=400&fit=crop',
    duration: '6 tháng',
    instructor: 'Chuyên gia IPD8',
    benefitsMom: 'Chương trình dài hạn',
    benefitsBaby: 'Phát triển bền vững',
    price: 'Liên hệ'
  },
  {
    id: 5,
    title: 'GÓI 12 THÁNG',
    image: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=600&h=400&fit=crop',
    duration: '12 tháng',
    instructor: 'Chuyên gia IPD8',
    benefitsMom: 'Đồng hành trọn năm',
    benefitsBaby: 'Phát triển toàn diện',
    price: 'Liên hệ'
  },
  {
    id: 6,
    title: 'GÓI 24 THÁNG',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop',
    duration: '24 tháng',
    instructor: 'Chuyên gia IPD8',
    benefitsMom: 'Hỗ trợ lâu dài',
    benefitsBaby: 'Hành trình phát triển',
    price: 'Liên hệ'
  }
]

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
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Course Category Slider */}
      <section className="relative gradient-primary text-white min-h-[600px] md:min-h-[700px] lg:min-h-[800px] flex flex-col w-full max-w-full overflow-visible">
        <div className="absolute inset-0 bg-black/10 z-0"></div>
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 lg:px-12 xl:px-16 relative z-10 flex flex-col flex-grow py-4 md:py-6 lg:py-8">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="text-center mb-6 md:mb-8 lg:mb-10 mt-5 relative z-10"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 md:mb-4 lg:mb-5 leading-tight break-words px-2">
              TRUNG TÂM 1.000 NGÀY VÒNG ĐẦU ĐỜI
            </h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 md:mb-4 lg:mb-5 leading-tight break-words px-2">
              <span className="text-yellow-300">VIỆT NAM - NEW ZEALAND IPD8</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto break-words px-4">
              Đồng hành cùng mẹ và bé từ thai kỳ đến 12 tuổi
            </p>
          </motion.div>

          {/* Course Packages - Grid on desktop, Swiper on mobile */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="relative flex-grow flex flex-col w-full max-w-full overflow-visible mt-6 md:mt-8 lg:mt-10"
          >
            {/* Desktop Grid - 3 cards always visible */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-4 xl:gap-6 w-full max-w-full px-4 xl:px-6 py-2 relative z-20">
              {coursePackages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="h-full w-full max-w-full min-w-0 relative z-20 p-2"
                >
                  <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg h-full flex flex-col group hover:scale-105 transition-all duration-300 rounded-2xl overflow-hidden w-full max-w-full relative z-20" style={{ transformOrigin: 'center', borderRadius: '1rem', willChange: 'transform', backfaceVisibility: 'hidden' }}>
                    <div className="relative h-48 lg:h-56 xl:h-64 overflow-hidden shrink-0 w-full">
                      <Image
                        src={pkg.image}
                        alt={pkg.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 1024px) 50vw, 33vw"
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
                        <Link href={pkg.id === 3 ? ROUTES.TRIAL : `${ROUTES.COURSES}?package=${pkg.id}`} className="block w-full">
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
                style={{ paddingBottom: '40px', width: '100%', maxWidth: '100%', paddingTop: '8px', paddingLeft: '8px', paddingRight: '8px' }}
              >
                {coursePackages.map((pkg) => (
                  <SwiperSlide key={pkg.id} style={{ height: 'auto', width: '100%', maxWidth: '100%' }}>
                    <div className="h-full px-1 sm:px-2 py-2 w-full max-w-full relative z-20">
                      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg h-full flex flex-col group hover:scale-105 transition-all duration-300 rounded-2xl overflow-hidden w-full max-w-full relative z-20" style={{ transformOrigin: 'center', borderRadius: '1rem', willChange: 'transform', backfaceVisibility: 'hidden' }}>
                        <div className="relative h-40 md:h-48 overflow-hidden shrink-0 w-full">
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
                            <Link href={pkg.id === 3 ? ROUTES.TRIAL : `${ROUTES.COURSES}?package=${pkg.id}`} className="block w-full">
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
              <button className="swiper-button-prev-custom hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110 items-center justify-center" style={{ maxWidth: '48px', maxHeight: '48px', width: '48px', height: '48px' }}>
                <ChevronLeft className="h-5 w-5 text-[#F441A5]" />
              </button>
              <button className="swiper-button-next-custom hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all hover:scale-110 items-center justify-center" style={{ maxWidth: '48px', maxHeight: '48px', width: '48px', height: '48px' }}>
                <ChevronRight className="h-5 w-5 text-[#F441A5]" />
              </button>
              
              {/* Custom Pagination - Only for mobile/tablet */}
              <div className="swiper-pagination-custom !relative flex justify-center gap-2 mt-4 md:mt-6 w-full max-w-full"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose IPD8 Section */}
      <section className="section-wrapper bg-white w-full max-w-full overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=800&h=600&fit=crop"
                alt="Why Choose IPD8"
                fill
                className="object-cover"
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
                  Trung tâm 1.000 ngày vòng đầu đời Việt Nam - New Zealand IPD8 được thành lập ngày 16/04/2025, 
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
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 overflow-visible">
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
                    <Card className="bg-white border-0 shadow-lg overflow-hidden h-full flex flex-col group hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full max-w-full">
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

      {/* Featured Courses Section */}
      <section className="section-wrapper bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              CÁC GÓI HỌC NỔI BẬT
            </h2>
            <p className="text-xl text-gray-600">
              Chọn gói học phù hợp với nhu cầu của bạn
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-12 py-6 px-2 w-full max-w-full">
            {featuredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-50px" }}
                variants={scaleIn}
                transition={{ delay: index * 0.1 }}
                className="h-full w-full max-w-full min-w-0 p-2"
              >
                <Card className="bg-white border-2 border-gray-100 shadow-lg overflow-hidden group hover:shadow-2xl hover:scale-105 hover:border-[#F441A5] transition-all duration-300 h-full w-full max-w-full">
                  <div className="relative h-48 overflow-hidden w-full">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-4 md:p-6 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 line-clamp-2 break-words">{course.title}</h3>
                    <div className="space-y-2 mb-4 text-sm text-gray-600 min-w-0">
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
                    <Link href={`${ROUTES.COURSES}?course=${course.id}`} className="block w-full">
                      <Button className="w-full bg-transparent border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white hover:scale-105 transition-all duration-200 text-sm">
                        Chi tiết gói học
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center"
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
        
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
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
                <Card className="bg-white border-0 shadow-lg overflow-hidden group hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer h-full w-full max-w-full">
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
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
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
                      <Card className="bg-white border-2 border-gray-100 shadow-lg p-4 md:p-6 lg:p-8 h-full flex flex-col w-full max-w-full">
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
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              SẴN SÀNG BẮT ĐẦU HÀNH TRÌNH?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Tham gia cùng hàng nghìn gia đình đã tin tưởng chọn IPD8 để đồng hành cùng con
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
        </div>
      </section>
    </div>
  )
}
