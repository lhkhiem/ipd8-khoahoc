'use client'

import { useState } from 'react'
import { CourseCard } from '@/components/course/course-card'
import { Course } from '@/types'
import { cn } from '@/lib/utils'

const categories = [
  { id: 'all', label: 'Tất cả', audience: null },
  { id: 'me-bau', label: 'Mẹ bầu', audience: 'Mẹ bầu' },
  { id: '0-12', label: '0-12 tháng', audience: 'Mẹ có con 0-12 tháng' },
  { id: '13-24', label: '13-24 tháng', audience: 'Mẹ có con 13-24 tháng' },
  { id: 'trial', label: 'Học thử', audience: 'Học thử' },
  { id: 'combo', label: 'Combo', audience: 'Combo' },
  { id: '3-6', label: '3-6 tuổi', audience: 'Trẻ 3-6 tuổi' },
]

interface CourseTabsProps {
  courses: Course[]
}

export function CourseTabs({ courses }: CourseTabsProps) {
  const [activeTab, setActiveTab] = useState('all')

  const filteredCourses = activeTab === 'all' 
    ? courses 
    : courses.filter(course => {
        const category = categories.find(c => c.id === activeTab)
        return category && course.targetAudience === category.audience
      })

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={cn(
              'px-6 py-3 rounded-full font-medium transition-all duration-200',
              activeTab === category.id
                ? 'bg-primary text-white shadow-lg scale-105'
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground text-lg">
              Chưa có khóa học nào trong danh mục này
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
