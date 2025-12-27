'use client'

import React, { useState, use } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { CourseFilter, FilterCategory } from '@/components/courses/CourseFilter'
import { TimelineItem, TimelineSession } from '@/components/courses/TimelineItem'
import { PricingCard, PricingOption } from '@/components/courses/PricingCard'
import { ContactForm } from '@/components/courses/ContactForm'
import { Button } from '@/components/ui/button'
import { mockCourses, courseContentMap } from '@/data/courses'
import { courseSessionsMap, defaultSessions } from '@/data/courseSessions'
import { ROUTES } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { validateSlug } from '@/lib/security'

// Placeholder pricing options
const pricingOptions: PricingOption[] = [
  {
    id: 'group',
    title: 'Học nhóm',
    price: 'Liên hệ',
    features: [
      'Học cùng nhiều phụ huynh khác',
      'Tương tác và chia sẻ kinh nghiệm',
      'Giá ưu đãi hơn',
      'Lịch học linh hoạt',
      'Hỗ trợ từ đội ngũ chuyên gia',
    ],
    popular: true,
  },
  {
    id: 'one-on-one',
    title: 'Học 1-1',
    price: 'Liên hệ',
    features: [
      'Học riêng với chuyên gia',
      'Lịch học theo yêu cầu',
      'Tập trung vào nhu cầu cá nhân',
      'Tiến độ học tập tối ưu',
      'Hỗ trợ 24/7',
    ],
  },
]

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] }
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  // Unwrap params Promise in Next.js 16
  const { slug } = use(params)
  
  // Validate and sanitize slug to prevent injection attacks
  const validatedSlug = validateSlug(slug)
  
  const course = validatedSlug ? mockCourses.find((c) => c.slug === validatedSlug) : null
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all')

  // Check if slug matches a reserved route
  const reservedRoutes = [
    'about', 'contact', 'trial', 'courses', 'events', 'policies', 
    'experts', 'blog', 'schedule', 'faqs', 'login', 'register', 'dashboard'
  ]
  
  if (!validatedSlug || reservedRoutes.includes(validatedSlug)) {
    return null // Let Next.js handle reserved routes or invalid slugs
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Khóa học không tồn tại
          </h1>
          <p className="text-gray-600 mb-8">
            Khóa học bạn tìm kiếm không có trong hệ thống.
          </p>
          <Link href={ROUTES.COURSES || '/'}>
            <Button>Quay lại danh sách khóa học</Button>
          </Link>
        </div>
      </div>
    )
  }

  const sessions: TimelineSession[] = courseSessionsMap[course.slug] || defaultSessions

  return (
    <>
      {/* Hero Banner - Full Width */}
      <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-white">
        <Image
          src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1920&h=1080&fit=crop'}
          alt={course.title}
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F441A5]/80 to-[#FF5F6D]/80"></div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container-custom">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white max-w-3xl"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {course.title}
              </h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Category Filter Bar */}
      <CourseFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Main Title Section */}
      <section className="w-full bg-white pt-20 md:pt-24 lg:pt-28 pb-12 md:pb-16">
        <div className="container-custom">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {course.title}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                {course.description}
              </p>
              
              {/* Price and CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-4">
                <div className="bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white px-8 py-4 rounded-2xl shadow-lg">
                  <p className="text-sm font-medium mb-1">Học phí</p>
                  <p className="text-3xl md:text-4xl font-bold">
                    {course.price ? formatCurrency(course.price) : 'Liên hệ'}
                  </p>
                </div>
                <Link href={ROUTES.TRIAL || ROUTES.COURSES}>
                  <Button
                    size="lg"
                    className="bg-transparent border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white hover:scale-105 transition-all duration-200"
                  >
                    Đăng ký ngay
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500">*Giá trên chưa bao gồm VAT</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Course Content Section */}
      {courseContentMap[course.slug] && (
        <section className="w-full bg-gray-50 py-20 md:py-24 lg:py-28">
          <div className="container-custom max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="prose prose-lg max-w-none"
            >
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                <div className="text-gray-800 whitespace-pre-line leading-relaxed">
                  {courseContentMap[course.slug].split('\n').map((line, index) => {
                    // Format special lines (emojis, headings, etc.)
                    if (line.trim().startsWith('✨') || line.trim().startsWith('🌟') || line.trim().startsWith('💛') || line.trim().startsWith('💗') || line.trim().startsWith('🌱') || line.trim().startsWith('🍼') || line.trim().startsWith('👶') || line.trim().startsWith('🧠') || line.trim().startsWith('📘') || line.trim().startsWith('👉') || line.trim().startsWith('🎥') || line.trim().startsWith('📌') || line.trim().startsWith('🧩') || line.trim().startsWith('👑') || line.trim().startsWith('🤰') || line.trim().startsWith('💦') || line.trim().startsWith('🌸') || line.trim().startsWith('🌷')) {
                      return (
                        <p key={index} className="text-lg md:text-xl font-medium text-gray-900 mb-4">
                          {line}
                        </p>
                      )
                    }
                    if (line.trim() === '') {
                      return <br key={index} />
                    }
                    return (
                      <p key={index} className="text-base md:text-lg text-gray-700 mb-3">
                        {line}
                      </p>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Timeline Section */}
      <section className="w-full bg-gray-50 py-20 md:py-24 lg:py-28">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 md:mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Lộ trình chi tiết
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Chương trình học được thiết kế khoa học, phù hợp với từng giai đoạn phát triển
            </p>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* Center line - Desktop only */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#F441A5] to-[#FF5F6D] transform -translate-x-1/2"></div>

            {/* Timeline items */}
            <div className="space-y-12 lg:space-y-16">
              {sessions.map((session, index) => (
                <TimelineItem
                  key={session.id}
                  session={session}
                  index={index}
                  isEven={index % 2 === 0}
                />
              ))}
            </div>
          </div>

          {/* CTAs below timeline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 md:mt-20 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href={ROUTES.TRIAL || ROUTES.COURSES}>
              <Button
                size="lg"
                className="btn-gradient-pink px-8 py-6 text-lg font-semibold"
              >
                Đăng ký ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href={ROUTES.TRIAL || ROUTES.COURSES}>
              <Button
                size="lg"
                className="bg-transparent border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white hover:scale-105 transition-all duration-200 px-8 py-6 text-lg font-semibold"
              >
                Đăng ký học thử
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Pricing Options */}
      <section className="w-full bg-white py-20 md:py-24 lg:py-28">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 md:mb-20"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Lựa chọn hình thức học
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Chọn hình thức học phù hợp với nhu cầu và lịch trình của bạn
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pricingOptions.map((option, index) => (
              <PricingCard key={option.id} option={option} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <ContactForm />
    </>
  )
}

