'use client'

import { motion } from 'framer-motion'
import { CourseCard, CourseCardData } from './CourseCard'

interface CourseSectionProps {
  title: string
  subtitle?: string
  courses: CourseCardData[]
  className?: string
}

export function CourseSection({ title, subtitle, courses, className }: CourseSectionProps) {
  if (courses.length === 0) return null

  return (
    <section className={className || 'section-wrapper bg-white'}>
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 py-6 px-2 overflow-visible w-full max-w-full">
          {courses.map((course, index) => (
            <div key={course.id} className="w-full max-w-full min-w-0 p-2">
              <CourseCard course={course} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

