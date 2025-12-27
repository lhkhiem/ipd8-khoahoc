'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CourseHero } from '@/components/courses/CourseHero'
import { CourseFilter, FilterCategory } from '@/components/courses/CourseFilter'
import { CourseSection } from '@/components/courses/CourseSection'
import { PackageSection } from '@/components/packages/PackageSection'
import { CourseCardData } from '@/components/courses/CourseCard'
import { ROUTES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { mockCourses } from '@/data/courses'
import { allPackages } from '@/data/packages'
import { formatCurrency } from '@/lib/utils'

// Convert Course to CourseCardData
const convertToCourseCardData = (course: typeof mockCourses[0]): CourseCardData => {
  const getCategory = (targetAudience: string, price: number): string => {
    if (price === 0) return 'Miễn phí'
    if (targetAudience === 'me-bau') return 'Mẹ bầu'
    if (targetAudience === '0-12-thang') return '0-12 tháng'
    if (targetAudience === '13-24-thang') return '13-24 tháng'
    return 'Khóa học'
  }

  const formatPrice = (price: number): string => {
    if (price === 0) return 'Miễn phí'
    return formatCurrency(price)
  }

  const getDuration = (durationMinutes: number): string => {
    if (durationMinutes === 0) return 'Truy cập không giới hạn'
    if (durationMinutes < 60) return `${durationMinutes} phút`
    if (durationMinutes < 1440) return `${Math.round(durationMinutes / 60)} giờ`
    return `${Math.round(durationMinutes / 1440)} ngày`
  }

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    image: course.thumbnailUrl || 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop',
    duration: getDuration(course.durationMinutes),
    instructor: 'Chuyên gia IPD8',
    benefitsMom: course.benefitsMom || '',
    benefitsBaby: course.benefitsBaby || '',
    price: formatPrice(course.price),
    featured: course.featured,
    category: getCategory(course.targetAudience, course.price),
  }
}

// Convert all courses
const allCourses: CourseCardData[] = mockCourses.map(convertToCourseCardData)

export default function CoursesPage() {
  const [headerHeight, setHeaderHeight] = useState<string>('104px')
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all')

  // Calculate header height
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (typeof window === 'undefined') return

      const header = document.querySelector('header')
      if (header) {
        const actualHeight = header.offsetHeight
        setHeaderHeight(`${actualHeight}px`)
      } else {
        setHeaderHeight(window.innerWidth >= 768 ? '140px' : '104px')
      }
    }

    updateHeaderHeight()

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

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateHeaderHeight)
    } else {
      updateHeaderHeight()
    }

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

  // Filter courses based on active filter
  const filteredCourses = useMemo(() => {
    if (activeFilter === 'all') return allCourses
    
    return allCourses.filter(course => {
      // Filter by target audience
      if (activeFilter === 'me-bau') {
        const courseData = mockCourses.find(c => c.id === course.id)
        return courseData?.targetAudience === 'me-bau'
      }
      
      if (activeFilter === '0-12-thang') {
        const courseData = mockCourses.find(c => c.id === course.id)
        return courseData?.targetAudience === '0-12-thang'
      }
      
      // Filter by price
      if (activeFilter === 'mien-phi') {
        return course.price === 'Miễn phí' || course.price === 0
      }
      
      if (activeFilter === 'co-phí') {
        return course.price !== 'Miễn phí' && course.price !== 0 && course.price !== 'Liên hệ'
      }
      
        return true
      })
  }, [activeFilter, allCourses])

  // Group courses by category for display
  const freeCourses = filteredCourses.filter(c => c.price === 'Miễn phí' || c.price === 0)
  const paidCourses = filteredCourses.filter(c => c.price !== 'Miễn phí' && c.price !== 0 && c.price !== 'Liên hệ')
  const featuredCourses = filteredCourses.filter(c => c.featured)

  return (
    <>
      {/* Hero Banner */}
      <CourseHero marginTop={headerHeight} />

      {/* Filter Bar */}
      <CourseFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Course Sections */}
      {activeFilter === 'all' && (
        <>
          {featuredCourses.length > 0 && (
            <CourseSection
              title="Khóa học nổi bật"
              subtitle="Các khóa học được yêu thích nhất"
              courses={featuredCourses}
            />
          )}
          {paidCourses.length > 0 && (
            <CourseSection
              title="Khóa học có phí"
              subtitle="Các khóa học với nội dung chuyên sâu và giá trị cao"
              courses={paidCourses}
            />
          )}
          {freeCourses.length > 0 && (
            <CourseSection
              title="Khóa học miễn phí"
              subtitle="Truy cập miễn phí các tài liệu và khóa học chất lượng"
              courses={freeCourses}
            />
          )}
        </>
      )}

      {activeFilter === 'co-phí' && paidCourses.length > 0 && (
        <CourseSection
          title="Khóa học có phí"
          subtitle="Các khóa học với nội dung chuyên sâu và giá trị cao"
          courses={paidCourses}
        />
      )}

      {activeFilter === 'mien-phi' && freeCourses.length > 0 && (
        <CourseSection
          title="Khóa học miễn phí"
          subtitle="Truy cập miễn phí các tài liệu và khóa học chất lượng"
          courses={freeCourses}
        />
      )}

      {(activeFilter === 'me-bau' || activeFilter === '0-12-thang') && filteredCourses.length > 0 && (
        <CourseSection
          title={activeFilter === 'me-bau' ? "Dành cho mẹ bầu" : "Dành cho bé 0–12 tháng"}
          subtitle={activeFilter === 'me-bau' ? "Các khóa học chuyên biệt dành cho mẹ bầu" : "Các khóa học phát triển toàn diện cho bé 0–12 tháng"}
          courses={filteredCourses}
        />
      )}

      {filteredCourses.length === 0 && (
        <section className="section-wrapper bg-white">
          <div className="container-custom text-center py-20">
            <p className="text-xl text-gray-600">Không tìm thấy khóa học nào phù hợp với bộ lọc đã chọn.</p>
          </div>
        </section>
      )}

      {/* Packages Section - Slider */}
      <PackageSection
        title="Gói học 8i - Giải pháp toàn diện"
        subtitle="Các gói học được thiết kế chuyên biệt cho từng giai đoạn phát triển của con, giúp mẹ đồng hành trọn vẹn trong 1.000 ngày vàng đầu đời"
        packages={allPackages}
        showLargeCard={false}
      />

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
