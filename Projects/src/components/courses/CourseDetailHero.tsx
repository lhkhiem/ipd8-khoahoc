'use client'

import { motion } from 'framer-motion'

interface CourseDetailHeroProps {
  title: string
  image: string
}

export function CourseDetailHero({ title, image }: CourseDetailHeroProps) {
  return (
    <section 
      className="relative w-full h-[500px] md:h-[600px] overflow-hidden"
      style={{
        backgroundImage: `url(${image})`,
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F441A5]/80 to-[#FF5F6D]/80"></div>
      
      {/* Content */}
      <div className="container-custom relative z-10 h-full flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white max-w-3xl"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {title}
          </h1>
        </motion.div>
      </div>
    </section>
  )
}

