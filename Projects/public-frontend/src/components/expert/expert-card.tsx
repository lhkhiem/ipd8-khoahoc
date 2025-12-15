import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Instructor } from '@/types'
import { ROUTES } from '@/lib/constants'

interface ExpertCardProps {
  instructor: Instructor
}

export function ExpertCard({ instructor }: ExpertCardProps) {
  return (
    <Link href={`${ROUTES.EXPERTS}/${instructor.id}`}>
      <Card className="overflow-hidden card-hover h-full">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4 border-4 border-primary/10">
              <Image
                src={instructor.user?.avatarUrl || '/placeholder-avatar.jpg'}
                alt={instructor.user?.name || ''}
                fill
                className="object-cover"
              />
            </div>
            <Badge variant="secondary" className="mb-2">
              {instructor.title}
            </Badge>
            <h3 className="font-semibold text-lg mb-2">
              {instructor.user?.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {instructor.credentials}
            </p>
            <p className="text-sm line-clamp-3">{instructor.bio}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
