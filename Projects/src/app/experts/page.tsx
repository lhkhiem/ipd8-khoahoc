'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumb } from '@/components/shared/breadcrumb'
import { ROUTES } from '@/lib/constants'
import { ChevronRight, Play, Users, Award, BookOpen } from 'lucide-react'

// Mock experts data
const experts = [
  {
    id: 1,
    name: 'TS. Nguyễn Thị Lan',
    role: 'Chuyên gia Nhi khoa',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop',
    description: 'Hơn 20 năm kinh nghiệm trong lĩnh vực chăm sóc và phát triển trẻ em',
    achievements: ['Tiến sĩ Nhi khoa', '20+ năm kinh nghiệm', 'Chuyên gia hàng đầu'],
    specialties: ['Chăm sóc trẻ sơ sinh', 'Phát triển trẻ em', 'Dinh dưỡng nhi khoa']
  },
  {
    id: 2,
    name: 'BS. Trần Minh Anh',
    role: 'Chuyên gia Dinh dưỡng',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=600&fit=crop',
    description: 'Chuyên gia dinh dưỡng cho mẹ bầu và trẻ nhỏ, tác giả nhiều công trình nghiên cứu',
    achievements: ['Bác sĩ Dinh dưỡng', 'Tác giả 10+ công trình', 'Chứng chỉ quốc tế'],
    specialties: ['Dinh dưỡng mẹ bầu', 'Dinh dưỡng trẻ em', 'Thực đơn khoa học']
  },
  {
    id: 3,
    name: 'TS. Phạm Văn Hùng',
    role: 'Chuyên gia Tâm lý',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=600&fit=crop',
    description: 'Chuyên gia tâm lý trẻ em với phương pháp giáo dục hiện đại',
    achievements: ['Tiến sĩ Tâm lý học', '15+ năm kinh nghiệm', 'Phương pháp hiện đại'],
    specialties: ['Tâm lý trẻ em', 'Giáo dục sớm', 'Phát triển nhận thức']
  },
  {
    id: 4,
    name: 'BS. Lê Thị Mai',
    role: 'Chuyên gia Sản khoa',
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&h=600&fit=crop',
    description: 'Bác sĩ sản khoa với hơn 15 năm kinh nghiệm chăm sóc mẹ bầu',
    achievements: ['Bác sĩ Sản khoa', '15+ năm kinh nghiệm', 'Chuyên gia hàng đầu'],
    specialties: ['Chăm sóc thai kỳ', 'Sức khỏe mẹ bầu', 'Sau sinh']
  },
  {
    id: 5,
    name: 'TS. Hoàng Văn Đức',
    role: 'Chuyên gia Giáo dục sớm',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
    description: 'Chuyên gia giáo dục sớm với phương pháp Montessori và Reggio Emilia',
    achievements: ['Tiến sĩ Giáo dục', 'Chứng chỉ quốc tế', 'Phương pháp hiện đại'],
    specialties: ['Giáo dục sớm', 'Phát triển kỹ năng', 'Montessori']
  },
  {
    id: 6,
    name: 'BS. Nguyễn Thị Hoa',
    role: 'Chuyên gia Phát triển vận động',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop',
    description: 'Chuyên gia về phát triển vận động và thể chất cho trẻ em',
    achievements: ['Bác sĩ Vật lý trị liệu', '12+ năm kinh nghiệm', 'Chuyên gia hàng đầu'],
    specialties: ['Vận động trẻ em', 'Phát triển thể chất', 'Vật lý trị liệu']
  }
]

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6 }
}

