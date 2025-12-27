'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/shared/breadcrumb'
import { ROUTES } from '@/lib/constants'
import { ChevronRight, Play, Users, Award, BookOpen, ArrowRight, Brain, Shield, TrendingUp, Heart, FileCheck, BadgeCheck, X, Download, Printer } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// Mock experts data
const experts = [
  {
    id: 1,
    name: 'TS. Nguyễn Thị Lan',
    role: 'Chuyên gia Nhi khoa',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop',
    description: 'Hơn 20 năm kinh nghiệm trong lĩnh vực chăm sóc và phát triển trẻ em',
    achievements: ['Tiến sĩ Nhi khoa', '20+ năm kinh nghiệm', 'Chuyên gia hàng đầu'],
    specialties: ['Chăm sóc trẻ sơ sinh', 'Phát triển trẻ em', 'Dinh dưỡng nhi khoa'],
    slug: 'ts-nguyen-thi-lan'
  },
  {
    id: 2,
    name: 'BS. Trần Minh Anh',
    role: 'Chuyên gia Dinh dưỡng',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=600&fit=crop',
    description: 'Chuyên gia dinh dưỡng cho mẹ bầu và trẻ nhỏ, tác giả nhiều công trình nghiên cứu',
    achievements: ['Bác sĩ Dinh dưỡng', 'Tác giả 10+ công trình', 'Chứng chỉ quốc tế'],
    specialties: ['Dinh dưỡng mẹ bầu', 'Dinh dưỡng trẻ em', 'Thực đơn khoa học'],
    slug: 'bs-tran-minh-anh'
  },
  {
    id: 3,
    name: 'TS. Phạm Văn Hùng',
    role: 'Chuyên gia Tâm lý',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=600&fit=crop',
    description: 'Chuyên gia tâm lý trẻ em với phương pháp giáo dục hiện đại',
    achievements: ['Tiến sĩ Tâm lý học', '15+ năm kinh nghiệm', 'Phương pháp hiện đại'],
    specialties: ['Tâm lý trẻ em', 'Giáo dục sớm', 'Phát triển nhận thức'],
    slug: 'ts-pham-van-hung'
  },
  {
    id: 4,
    name: 'BS. Lê Thị Mai',
    role: 'Chuyên gia Sản khoa',
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&h=600&fit=crop',
    description: 'Bác sĩ sản khoa với hơn 15 năm kinh nghiệm chăm sóc mẹ bầu',
    achievements: ['Bác sĩ Sản khoa', '15+ năm kinh nghiệm', 'Chuyên gia hàng đầu'],
    specialties: ['Chăm sóc thai kỳ', 'Sức khỏe mẹ bầu', 'Sau sinh'],
    slug: 'bs-le-thi-mai'
  },
  {
    id: 5,
    name: 'TS. Hoàng Văn Đức',
    role: 'Chuyên gia Giáo dục sớm',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
    description: 'Chuyên gia giáo dục sớm với phương pháp Montessori và Reggio Emilia',
    achievements: ['Tiến sĩ Giáo dục', 'Chứng chỉ quốc tế', 'Phương pháp hiện đại'],
    specialties: ['Giáo dục sớm', 'Phát triển kỹ năng', 'Montessori'],
    slug: 'ts-hoang-van-duc'
  },
  {
    id: 6,
    name: 'BS. Nguyễn Thị Hoa',
    role: 'Chuyên gia Phát triển vận động',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop',
    description: 'Chuyên gia về phát triển vận động và thể chất cho trẻ em',
    achievements: ['Bác sĩ Vật lý trị liệu', '12+ năm kinh nghiệm', 'Chuyên gia hàng đầu'],
    specialties: ['Vận động trẻ em', 'Phát triển thể chất', 'Vật lý trị liệu'],
    slug: 'bs-nguyen-thi-hoa'
  }
]

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6 }
}

