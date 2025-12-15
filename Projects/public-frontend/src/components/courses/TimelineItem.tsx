'use client'

import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export interface TimelineSession {
  id: string
  order: number
  title: string
  description: string
}

interface TimelineItemProps {
  session: TimelineSession
  index: number
  isEven: boolean
}

export function TimelineItem({ session, index, isEven }: TimelineItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? 50 : -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="relative"
    >
      {/* Mobile Layout - Vertical Stack */}
      <div className="md:hidden flex gap-4">
        {/* Circle Node */}
        <div className="relative z-10 shrink-0">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] flex items-center justify-center shadow-lg">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
              <span className="text-lg font-bold text-[#F441A5]">
                {String(session.order).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
        {/* Content Card */}
        <div className="flex-1">
          <Card className="bg-white border-2 border-gray-100 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold text-[#F441A5]">
                  BUỔI {String(session.order).padStart(2, '0')}
                </span>
                <ArrowRight className="h-5 w-5 text-[#F441A5]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {session.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {session.description}
              </p>
              <Button
                className="bg-transparent border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white hover:scale-105 transition-all duration-200"
                size="sm"
              >
                Xem chi tiết
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Desktop Layout - Alternating Left/Right */}
      <div className={`hidden md:flex items-center gap-6 ${
        isEven ? 'flex-row-reverse' : 'flex-row'
      }`}>
        {/* Content Card */}
        <div className={`flex-1 ${isEven ? 'text-right' : 'text-left'}`}>
          <Card className="bg-white border-2 border-gray-100 shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className={`flex items-center gap-3 mb-3 ${isEven ? 'justify-end' : 'justify-start'}`}>
                <span className="text-sm font-semibold text-[#F441A5]">
                  BUỔI {String(session.order).padStart(2, '0')}
                </span>
                {isEven ? (
                  <ArrowLeft className="h-5 w-5 text-[#F441A5]" />
                ) : (
                  <ArrowRight className="h-5 w-5 text-[#F441A5]" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {session.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {session.description}
              </p>
              <Button
                className="bg-transparent border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white hover:scale-105 transition-all duration-200"
                size="sm"
              >
                Xem chi tiết
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Circle Node */}
        <div className="relative z-10 shrink-0">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] flex items-center justify-center shadow-lg">
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
              <span className="text-lg font-bold text-[#F441A5]">
                {String(session.order).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Spacer for alternating layout */}
        <div className="flex-1"></div>
      </div>
    </motion.div>
  )
}

