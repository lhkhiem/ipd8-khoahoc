'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Calendar, Clock, Users, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface Session {
  id: string
  date: string
  time: string
  instructor: {
    name: string
    image?: string
  }
  capacity: number
  registered: number
  location?: string
  description?: string
  image?: string
}

interface SessionCardProps {
  session: Session
  onRegister: (session: Session) => void
  index?: number
}

export function SessionCard({ session, onRegister, index = 0 }: SessionCardProps) {
  const remaining = session.capacity - session.registered
  const isFull = remaining === 0
  const isLowCapacity = remaining <= 3 && remaining > 0

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="h-full overflow-visible"
    >
      <Card className="bg-white border-0 shadow-lg overflow-hidden h-full flex flex-col group hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-2xl w-full">
        {/* Image */}
        {session.image && (
          <div className="relative h-48 overflow-hidden shrink-0 w-full max-w-full">
            <Image
              src={session.image}
              alt={`Session ${session.date}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {isFull && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge className="bg-red-500 text-white">Đã đầy</Badge>
              </div>
            )}
            {isLowCapacity && !isFull && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-orange-500 text-white">Sắp đầy</Badge>
              </div>
            )}
          </div>
        )}

        <CardContent className="p-6 flex flex-col flex-grow">
          {/* Date & Time */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-[#F441A5] font-semibold mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">{formatDate(session.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Clock className="h-4 w-4" />
              <span>{session.time}</span>
            </div>
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-3 mb-4">
            {session.instructor.image && (
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                <Image
                  src={session.instructor.image}
                  alt={session.instructor.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900">{session.instructor.name}</p>
              <p className="text-xs text-gray-500">Chuyên gia IPD8</p>
            </div>
          </div>

          {/* Location */}
          {session.location && (
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{session.location}</span>
            </div>
          )}

          {/* Description */}
          {session.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
              {session.description}
            </p>
          )}

          {/* Capacity */}
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>Còn {remaining} chỗ</span>
            </div>
            <div className="text-xs text-gray-500">
              {session.registered}/{session.capacity} đã đăng ký
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => onRegister(session)}
            disabled={isFull}
            className="w-full bg-transparent border-2 border-[#F441A5] text-[#F441A5] hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
          >
            {isFull ? 'Đã đầy' : 'Đăng ký học thử'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