// Chứng nhận data với ảnh
const certificates = [
  {
    id: 1,
    title: 'GIẤY CHỨNG NHẬN IPD8',
    description: 'TRUNG TÂM NGHIÊN CỨU VÀ PHÁT TRIỂN TIỀM NĂNG CON NGUỜI',
    detail: 'QUYẾT ĐỊNH THÀNH LẬP TRUNG TÂM NGHIÊN CỨU IPD8\nQuyết định bởi Viện Trưởng Viện Nghiên Cứu Giáo Dục Và Phát Triển Tiềm Năng Con Người - IPD8',
    images: ['/image/PressUp - SfJLiv7avp-6.webp'],
    icon: BadgeCheck
  },
  {
    id: 2,
    title: 'QUYẾT ĐỊNH CỦA ĐẠI HỌC Y PHẠM NGỌC THẠCH',
    description: 'Đào tạo chuyên môn liên ngành',
    detail: 'Y học - Giáo dục sớm trong 1000 ngày đầu đời',
    images: [
      '/image/PressUp - xgK8yhAoxY-5.webp',
      '/image/PressUp - 2d9uss8UAm-4.webp'
    ],
    icon: FileCheck
  },
  {
    id: 3,
    title: 'ĐĂNG KÝ QUYỀN TÁC GIẢ',
    description: 'Tài liệu chuyên môn liên ngành',
    detail: 'Y học - Giáo dục sớm trong 1000 ngày đầu đời',
    images: [
      '/image/PressUp - FDAoXLawSB-3.webp',
      '/image/PressUp - iVQDfWHIHL-2.webp',
      '/image/PressUp - eCvFNSLtqK-1.webp'
    ],
    icon: FileCheck
  }
]

