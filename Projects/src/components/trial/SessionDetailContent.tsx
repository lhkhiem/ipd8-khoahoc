'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'

interface SessionDetailContentProps {
  sessionName: string
  description: string
  benefitsForMom: string[]
  benefitsForBaby: string[]
  instructor: {
    name: string
    title: string
    image?: string
  }
}

export function SessionDetailContent({
  sessionName,
  description,
  benefitsForMom,
  benefitsForBaby,
  instructor,
}: SessionDetailContentProps) {
  return (
    <div className="space-y-8">
      {/* Session Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6" style={{ lineHeight: '1.2' }}>
          {sessionName}
        </h1>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          {description.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph || 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.'}
            </p>
          ))}
        </div>
      </motion.div>

      {/* Benefits for Mom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4" style={{ lineHeight: '1.2' }}>
          LỢI ÍCH DÀNH CHO MẸ
        </h2>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          {benefitsForMom.map((benefit, index) => (
            <p key={index} className="mb-4">
              {benefit || 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.'}
            </p>
          ))}
        </div>
      </motion.div>

      {/* Benefits for Baby */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4" style={{ lineHeight: '1.2' }}>
          LỢI ÍCH DÀNH CHO BÉ
        </h2>
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          {benefitsForBaby.map((benefit, index) => (
            <p key={index} className="mb-4">
              {benefit || 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.'}
            </p>
          ))}
        </div>
      </motion.div>

      {/* Instructor Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="bg-gray-50 border-2 border-gray-200">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {instructor.image && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden shrink-0">
                  <Image
                    src={instructor.image}
                    alt={instructor.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Thái lương học
                  </label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {instructor.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Giảng viên
                  </label>
                  <p className="text-lg text-gray-700 mt-1">
                    {instructor.title}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

