import Link from 'next/link'
import Image from 'next/image'
import { Clock, Users, BookOpen } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Course } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { ROUTES } from '@/lib/constants'

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/${course.slug}`}>
      <Card className="overflow-hidden card-hover h-full">
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={course.thumbnailUrl || '/placeholder-course.jpg'}
            alt={course.title}
            fill
            className="object-cover"
          />
          {course.featured && (
            <Badge className="absolute top-3 right-3 bg-yellow-500 text-white">
              Nổi bật
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[56px]">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {course.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{Math.floor(course.durationMinutes / 60)}h</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.mode === 'group' ? 'Nhóm' : '1-1'}</span>
            </div>
          </div>
          {course.instructor && (
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden">
                {course.instructor.user?.avatarUrl && (
                  <Image
                    src={course.instructor.user.avatarUrl}
                    alt={course.instructor.user.name || ''}
                    width={32}
                    height={32}
                  />
                )}
              </div>
              <span className="text-sm">{course.instructor.user?.name}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-primary">
              {course.price === 0 ? 'Miễn phí' : formatCurrency(course.price)}
            </span>
          </div>
          <Button size="sm" className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white hover:scale-105 transition-all duration-200 ease-in-out">
            Xem chi tiết
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