export default function ExpertsPage() {
  const [selectedExpert, setSelectedExpert] = useState<number | null>(null)

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="container-custom py-4">
          <Breadcrumb
            items={[
              { label: 'Chuyên gia IPD8', href: ROUTES.EXPERTS }
            ]}
          />
        </div>
      </div>

      {/* Sub-menu Navigation */}
      <section className="bg-white border-b">
        <div className="container-custom py-6">
          <div className="flex items-center gap-4">
            <Link
              href={ROUTES.EXPERTS}
              className="px-6 py-3 bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <Users className="h-5 w-5" />
              CHUYÊN GIA IPD8
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.EXPERT_PERSPECTIVE}
              className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold border-2 border-gray-200 hover:border-[#F441A5] hover:text-[#F441A5] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Góc chuyên gia
            </Link>
          </div>
        </div>
      </section>

      {/* Video Section - 1/3 đầu page */}
      <section className="section-wrapper bg-gradient-to-br from-gray-50 to-white">
        <div className="container-custom">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 text-center" style={{ lineHeight: '1.2' }}>
              ĐỘI NGŨ CHUYÊN GIA HÀNG ĐẦU
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center">
              Các chuyên gia đầu ngành đang hợp tác cùng IPD8 để mang đến kiến thức và trải nghiệm tốt nhất cho mẹ và bé
            </p>
          </motion.div>

          {/* Video Section */}
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="relative w-full max-w-5xl mx-auto mb-16 rounded-2xl overflow-hidden shadow-2xl"
            style={{ aspectRatio: '16/9' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#F441A5]/20 to-[#FF5F6D]/20" />
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Button
                size="lg"
                className="bg-white/90 hover:bg-white text-[#F441A5] rounded-full p-6 shadow-xl hover:scale-110 transition-all duration-300"
              >
                <Play className="h-12 w-12 fill-[#F441A5]" />
              </Button>
            </div>
            <Image
              src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1920&h=1080&fit=crop"
              alt="Video chia sẻ từ chuyên gia"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Experts Grid Section */}
      <section className="section-wrapper bg-white">
        <div className="container-custom">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ lineHeight: '1.2' }}>
              CÁC CHUYÊN GIA ĐANG HỢP TÁC
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Đội ngũ chuyên gia giàu kinh nghiệm, tận tâm và chuyên nghiệp
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2 py-2 overflow-visible">
            {experts.map((expert, index) => (
              <motion.div
                key={expert.id}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="p-2"
              >
                <Card className="bg-white border-2 border-gray-200 shadow-lg overflow-hidden group hover:shadow-2xl hover:border-[#F441A5] transition-all duration-300 h-full flex flex-col">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={expert.image}
                      alt={expert.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ lineHeight: '1.2' }}>
                        {expert.name}
                      </h3>
                      <p className="text-sm text-[#F441A5] font-semibold mb-3">
                        {expert.role}
                      </p>
                      <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {expert.description}
                      </p>
                    </div>

                    <div className="space-y-3 mb-4 flex-grow">
                      <div className="flex items-start gap-2">
                        <Award className="h-5 w-5 text-[#F441A5] shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Thành tựu:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {expert.achievements.map((achievement, idx) => (
                              <li key={idx}>• {achievement}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <BookOpen className="h-5 w-5 text-[#F441A5] shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Chuyên môn:</p>
                          <div className="flex flex-wrap gap-1">
                            {expert.specialties.map((specialty, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white hover:opacity-90 hover:scale-105 transition-all duration-200"
                      onClick={() => setSelectedExpert(selectedExpert === expert.id ? null : expert.id)}
                    >
                      {selectedExpert === expert.id ? 'Thu gọn' : 'Xem thêm'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-wrapper bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white">
        <div className="container-custom text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ lineHeight: '1.2' }}>
              MUỐN TƯ VẤN TRỰC TIẾP VỚI CHUYÊN GIA?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Liên hệ với chúng tôi để được tư vấn miễn phí từ các chuyên gia hàng đầu
            </p>
            <Link href={ROUTES.CONTACT}>
              <Button size="lg" className="bg-white text-[#F441A5] hover:bg-gray-100 hover:scale-105 transition-all duration-200 px-8 py-6 text-lg font-semibold">
                Liên hệ ngay
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

