'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock, Users, Heart, Baby, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'

export interface CourseCardData {
  id: string
  slug: string
  title: string
  description: string
  image: string
  duration: string
  instructor: string
  benefitsMom?: string
  benefitsBaby?: string
  price: string | number
  featured?: boolean
  category?: string
}

interface CourseCardProps {
  course: CourseCardData
  index?: number
}

export function CourseCard({ course, index = 0 }: CourseCardProps) {
  const priceDisplay = typeof course.price === 'number' 
    ? course.price === 0 
      ? 'Miễn phí' 
      : formatCurrency(course.price)
    : course.price

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="overflow-visible w-full max-w-full h-full"
    >
      <Card className="group bg-white border-2 border-gray-100 rounded-2xl shadow-md overflow-hidden h-full hover:shadow-2xl hover:scale-105 hover:border-[#F441A5] transition-all duration-300 w-full max-w-full">
        <div className="relative h-48 overflow-hidden w-full">
          <Image
            src={course.image}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {course.featured && (
            <Badge className="absolute top-4 right-4 bg-yellow-400 text-gray-900 font-semibold">
              Nổi bật
            </Badge>
          )}
          {course.category && (
            <Badge className="absolute top-4 left-4 bg-[#F441A5] text-white font-semibold">
              {course.category}
            </Badge>
          )}
        </div>
        <CardContent className="p-4 md:p-6 min-w-0">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem] md:min-h-[56px] break-words">
            {course.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px] break-words">
            {course.description}
          </p>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="h-4 w-4 text-[#F441A5] shrink-0" />
              <span className="truncate">Thời lượng: {course.duration}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Users className="h-4 w-4 text-[#F441A5] shrink-0" />
              <span className="truncate">Giáo viên: {course.instructor}</span>
            </div>
            {course.benefitsMom && (
              <div className="flex items-start gap-2 min-w-0">
                <Heart className="h-4 w-4 text-[#F441A5] mt-0.5 shrink-0" />
                <span className="line-clamp-1 break-words">Lợi ích cho mẹ: {course.benefitsMom}</span>
              </div>
            )}
            {course.benefitsBaby && (
              <div className="flex items-start gap-2 min-w-0">
                <Baby className="h-4 w-4 text-[#F441A5] mt-0.5 shrink-0" />
                <span className="line-clamp-1 break-words">Lợi ích cho bé: {course.benefitsBaby}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 pt-4 border-t min-w-0">
            <div className="text-xl sm:text-2xl font-bold text-[#F441A5] truncate w-full sm:w-auto">
              {priceDisplay}
            </div>
            <Link href={`/${course.slug}`} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-transparent border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white hover:scale-105 transition-all duration-200 text-sm">
                Chi tiết
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

