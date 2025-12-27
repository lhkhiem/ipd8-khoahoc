'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Breadcrumb } from '@/components/shared/breadcrumb'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants'
import { Award, BookOpen, ArrowRight, Share2, Facebook, Twitter, Linkedin, Copy, Check, Mail, Phone } from 'lucide-react'

// Mock experts data with detailed information
const allExperts = [
  {
    id: 1,
    name: 'TS. Nguyễn Thị Lan',
    role: 'Chuyên gia Nhi khoa',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&h=600&fit=crop',
    description: 'Hơn 20 năm kinh nghiệm trong lĩnh vực chăm sóc và phát triển trẻ em',
    achievements: ['Tiến sĩ Nhi khoa', '20+ năm kinh nghiệm', 'Chuyên gia hàng đầu'],
    specialties: ['Chăm sóc trẻ sơ sinh', 'Phát triển trẻ em', 'Dinh dưỡng nhi khoa'],
    slug: 'ts-nguyen-thi-lan',
    biography: `
      <p>TS. Nguyễn Thị Lan là một chuyên gia hàng đầu trong lĩnh vực Nhi khoa với hơn 20 năm kinh nghiệm chăm sóc và phát triển trẻ em. Bà đã có nhiều đóng góp quan trọng trong việc nâng cao chất lượng chăm sóc sức khỏe trẻ em tại Việt Nam.</p>
      
      <h2>Học vấn và Chứng chỉ</h2>
      <ul>
        <li>Tiến sĩ Nhi khoa - Đại học Y Hà Nội</li>
        <li>Thạc sĩ Chăm sóc Sức khỏe Trẻ em - Đại học Y Dược TP. HCM</li>
        <li>Chứng chỉ Quốc tế về Nhi khoa Phát triển - WHO</li>
      </ul>
      
      <h2>Kinh nghiệm chuyên môn</h2>
      <p>Với hơn 20 năm làm việc tại các bệnh viện hàng đầu, TS. Nguyễn Thị Lan đã điều trị và tư vấn cho hàng nghìn trẻ em và gia đình. Bà chuyên sâu về:</p>
      <ul>
        <li>Chăm sóc trẻ sơ sinh và trẻ nhỏ</li>
        <li>Phát triển toàn diện của trẻ em</li>
        <li>Dinh dưỡng nhi khoa</li>
        <li>Tư vấn cho phụ huynh về nuôi dạy con khoa học</li>
      </ul>
      
      <h2>Thành tựu và Công trình nghiên cứu</h2>
      <p>TS. Nguyễn Thị Lan là tác giả của nhiều công trình nghiên cứu được đăng trên các tạp chí khoa học trong nước và quốc tế, tập trung vào lĩnh vực phát triển trẻ em và dinh dưỡng nhi khoa.</p>
    `,
    email: 'lan.nguyen@ipd8.vn',
    phone: '024 1234 5678'
  },
  {
    id: 2,
    name: 'BS. Trần Minh Anh',
    role: 'Chuyên gia Dinh dưỡng',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=600&h=600&fit=crop',
    description: 'Chuyên gia dinh dưỡng cho mẹ bầu và trẻ nhỏ, tác giả nhiều công trình nghiên cứu',
    achievements: ['Bác sĩ Dinh dưỡng', 'Tác giả 10+ công trình', 'Chứng chỉ quốc tế'],
    specialties: ['Dinh dưỡng mẹ bầu', 'Dinh dưỡng trẻ em', 'Thực đơn khoa học'],
    slug: 'bs-tran-minh-anh',
    biography: `
      <p>BS. Trần Minh Anh là chuyên gia dinh dưỡng có nhiều kinh nghiệm trong việc tư vấn dinh dưỡng cho mẹ bầu và trẻ nhỏ. Với kiến thức chuyên sâu và phương pháp tiếp cận khoa học, bác sĩ đã giúp hàng nghìn gia đình xây dựng chế độ dinh dưỡng hợp lý.</p>
      
      <h2>Chuyên môn</h2>
      <ul>
        <li>Dinh dưỡng cho phụ nữ mang thai và cho con bú</li>
        <li>Dinh dưỡng trẻ em theo từng giai đoạn phát triển</li>
        <li>Xây dựng thực đơn khoa học và cân bằng</li>
        <li>Tư vấn dinh dưỡng cho trẻ biếng ăn, suy dinh dưỡng</li>
      </ul>
    `,
    email: 'anh.tran@ipd8.vn',
    phone: '024 1234 5679'
  },
  {
    id: 3,
    name: 'TS. Phạm Văn Hùng',
    role: 'Chuyên gia Tâm lý',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&h=600&fit=crop',
    description: 'Chuyên gia tâm lý trẻ em với phương pháp giáo dục hiện đại',
    achievements: ['Tiến sĩ Tâm lý học', '15+ năm kinh nghiệm', 'Phương pháp hiện đại'],
    specialties: ['Tâm lý trẻ em', 'Giáo dục sớm', 'Phát triển nhận thức'],
    slug: 'ts-pham-van-hung',
    biography: `
      <p>TS. Phạm Văn Hùng là chuyên gia tâm lý trẻ em với hơn 15 năm kinh nghiệm trong việc nghiên cứu và ứng dụng các phương pháp giáo dục hiện đại cho trẻ em.</p>
    `,
    email: 'hung.pham@ipd8.vn',
    phone: '024 1234 5680'
  },
  {
    id: 4,
    name: 'BS. Lê Thị Mai',
    role: 'Chuyên gia Sản khoa',
    image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&h=600&fit=crop',
    description: 'Bác sĩ sản khoa với hơn 15 năm kinh nghiệm chăm sóc mẹ bầu',
    achievements: ['Bác sĩ Sản khoa', '15+ năm kinh nghiệm', 'Chuyên gia hàng đầu'],
    specialties: ['Chăm sóc thai kỳ', 'Sức khỏe mẹ bầu', 'Sau sinh'],
    slug: 'bs-le-thi-mai',
    biography: `
      <p>BS. Lê Thị Mai là bác sĩ sản khoa giàu kinh nghiệm, chuyên về chăm sóc sức khỏe cho phụ nữ mang thai và sau sinh.</p>
    `,
    email: 'mai.le@ipd8.vn',
    phone: '024 1234 5681'
  },
  {
    id: 5,
    name: 'TS. Hoàng Văn Đức',
    role: 'Chuyên gia Giáo dục sớm',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
    description: 'Chuyên gia giáo dục sớm với phương pháp Montessori và Reggio Emilia',
    achievements: ['Tiến sĩ Giáo dục', 'Chứng chỉ quốc tế', 'Phương pháp hiện đại'],
    specialties: ['Giáo dục sớm', 'Phát triển kỹ năng', 'Montessori'],
    slug: 'ts-hoang-van-duc',
    biography: `
      <p>TS. Hoàng Văn Đức là chuyên gia về giáo dục sớm, được đào tạo về các phương pháp Montessori và Reggio Emilia.</p>
    `,
    email: 'duc.hoang@ipd8.vn',
    phone: '024 1234 5682'
  },
  {
    id: 6,
    name: 'BS. Nguyễn Thị Hoa',
    role: 'Chuyên gia Phát triển vận động',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop',
    description: 'Chuyên gia về phát triển vận động và thể chất cho trẻ em',
    achievements: ['Bác sĩ Vật lý trị liệu', '12+ năm kinh nghiệm', 'Chuyên gia hàng đầu'],
    specialties: ['Vận động trẻ em', 'Phát triển thể chất', 'Vật lý trị liệu'],
    slug: 'bs-nguyen-thi-hoa',
    biography: `
      <p>BS. Nguyễn Thị Hoa là chuyên gia về phát triển vận động và thể chất cho trẻ em, với hơn 12 năm kinh nghiệm trong lĩnh vực vật lý trị liệu nhi khoa.</p>
    `,
    email: 'hoa.nguyen@ipd8.vn',
    phone: '024 1234 5683'
  }
]

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function ExpertDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const [headerHeight, setHeaderHeight] = useState<string>('104px')
  const [copied, setCopied] = useState(false)
  
  const expert = allExperts.find(e => e.slug === slug)
  
  // Related experts (exclude current expert)
  const relatedExperts = allExperts.filter(e => e.slug !== slug).slice(0, 4)

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (typeof window === 'undefined') return
      const header = document.querySelector('header')
      if (header) {
        setHeaderHeight(`${header.offsetHeight}px`)
      } else {
        setHeaderHeight(window.innerWidth >= 768 ? '140px' : '104px')
      }
    }

    updateHeaderHeight()
    const handleResize = () => requestAnimationFrame(updateHeaderHeight)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleShare = (platform: string) => {
    const url = window.location.href
    const title = expert?.name || ''
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        break
    }
  }

  if (!expert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Chuyên gia không tồn tại</h1>
          <p className="text-gray-600 mb-8">Chuyên gia bạn tìm kiếm không có trong hệ thống.</p>
          <Link href={ROUTES.EXPERTS}>
            <Button>Quay lại trang chuyên gia</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b" style={{ marginTop: headerHeight }}>
        <div className="container-custom py-4">
          <Breadcrumb
            items={[
              { label: 'Chuyên gia IPD8', href: ROUTES.EXPERTS },
              { label: expert.name, href: `/experts/${expert.slug}` }
            ]}
          />
        </div>
      </div>

      {/* Section 1: Hero / Cover Section */}
      <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <Image
          src={expert.image}
          alt={expert.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="relative z-10 h-full flex items-end">
          <div className="container-custom w-full pb-8 md:pb-12">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              className="text-white max-w-4xl"
            >
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 leading-tight">
                {expert.name}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-4">
                {expert.role}
              </p>
              <p className="text-base md:text-lg text-white/80">
                {expert.description}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Main Content Section */}
      <section className="section-wrapper bg-white py-12 md:py-16 lg:py-20">
        <div className="container-custom">
          <div 
            className="mx-auto max-w-none"
            style={{ maxWidth: '75vw' }}
          >
            {/* Biography */}
            {expert.biography && (
              <div 
                className="prose prose-lg prose-gray max-w-none mb-12"
                dangerouslySetInnerHTML={{ __html: expert.biography }}
                style={{
                  lineHeight: '1.8',
                  fontSize: '1.125rem',
                  color: '#374151'
                }}
              />
            )}

            {/* Achievements */}
            {expert.achievements && expert.achievements.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Award className="h-6 w-6 text-[#F441A5]" />
                  Thành tựu
                </h2>
                <ul className="space-y-3">
                  {expert.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#F441A5] mt-2 flex-shrink-0" />
                      <span className="text-gray-700 text-lg">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specialties */}
            {expert.specialties && expert.specialties.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-[#F441A5]" />
                  Chuyên môn
                </h2>
                <div className="flex flex-wrap gap-3">
                  {expert.specialties.map((specialty, index) => (
                    <Badge 
                      key={index}
                      className="bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white px-4 py-2 text-base"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            {(expert.email || expert.phone) && (
              <div className="border-t pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Liên hệ</h2>
                <div className="space-y-4">
                  {expert.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-[#F441A5]" />
                      <a href={`mailto:${expert.email}`} className="text-gray-700 hover:text-[#F441A5] transition-colors">
                        {expert.email}
                      </a>
                    </div>
                  )}
                  {expert.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-[#F441A5]" />
                      <a href={`tel:${expert.phone}`} className="text-gray-700 hover:text-[#F441A5] transition-colors">
                        {expert.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Social Sharing Section */}
      <section className="section-wrapper bg-gray-50 py-8 border-y">
        <div className="container-custom">
          <div className="flex flex-col items-center gap-4" style={{ maxWidth: '75vw', margin: '0 auto' }}>
            <p className="text-sm font-semibold text-gray-700 mb-2">Chia sẻ trang chuyên gia</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleShare('facebook')}
                className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:bg-[#166FE5] transition-colors"
                aria-label="Share on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="w-10 h-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:bg-[#1A91DA] transition-colors"
                aria-label="Share on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="w-10 h-10 rounded-full bg-[#0077B5] text-white flex items-center justify-center hover:bg-[#006399] transition-colors"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-colors"
                aria-label="Copy link"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Related Experts Slider */}
      {relatedExperts.length > 0 && (
        <section className="section-wrapper bg-white py-12 md:py-16">
          <div className="container-custom">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Chuyên gia khác
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2 py-2 overflow-visible">
              {relatedExperts.map((relatedExpert) => (
                <motion.div
                  key={relatedExpert.id}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                >
                  <Link href={`/experts/${relatedExpert.slug}`}>
                    <Card className="bg-white border-2 border-gray-200 shadow-lg overflow-hidden group hover:shadow-2xl hover:border-[#F441A5] transition-all duration-300 h-full flex flex-col cursor-pointer">
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={relatedExpert.image}
                          alt={relatedExpert.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <CardContent className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ lineHeight: '1.2' }}>
                          {relatedExpert.name}
                        </h3>
                        <p className="text-sm text-[#F441A5] font-semibold mb-3">
                          {relatedExpert.role}
                        </p>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {relatedExpert.description}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white transition-all duration-200 mt-auto"
                        >
                          Xem chi tiết
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

