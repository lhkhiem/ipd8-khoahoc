'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Award, GraduationCap, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface Instructor {
  id: string
  name: string
  title: string
  image: string
  bio: string
  qualifications?: string[]
  experience?: string
}

interface InstructorCardProps {
  instructor: Instructor
}

export function InstructorCard({ instructor }: InstructorCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full bg-gray-50 py-16 md:py-20 lg:py-24 overflow-x-hidden"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-10 md:mb-12" style={{ lineHeight: '1.2' }}>
          Giảng viên
        </h2>

        <Card className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
          <div className="grid md:grid-cols-3 gap-6 p-6 md:p-8">
            {/* Image */}
            <div className="md:col-span-1 max-w-full overflow-hidden">
              <div className="relative w-full aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden max-w-full">
                <Image
                  src={instructor.image}
                  alt={instructor.name}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
            </div>

            {/* Info */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2" style={{ lineHeight: '1.2' }}>
                  {instructor.name}
                </h3>
                <p className="text-lg text-[#F441A5] font-semibold mb-4">
                  {instructor.title}
                </p>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {instructor.bio}
              </p>

              {instructor.qualifications && instructor.qualifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {instructor.qualifications.map((qual, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#F441A5]/10 rounded-full text-sm text-[#F441A5]"
                    >
                      <Award className="h-4 w-4" />
                      <span>{qual}</span>
                    </div>
                  ))}
                </div>
              )}

              {instructor.experience && (
                <div className="flex items-center gap-2 text-gray-600">
                  <GraduationCap className="h-5 w-5 text-[#F441A5]" />
                  <span>{instructor.experience}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-[#F441A5] pt-2">
                <Heart className="h-5 w-5" />
                <span className="text-sm font-medium">Chuyên gia IPD8</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </motion.section>
  )
}

