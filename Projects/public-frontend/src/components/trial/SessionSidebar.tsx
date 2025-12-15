'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, Users, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface PricingBlock {
  id: string
  title: string
  sessions: number
  format: string
  instructor: string
  startDate: string
  schedule: string
  time: string
  price: number | string
}

interface SessionSidebarProps {
  pricingBlocks: PricingBlock[]
  onRegister: (blockId: string) => void
}

export function SessionSidebar({ pricingBlocks, onRegister }: SessionSidebarProps) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6" style={{ lineHeight: '1.2' }}>
          GÓI HỌC SẮP KHAI GIẢNG
        </h2>
      </motion.div>

      <div className="space-y-6">
        {pricingBlocks.map((block, index) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white rounded-2xl"
          >
            <Card 
              className="!bg-white border-2 border-gray-200 hover:border-[#F441A5] transition-colors shadow-md"
            >
              <CardContent className="p-6 space-y-4 !bg-white">
                <h3 className="text-xl font-bold text-gray-900 mb-4" style={{ lineHeight: '1.2' }}>
                  {block.title}
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-[#F441A5] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-600">Số buổi học: </span>
                      <span className="font-semibold text-gray-900">{block.sessions}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-[#F441A5] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-600">Hình thức học: </span>
                      <span className="font-semibold text-gray-900">{block.format}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-[#F441A5] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-600">Quảng cáo: </span>
                      <span className="font-semibold text-gray-900">{block.instructor}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-[#F441A5] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-600">Ngày khai giảng: </span>
                      <span className="font-semibold text-gray-900">{block.startDate}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-[#F441A5] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-600">Lịch học: </span>
                      <span className="font-semibold text-gray-900">{block.schedule}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-[#F441A5] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-600">Giờ học: </span>
                      <span className="font-semibold text-gray-900">{block.time}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  {typeof block.price === 'number' && (
                    <div className="mb-4">
                      <p className="text-3xl font-bold text-[#F441A5]">
                        {formatCurrency(block.price)}
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={() => onRegister(block.id)}
                    className="w-full bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white hover:opacity-90 hover:scale-105 transition-all duration-200"
                  >
                    Đăng ký ngay
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

