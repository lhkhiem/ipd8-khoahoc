'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants'

export function FinalCTA() {
  return (
    <section className="section-wrapper gradient-primary text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            SẴN SÀNG BẮT ĐẦU HÀNH TRÌNH?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            Khám phá các khóa học phù hợp hoặc liên hệ với chúng tôi để được tư vấn chi tiết
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={ROUTES.COURSES}>
              <Button
                size="lg"
                className="bg-white text-[#F441A5] hover:bg-gray-100 hover:scale-105 transition-all duration-200 px-8 py-6 text-lg font-semibold"
              >
                Khám phá khóa học
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href={ROUTES.CONTACT}>
              <Button
                size="lg"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 hover:scale-105 transition-all duration-200 px-8 py-6 text-lg font-semibold"
              >
                Liên hệ tư vấn
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

