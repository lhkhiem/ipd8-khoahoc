'use client'

import { motion } from 'framer-motion'

export function AboutHero() {
  return (
    <section 
      className="relative w-full min-h-[500px] md:min-h-[600px] overflow-hidden flex items-center justify-center"
      style={{
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
      <div className="container-custom relative z-10 h-full flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white">
            VỀ IPD8
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Trung tâm 1.000 ngày vòng đầu đời Việt Nam - New Zealand IPD8 là đơn vị tiên phong 
            trong lĩnh vực giáo dục và chăm sóc sức khỏe cho mẹ và bé.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

