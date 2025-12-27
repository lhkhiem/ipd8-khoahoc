'use client'

import { motion } from 'framer-motion'

interface AboutHeroProps {
  marginTop?: string
}

export function AboutHero({ marginTop }: AboutHeroProps) {
  return (
    <section 
      className="relative w-full min-h-[500px] md:min-h-[600px] overflow-hidden flex items-center justify-center border-b"
      style={{
        ...(marginTop ? { marginTop } : {}),
        backgroundImage: 'url(https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=1920&h=1080&fit=crop)',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F441A5]/80 to-[#FF5F6D]/80"></div>
      
      {/* Content - Centered */}
      <div className="container-about relative z-10 h-full flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">
            280 Ngày Kỳ Diệu
          </h1>
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed font-medium">
            Hành trình con lớn lên trong tình yêu của mẹ
          </p>
        </motion.div>
      </div>
    </section>
  )
}