export default function ExpertsPage() {
  const [headerHeight, setHeaderHeight] = useState<string>('104px')
  const [selectedCertificate, setSelectedCertificate] = useState<typeof certificates[0] | null>(null)

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

    // Initial calculation
    updateHeaderHeight()

    // Update on resize
    const handleResize = () => {
      requestAnimationFrame(() => {
        updateHeaderHeight()
      })
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    }

    // Also update when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateHeaderHeight)
    } else {
      updateHeaderHeight()
    }

    // Update after a short delay to ensure header is rendered
    const timeoutId = setTimeout(updateHeaderHeight, 100)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      }
      document.removeEventListener('DOMContentLoaded', updateHeaderHeight)
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b" style={{ marginTop: headerHeight }}>
        <div className="container-custom py-4">
          <Breadcrumb
            items={[
              { label: 'Chuyên gia IPD8', href: ROUTES.EXPERTS }
            ]}
          />
        </div>
      </div>

      {/* Sub-menu Navigation */}
      <section className="bg-white border-b">
        <div className="container-custom py-6">
          <div className="flex items-center gap-4">
            <Link
              href={ROUTES.EXPERTS}
              className="btn-gradient-pink px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Users className="h-5 w-5" />
              CHUYÊN GIA IPD8
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.EXPERT_PERSPECTIVE}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold border-2 border-gray-200 hover:border-[#F441A5] hover:text-[#F441A5] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Góc chuyên gia
            </Link>
          </div>
        </div>
      </section>

      {/* Video Section - 1/3 đầu page */}
      <section className="section-wrapper bg-gradient-to-br from-gray-50 to-white">
        <div className="container-custom">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 text-center" style={{ lineHeight: '1.2' }}>
              ĐỘI NGŨ CHUYÊN GIA HÀNG ĐẦU
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center">
              Các chuyên gia đầu ngành đang hợp tác cùng IPD8 để mang đến kiến thức và trải nghiệm tốt nhất cho mẹ và bé
            </p>
          </motion.div>

          {/* Video Section */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="relative w-full max-w-5xl mx-auto mb-16 rounded-2xl overflow-hidden shadow-2xl"
            style={{ aspectRatio: '16/9' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#F441A5]/20 to-[#FF5F6D]/20" />
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Button
                size="lg"
                className="bg-white/90 hover:bg-white text-[#F441A5] rounded-full p-6 shadow-xl hover:scale-110 transition-all duration-300"
              >
                <Play className="h-12 w-12 fill-[#F441A5]" />
              </Button>
            </div>
            <Image
              src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1920&h=1080&fit=crop"
              alt="Video chia sẻ từ chuyên gia"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Experts Grid Section */}
      <section className="section-wrapper bg-white">
        <div className="container-custom">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ lineHeight: '1.2' }}>
              CÁC CHUYÊN GIA ĐANG HỢP TÁC
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Đội ngũ chuyên gia giàu kinh nghiệm, tận tâm và chuyên nghiệp
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2 py-2 overflow-visible">
            {experts.map((expert, index) => (
              <motion.div
                key={expert.id}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="p-2"
              >
                <Link href={`/experts/${expert.slug}`}>
                  <Card className="bg-white border-2 border-gray-200 shadow-lg overflow-hidden group hover:shadow-2xl hover:border-[#F441A5] transition-all duration-300 h-full flex flex-col cursor-pointer">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={expert.image}
                        alt={expert.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ lineHeight: '1.2' }}>
                          {expert.name}
                        </h3>
                        <p className="text-sm text-[#F441A5] font-semibold mb-3">
                          {expert.role}
                        </p>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                          {expert.description}
                        </p>
                      </div>

                      <div className="space-y-3 mb-4 flex-grow">
                        <div className="flex items-start gap-2">
                          <Award className="h-5 w-5 text-[#F441A5] shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Thành tựu:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {expert.achievements.map((achievement, idx) => (
                                <li key={idx}>• {achievement}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <BookOpen className="h-5 w-5 text-[#F441A5] shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Chuyên môn:</p>
                            <div className="flex flex-wrap gap-1">
                              {expert.specialties.map((specialty, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md"
                                >
                                  {specialty}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="btn-gradient-pink w-full"
                      >
                        Xem chi tiết
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: 1000 Ngày Vàng - Giai Đoạn Vàng */}
      <section className="section-wrapper bg-gradient-to-br from-white to-gray-50">
        <div className="container-custom">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6" style={{ lineHeight: '1.2' }}>
              THÔNG TIN Y KHOA 1000 NGÀY
            </h2>
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white rounded-full text-sm font-semibold mb-6">
              Giai Đoạn Vàng
            </div>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
              1.000 ngày vàng là giai đoạn quyết định sự phát triển thể chất, trí tuệ và cảm xúc của trẻ, đóng vai trò then chốt trong việc hình thành nền tảng cho sự phát triển lâu dài của trẻ. Đây là thời kỳ duy nhất trong suốt cuộc đời mà não bộ và các chức năng sinh lý của trẻ có sự phát triển mạnh mẽ nhất.
            </p>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed">
              Giai đoạn 1.000 ngày vàng chỉ diễn ra một lần duy nhất, và nếu không được can thiệp hoặc đầu tư đúng cách, những cơ hội phát triển quan trọng sẽ không thể phục hồi hoàn toàn. Việc đầu tư vào giai đoạn này là một quyết định khoa học và chiến lược, đảm bảo sự phát triển toàn diện, vững chắc và tạo nền tảng cho sự thông minh, khỏe mạnh của trẻ trong tương lai.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section: Lợi ích của 1000 Ngày Vàng */}
      <section className="section-wrapper bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Lợi ích 1: Não bộ */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-[#F441A5] hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] flex items-center justify-center mb-6">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ lineHeight: '1.2' }}>
                Não bộ phát triển mạnh mẽ nhất
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Trong 1.000 ngày đầu, não bé phát triển đến 80% kích thước não người trưởng thành. Đây là nền tảng hình thành trí tuệ, khả năng học hỏi và cảm xúc sau này.
              </p>
            </motion.div>

            {/* Lợi ích 2: Hệ miễn dịch */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-[#F441A5] hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ lineHeight: '1.2' }}>
                Hệ miễn dịch được xây dựng từ sớm
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Những dưỡng chất mẹ hấp thu trong thai kỳ và cách nuôi dưỡng sau sinh ảnh hưởng trực tiếp đến khả năng miễn dịch của trẻ, giúp bé chống lại bệnh tật suốt đời.
              </p>
            </motion.div>

            {/* Lợi ích 3: Chiều cao */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-[#F441A5] hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] flex items-center justify-center mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ lineHeight: '1.2' }}>
                Chiều cao và tầm vóc được định hình
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Chế độ dinh dưỡng và chăm sóc trong giai đoạn này quyết định phần lớn đến chiều cao, xương và cơ bắp của bé trong tương lai.
              </p>
            </motion.div>

            {/* Lợi ích 4: Ngăn ngừa bệnh lý */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.3 }}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-[#F441A5] hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ lineHeight: '1.2' }}>
                Ngăn ngừa bệnh lý mạn tính sau này
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Nghiên cứu cho thấy thiếu dinh dưỡng hoặc chăm sóc kém trong 1000 ngày vàng có thể làm tăng nguy cơ bé bị tiểu đường, tim mạch, béo phì khi trưởng thành.
              </p>
            </motion.div>

            {/* Lợi ích 5: Sự gắn kết mẹ-con */}
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.4 }}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-[#F441A5] hover:shadow-lg transition-all duration-300 md:col-span-2 lg:col-span-1"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ lineHeight: '1.2' }}>
                Sự gắn kết mẹ - con được củng cố
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Từ trong bụng mẹ, bé đã cảm nhận được tình yêu thương qua từng lời nói, từng cái vuốt ve. Sự chăm sóc đúng cách giúp hình thành mối liên kết cảm xúc bền chặt giữa mẹ và con.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section: Giấy Chứng Nhận */}
      <section className="section-wrapper bg-gradient-to-br from-gray-50 to-white">
        <div className="container-custom">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4" style={{ lineHeight: '1.2' }}>
              GIẤY CHỨNG NHẬN
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              IPD8 được công nhận và chứng nhận bởi các tổ chức uy tín
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {certificates.map((certificate, index) => {
              const Icon = certificate.icon
              return (
                <motion.div
                  key={certificate.id}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedCertificate(certificate)}
                  className={`bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#F441A5] hover:shadow-lg transition-all duration-300 cursor-pointer ${
                    certificate.id === 3 ? 'md:col-span-2' : ''
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] flex items-center justify-center mb-6 mx-auto">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center" style={{ lineHeight: '1.2' }}>
                    {certificate.title}
                  </h3>
                  <div className="space-y-2 text-center text-gray-600">
                    <p className="font-semibold">{certificate.description}</p>
                    <p className="text-sm whitespace-pre-line">{certificate.detail}</p>
                  </div>
                  <div className="mt-6 text-center">
                    <Button
                      variant="outline"
                      className="border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white"
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-wrapper bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white">
        <div className="container-custom text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ lineHeight: '1.2' }}>
              MUỐN TƯ VẤN TRỰC TIẾP VỚI CHUYÊN GIA?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Liên hệ với chúng tôi để được tư vấn miễn phí từ các chuyên gia hàng đầu
            </p>
            <Link href={ROUTES.CONTACT}>
              <Button size="lg" className="bg-white text-[#F441A5] hover:bg-gray-100 hover:scale-105 transition-all duration-200 px-8 py-6 text-lg font-semibold">
                Liên hệ ngay
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Modal hiển thị ảnh chứng nhận */}
      <Dialog open={!!selectedCertificate} onOpenChange={(open) => !open && setSelectedCertificate(null)}>
        <DialogContent className="max-w-[68vw] max-h-[68vh] p-0 flex flex-col overflow-hidden [&>button]:hidden">
          {selectedCertificate && (
            <>
              <DialogHeader className="px-4 pt-4 pb-3 flex-shrink-0 border-b border-gray-200">
                <div className="flex items-center justify-between gap-4">
                  <DialogTitle className="text-base md:text-lg font-bold text-gray-900 flex-1 line-clamp-2">
                    {selectedCertificate.title}
                  </DialogTitle>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = selectedCertificate.images[0]
                        link.download = `${selectedCertificate.title.replace(/\s+/g, '_')}.webp`
                        link.click()
                      }}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110"
                      aria-label="Tải xuống"
                      title="Tải xuống"
                    >
                      <Download className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110"
                      aria-label="In"
                      title="In"
                    >
                      <Printer className="h-4 w-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => setSelectedCertificate(null)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-200 hover:scale-110"
                      aria-label="Đóng"
                      title="Đóng"
                    >
                      <X className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                </div>
                <div className="text-center text-gray-600 mt-2">
                  <p className="font-semibold mb-1 text-xs md:text-sm line-clamp-1">{selectedCertificate.description}</p>
                  <p className="text-xs whitespace-pre-line line-clamp-2">{selectedCertificate.detail}</p>
                </div>
              </DialogHeader>
              <div className="px-4 pb-4 pt-4 flex-1 min-h-0 flex flex-col overflow-y-auto">
                {selectedCertificate.images.length === 1 ? (
                  // Hiển thị 1 ảnh
                  <div className="relative w-full bg-gray-100 rounded-lg overflow-y-auto overflow-x-auto flex items-start justify-center" style={{ minHeight: '400px', maxHeight: 'calc(68vh - 200px)' }}>
                    <Image
                      src={selectedCertificate.images[0]}
                      alt={selectedCertificate.title}
                      width={1200}
                      height={1600}
                      className="w-auto h-auto object-contain"
                      quality={90}
                    />
                  </div>
                ) : (
                  // Hiển thị slider cho nhiều ảnh
                  <div className="relative w-full flex flex-col" style={{ minHeight: '400px', height: 'calc(68vh - 200px)' }}>
                    <Swiper
                      modules={[Navigation, Pagination]}
                      spaceBetween={20}
                      slidesPerView={1}
                      navigation={{
                        nextEl: `.certificate-next-${selectedCertificate.id}`,
                        prevEl: `.certificate-prev-${selectedCertificate.id}`
                      }}
                      pagination={{
                        clickable: true,
                        el: `.certificate-pagination-${selectedCertificate.id}`
                      }}
                      className="certificate-swiper w-full"
                      style={{ height: '100%' }}
                    >
                      {selectedCertificate.images.map((image, index) => (
                        <SwiperSlide key={index} className="h-full">
                          <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-y-auto overflow-x-auto flex items-start justify-center pr-2">
                            <Image
                              src={image}
                              alt={`${selectedCertificate.title} - Trang ${index + 1}`}
                              width={1200}
                              height={1600}
                              className="w-auto h-auto object-contain"
                              quality={90}
                              style={{ minHeight: '400px' }}
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    
                    {/* Navigation buttons - căn giữa theo chiều dọc của khung ảnh */}
                    <button
                      className={`certificate-prev-${selectedCertificate.id} absolute left-4 z-20 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110`}
                      aria-label="Previous"
                      style={{ top: '50%', transform: 'translateY(-50%)' }}
                    >
                      <ChevronRight className="h-5 w-5 text-[#F441A5] rotate-180" />
                    </button>
                    <button
                      className={`certificate-next-${selectedCertificate.id} absolute right-16 z-20 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110`}
                      aria-label="Next"
                      style={{ top: '50%', transform: 'translateY(-50%)' }}
                    >
                      <ChevronRight className="h-5 w-5 text-[#F441A5]" />
                    </button>
                    
                    {/* Pagination */}
                    <div className={`certificate-pagination-${selectedCertificate.id} mt-3 flex justify-center flex-shrink-0 relative z-10`} />
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

