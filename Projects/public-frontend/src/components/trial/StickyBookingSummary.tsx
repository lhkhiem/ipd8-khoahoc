'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Session } from './SessionCard'

interface StickyBookingSummaryProps {
  session: Session | null
  onRegister: () => void
  onClose: () => void
}

export function StickyBookingSummary({ session, onRegister, onClose }: StickyBookingSummaryProps) {
  if (!session) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { 
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 right-4 z-[90] max-w-sm"
        style={{ maxWidth: 'calc(100vw - 2rem)' }}
      >
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#F441A5]/20 p-4">
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Buổi học đã chọn</h4>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-[#F441A5]" />
              <span>{formatDate(session.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-[#F441A5]" />
              <span>{session.time}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{session.instructor.name}</p>
          </div>

          <Button
            onClick={onRegister}
            className="w-full bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white hover:opacity-90 hover:scale-105 transition-all duration-200"
          >
            Đăng ký ngay
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

