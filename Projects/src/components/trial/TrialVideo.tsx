'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

interface TrialVideoProps {
  videoUrl?: string
  title?: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
}

export function TrialVideo({ 
  videoUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  title = 'VIDEO MINH HỌA BUỔI HỌC (PHƯƠNG PHÁP HỌC)'
}: TrialVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <motion.section
      initial={fadeInUp.initial}
      whileInView={fadeInUp.animate}
      viewport={{ once: true, margin: '-100px' }}
      transition={fadeInUp.transition}
      className="w-full bg-white py-16 md:py-20 lg:py-24"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-10 md:mb-12 text-center" style={{ lineHeight: '1.2' }}>
          {title}
        </h2>

        {/* Responsive Video Container */}
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-900" style={{ paddingBottom: '56.25%' }}>
          {!isPlaying ? (
            <>
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1920&h=1080&fit=crop&q=80)'
                }}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#F441A5]/30 to-[#FF5F6D]/30"></div>
              
              {/* Play Button Overlay */}
              <div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                onClick={() => setIsPlaying(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setIsPlaying(true)
                  }
                }}
                aria-label="Phát video"
              >
                <div className="text-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-white/95 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                    <Play className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 text-[#F441A5] ml-1" fill="currentColor" />
                  </div>
                  <p className="text-white text-base md:text-lg font-medium">Nhấn để phát video</p>
                </div>
              </div>
            </>
          ) : (
            <iframe
              src={`${videoUrl}?autoplay=1`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
              loading="lazy"
            />
          )}
        </div>

        {/* Rating Snippet */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-sm md:text-base text-gray-600">
            Mời bạn xếp hạng video này sau khi xem
          </p>
        </motion.div>
      </div>
    </motion.section>
  )
}
