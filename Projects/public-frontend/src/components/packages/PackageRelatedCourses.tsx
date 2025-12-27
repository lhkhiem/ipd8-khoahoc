'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Clock, Users } from 'lucide-react'
import { Course } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface PackageRelatedCoursesProps {
  courses: Course[]
  maxDisplay?: number
}

export function PackageRelatedCourses({ 
  courses, 
  maxDisplay = 6 
}: PackageRelatedCoursesProps) {
  if (!courses || courses.length === 0) {
    return null
  }

  const displayCourses = courses.slice(0, maxDisplay)

  return (
    <section className="w-full py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 md:px-6 max-w-[80%]">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Các khóa học trong gói
          </h2>
          <p className="text-lg text-gray-600">
            Khám phá các khóa học được bao gồm trong gói này để hiểu rõ hơn về nội dung bạn sẽ nhận được
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCourses.map((course) => (
            <Card
              key={course.id}
              className="group hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-[#F441A5] overflow-hidden"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={course.thumbnailUrl || '/placeholder-course.jpg'}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              
              <CardContent className="p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
                  {course.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                  {course.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  {course.durationMinutes > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{course.durationMinutes} phút</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    <span className="capitalize">{course.mode === 'one-on-one' ? '1-1' : 'Nhóm'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-[#F441A5]">
                    {course.price === 0 ? 'Miễn phí' : formatCurrency(course.price)}
                  </div>
                  <Link href={`/${course.slug}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white"
                    >
                      Xem chi tiết
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length > maxDisplay && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Và {courses.length - maxDisplay} khóa học khác trong gói này
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

