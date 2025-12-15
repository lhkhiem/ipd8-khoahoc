'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TrialHeroProps {
  onBookNow?: () => void
  onRegister?: () => void
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
}

const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }
}

export function TrialHero({ onBookNow, onRegister }: TrialHeroProps) {
  return (
    <section 
      className="relative w-full overflow-hidden"
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1920&h=1080&fit=crop&q=80)',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Smooth Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F441A5]/95 via-[#F441A5]/90 to-[#FF5F6D]/95"></div>
      
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center py-20 md:py-24 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          {/* Left: Title & Info */}
          <motion.div
            initial={fadeInUp.initial}
            animate={fadeInUp.animate}
            transition={fadeInUp.transition}
            className="text-white space-y-6"
          >
            <Badge className="mb-2 bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm">
              Gói Học Thử
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight" style={{ lineHeight: '1.2' }}>
              <span className="block">GÓI HỌC THỬ</span>
              <span className="block mt-[0.2em]">01 BUỔI 99K</span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-white/95 leading-relaxed max-w-2xl">
              Trải nghiệm một buổi học với giá ưu đãi để hiểu rõ phương pháp giảng dạy của IPD8. Đây là cơ hội tuyệt vời để mẹ và bé làm quen với môi trường học tập chuyên nghiệp.
            </p>
          </motion.div>

          {/* Right: Price Card */}
          <motion.div
            initial={fadeInRight.initial}
            animate={fadeInRight.animate}
            transition={fadeInRight.transition}
            className="flex justify-center lg:justify-end"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 w-full max-w-md border-2 border-gray-200">
              <div className="text-center mb-8">
                <p className="text-sm md:text-base text-gray-600 mb-3 font-medium">Giá ưu đãi</p>
                <div className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#F441A5] mb-3 leading-none">
                  99.000
                </div>
                <p className="text-sm md:text-base text-gray-500 mb-2">VND / 1 buổi</p>
                <p className="text-xs text-gray-400">*Giá trên chưa bao gồm VAT</p>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={onBookNow}
                  className="w-full bg-transparent border-2 border-[#F441A5] text-[#F441A5] hover:scale-105 transition-all duration-200 py-4 text-base md:text-lg font-semibold rounded-xl"
                >
                  Đăng ký học thử
                </Button>
                <Button 
                  onClick={onRegister}
                  className="w-full bg-transparent border-2 border-[#F441A5] text-[#F441A5] hover:scale-105 transition-all duration-200 py-4 text-base md:text-lg font-semibold rounded-xl"
                >
                  Đăng ký ngay
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
