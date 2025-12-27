'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

interface CourseHeroProps {
  marginTop?: string
}

export function CourseHero({ marginTop }: CourseHeroProps) {
  return (
    <section className="relative w-full max-w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden border-b" style={marginTop ? { marginTop } : undefined}>
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=1920&h=800&fit=crop"
          alt="Courses Hero"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F441A5]/80 to-[#FF5F6D]/80"></div>
      </div>
      <div className="container-custom relative z-10 h-full flex items-center w-full max-w-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white max-w-2xl w-full"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 break-words">
            CÁC GÓI HỌC
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 break-words">
            Khám phá các khóa học phù hợp với bạn và bé yêu
          </p>
        </motion.div>
      </div>
    </section>
  )
}

