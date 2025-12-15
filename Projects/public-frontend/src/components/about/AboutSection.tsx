'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

interface AboutSectionProps {
  image: string
  imageAlt: string
  title: string
  description: string
  bullets?: string[]
  reverse?: boolean
  index: number
}

export function AboutSection({
  image,
  imageAlt,
  title,
  description,
  bullets,
  reverse = false,
  index,
}: AboutSectionProps) {
  return (
    <section className="section-wrapper bg-white w-full max-w-full overflow-x-hidden">
      <div className="container-custom max-w-7xl w-full max-w-full">
        <div className={`grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center w-full max-w-full ${
          reverse ? 'lg:grid-flow-dense' : ''
        }`}>
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className={`relative h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl w-full max-w-full ${
              reverse ? 'lg:col-start-2' : ''
            }`}
          >
            <Image
              src={image}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
            className={`space-y-4 md:space-y-6 min-w-0 ${reverse ? 'lg:col-start-1 lg:row-start-1' : ''}`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 break-words">
              {title}
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed break-words">
              {description}
            </p>
            {bullets && bullets.length > 0 && (
              <ul className="space-y-3 md:space-y-4 pt-4">
                {bullets.map((bullet, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3 + idx * 0.1, duration: 0.4 }}
                    className="flex items-start gap-2 md:gap-3 min-w-0"
                  >
                    <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-[#F441A5] shrink-0 mt-1" />
                    <span className="text-base md:text-lg text-gray-700 break-words">{bullet}</span>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

