'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CourseHero } from '@/components/courses/CourseHero'
import { CourseFilter, FilterCategory } from '@/components/courses/CourseFilter'
import { CourseSection } from '@/components/courses/CourseSection'
import { CourseCardData } from '@/components/courses/CourseCard'
import { ROUTES } from '@/lib/constants'
import { Button } from '@/components/ui/button'

// Mock data for course listing
const allCourses: CourseCardData[] = [
  // Khóa học thử
  {
    id: '1',
    slug: 'goi-hoc-thu-99k',
    title: 'GÓI HỌC THỬ 01 BUỔI 99K',
    description: 'Trải nghiệm một buổi học với giá ưu đãi để hiểu rõ phương pháp giảng dạy của IPD8',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
    duration: '1 buổi',
    instructor: 'Chuyên gia IPD8',
    benefitsMom: 'Hiểu rõ phương pháp',
    benefitsBaby: 'Đánh giá phát triển',
    price: '99.000đ',
    featured: true,
    category: 'Học thử'
  },
  {
    id: '2',
    slug: 'goi-hoc-thu-mien-phi',
    title: 'GÓI HỌC THỬ MIỄN PHÍ',
    description: 'Trải nghiệm miễn phí 2 buổi học để làm quen với môi trường học tập',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop',
    duration: '2 buổi',
    instructor: 'Chuyên gia IPD8',
    benefitsMom: 'Trải nghiệm chất lượng',
    benefitsBaby: 'Làm quen môi trường',
    price: 'Miễn phí',
    featured: false,
    category: 'Học thử'
  },
  
  // Khóa học tháng
  {
    id: '3',
    slug: 'goi-03-thang',
    title: 'GÓI 03 THÁNG',
    description: 'Chương trình học 3 tháng với hỗ trợ liên tục từ đội ngũ chuyên gia',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=600&fit=crop',
    duration: '3 tháng',
    instructor: 'Chuyên gia IPD8',
    benefitsMom: 'Hỗ trợ liên tục',
    benefitsBaby: 'Theo dõi tiến độ',
    price: 'Liên hệ',
    featured: false,
    category: 'Gói tháng'
  },
  {
    id: '4',
    slug: 'goi-06-thang',
    title: 'GÓI 06 THÁNG',
    description: 'Chương trình học 6 tháng toàn diện cho mẹ và bé',
    image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&h=600&fit=crop',
    duration: '6 tháng',
    instructor: 'Chuyên gia IPD8',
    benefitsMom: 'Đồng hành dài hạn',
    benefitsBaby: 'Phát triển bền vững',
    price: 'Liên hệ',
    featured: true,
    category: 'Gói tháng'
  },
  {
    id: '5',
    slug: 'goi-12-thang',
    title: 'GÓI 12 THÁNG',
    description: 'Chương trình học 12 tháng với ưu đãi đặc biệt',
    image: 'https://images.unsplash.com/photo-1445633629932-0029acc44e88?w=800&h=600&fit=crop',
    duration: '12 tháng',
    instructor: 'Chuyên gia IPD8',
    benefitsMom: 'Tiết kiệm tối đa',
    benefitsBaby: 'Cả năm đồng hành',
    price: 'Liên hệ',
    featured: false,
    category: 'Gói tháng'
  },
  
  // Gói đặc biệt
  {
    id: '6',
    slug: 'combo-me-bau',
    title: 'COMBO MẸ BẦU',
    description: 'Gói combo đặc biệt dành cho mẹ bầu từ thai kỳ đến sau sinh',
    image: 'https://images.unsplash.com/photo-1505028106030-e07ea1bd80c3?w=800&h=600&fit=crop',
    duration: '9 tháng',
    instructor: 'Chuyên gia IPD8',
    benefitsMom: 'Thai kỳ an toàn',
    benefitsBaby: 'Bé khỏe mạnh',
    price: 'Liên hệ',
    featured: true,
    category: 'Đặc biệt'
  },
]

export default function CoursesPage() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all')

  // Filter courses based on active filter
  const filteredCourses = activeFilter === 'all' 
    ? allCourses 
    : allCourses.filter(course => {
        if (activeFilter === 'hoc-thu-99k') return course.category === 'Học thử'
        if (activeFilter === 'goi-3-6-12-24-thang') return course.category === 'Gói tháng'
        if (activeFilter === 'combo-6-buoi') return course.category === 'Đặc biệt'
        // For other filters, match by slug or category
        if (activeFilter === 'me-bau') return course.slug.includes('me-bau') || course.category === 'Mẹ bầu'
        if (activeFilter === '0-12-thang') return course.slug.includes('0-12') || course.category === '0-12 tháng'
        if (activeFilter === '13-24-thang') return course.slug.includes('13-24') || course.category === '13-24 tháng'
        return true
      })

  const trialCourses = filteredCourses.filter(c => c.category === 'Học thử')
  const monthCourses = filteredCourses.filter(c => c.category === 'Gói tháng')
  const specialCourses = filteredCourses.filter(c => c.category === 'Đặc biệt')

  return (
    <>
      {/* Hero Banner */}
      <CourseHero />

      {/* Filter Bar */}
      <CourseFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Course Sections */}
      {trialCourses.length > 0 && (
        <CourseSection
          title="Khóa học thử"
          subtitle="Trải nghiệm chất lượng với giá ưu đãi"
          courses={trialCourses}
        />
      )}

      {monthCourses.length > 0 && (
        <CourseSection
          title="Khóa học tháng"
          subtitle="Chương trình học dài hạn với hỗ trợ liên tục"
          courses={monthCourses}
        />
      )}

      {specialCourses.length > 0 && (
        <CourseSection title="Gói đặc biệt" subtitle="Các gói học với ưu đãi đặc biệt" courses={specialCourses} />
      )}

      {/* CTA Section */}
      <section className="section-wrapper gradient-primary text-white relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Chưa tìm được gói học phù hợp?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Liên hệ với chúng tôi để được tư vấn chi tiết về gói học phù hợp nhất cho bé
            </p>
            <Link href={ROUTES.CONTACT}>
              <Button size="lg" className="bg-white text-[#F441A5] hover:bg-white/90 hover:scale-105 transition-all duration-200">
                Liên hệ tư vấn
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
