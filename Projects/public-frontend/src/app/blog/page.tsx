'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/shared/breadcrumb'
import { ROUTES } from '@/lib/constants'
import { Calendar, Clock, ArrowRight, User, FileText, Megaphone, Heart, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock articles data organized by category
const newsArticles = [
  {
    id: 1,
    title: 'IPD8 tổ chức hội thảo "Nuôi con khoa học - Con khỏe, mẹ vui"',
    excerpt: 'Hội thảo lớn với sự tham gia của các chuyên gia hàng đầu về nuôi dạy con, chia sẻ những phương pháp khoa học và thực tiễn nhất.',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&h=800&fit=crop',
    category: 'Tin tức chung',
    date: '2025-12-15',
    author: 'IPD8 Editorial',
    authorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
    readTime: '5 phút',
    tags: ['Hội thảo', 'Chuyên gia']
  },
  {
    id: 2,
    title: 'Nghiên cứu mới về tầm quan trọng của 1.000 ngày đầu đời',
    excerpt: 'Các nhà khoa học đã công bố nghiên cứu mới nhất về tác động của 1.000 ngày đầu đời đến sự phát triển toàn diện của trẻ.',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop',
    category: 'Tin tức chung',
    date: '2025-12-12',
    author: 'IPD8 Research Team',
    authorImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop',
    readTime: '7 phút',
    tags: ['Nghiên cứu', 'Khoa học']
  },
  {
    id: 3,
    title: 'IPD8 mở rộng chương trình hỗ trợ cho các gia đình có hoàn cảnh khó khăn',
    excerpt: 'Chương trình mới nhằm hỗ trợ các gia đình có hoàn cảnh khó khăn tiếp cận với các dịch vụ chăm sóc và giáo dục trẻ em chất lượng cao.',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
    category: 'Tin tức chung',
    date: '2025-12-10',
    author: 'IPD8 Community',
    authorImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
    readTime: '6 phút',
    tags: ['Cộng đồng', 'Hỗ trợ']
  },
  {
    id: 4,
    title: 'Phương pháp giáo dục sớm Montessori được áp dụng tại IPD8',
    excerpt: 'IPD8 chính thức triển khai phương pháp giáo dục sớm Montessori trong các khóa học dành cho trẻ từ 0-3 tuổi.',
    image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&h=600&fit=crop',
    category: 'Tin tức chung',
    date: '2025-12-08',
    author: 'IPD8 Education',
    authorImage: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=200&h=200&fit=crop',
    readTime: '5 phút',
    tags: ['Giáo dục', 'Montessori']
  },
  {
    id: 5,
    title: 'Hợp tác với các chuyên gia quốc tế trong lĩnh vực phát triển trẻ em',
    excerpt: 'IPD8 ký kết hợp tác với các tổ chức quốc tế hàng đầu để nâng cao chất lượng chương trình đào tạo và nghiên cứu.',
    image: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=800&h=600&fit=crop',
    category: 'Tin tức chung',
    date: '2025-12-05',
    author: 'IPD8 Partnership',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    readTime: '6 phút',
    tags: ['Hợp tác', 'Quốc tế']
  }
]

const eventArticles = [
  {
    id: 6,
    title: 'Sự kiện: Workshop "Dinh dưỡng cho mẹ bầu và trẻ nhỏ"',
    excerpt: 'Workshop thực hành về dinh dưỡng với sự tham gia của chuyên gia dinh dưỡng hàng đầu, hướng dẫn thực đơn khoa học cho mẹ bầu và trẻ nhỏ.',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&h=800&fit=crop',
    category: 'Sự kiện',
    date: '2025-12-20',
    author: 'IPD8 Events',
    authorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
    readTime: '3 phút',
    eventDate: '2026-01-15',
    location: 'Trung tâm IPD8, Hà Nội',
    tags: ['Workshop', 'Dinh dưỡng']
  },
  {
    id: 7,
    title: 'Hội thảo "Phát triển vận động cho trẻ sơ sinh"',
    excerpt: 'Hội thảo chuyên sâu về phát triển vận động cho trẻ từ 0-12 tháng, với các bài tập thực hành và tư vấn từ chuyên gia.',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop',
    category: 'Sự kiện',
    date: '2025-12-18',
    author: 'IPD8 Events',
    authorImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop',
    readTime: '4 phút',
    eventDate: '2026-01-20',
    location: 'Trung tâm IPD8, TP. Hồ Chí Minh',
    tags: ['Hội thảo', 'Vận động']
  },
  {
    id: 8,
    title: 'Sự kiện: Ngày hội gia đình IPD8 2026',
    excerpt: 'Ngày hội lớn nhất trong năm với nhiều hoạt động vui chơi, học tập và giao lưu cho cả gia đình, cùng các chuyên gia hàng đầu.',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
    category: 'Sự kiện',
    date: '2025-12-15',
    author: 'IPD8 Events',
    authorImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
    readTime: '5 phút',
    eventDate: '2026-02-10',
    location: 'Trung tâm Hội nghị Quốc gia, Hà Nội',
    tags: ['Ngày hội', 'Gia đình']
  },
  {
    id: 9,
    title: 'Workshop "Tâm lý trẻ em và cách đồng hành cùng con"',
    excerpt: 'Workshop tương tác về tâm lý trẻ em, giúp cha mẹ hiểu và đồng hành cùng con trong từng giai đoạn phát triển.',
    image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&h=600&fit=crop',
    category: 'Sự kiện',
    date: '2025-12-12',
    author: 'IPD8 Events',
    authorImage: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=200&h=200&fit=crop',
    readTime: '4 phút',
    eventDate: '2026-01-25',
    location: 'Trung tâm IPD8, Hà Nội',
    tags: ['Workshop', 'Tâm lý']
  },
  {
    id: 10,
    title: 'Sự kiện: Triển lãm "Hành trình 1.000 ngày đầu đời"',
    excerpt: 'Triển lãm trưng bày các tác phẩm, nghiên cứu và thành tựu trong lĩnh vực chăm sóc và phát triển trẻ em.',
    image: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=800&h=600&fit=crop',
    category: 'Sự kiện',
    date: '2025-12-10',
    author: 'IPD8 Events',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    readTime: '3 phút',
    eventDate: '2026-02-15',
    location: 'Bảo tàng Phụ nữ Việt Nam, Hà Nội',
    tags: ['Triển lãm', 'Nghệ thuật']
  }
]

const activityCategories = [
  {
    id: 'events',
    title: 'Sự kiện đã tham gia',
    description: 'Các sự kiện, hội thảo và workshop mà IPD8 đã tổ chức và tham gia',
    icon: Megaphone,
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop',
    href: '/blog?tab=events'
  },
  {
    id: 'projects',
    title: 'Dự án mới triển khai',
    description: 'Các dự án và chương trình mới được IPD8 triển khai để phục vụ cộng đồng',
    icon: Building2,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
    href: '/blog?tab=projects'
  },
  {
    id: 'csr',
    title: 'Hoạt động CSR',
    description: 'Các hoạt động trách nhiệm xã hội và đóng góp cho cộng đồng của IPD8',
    icon: Heart,
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&h=400&fit=crop',
    href: '/blog?tab=csr'
  }
]

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const postVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

// Article Section Component
function ArticleSection({ 
  title, 
  subtitle, 
  articles, 
  sectionId 
}: { 
  title: string
  subtitle?: string
  articles: typeof newsArticles
  sectionId: string
}) {
  const featuredArticle = articles[0]
  const secondaryArticles = articles.slice(1, 5) // 4 articles for 2x2 grid
  const gridArticles = articles.slice(5)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <section id={sectionId} className="section-wrapper bg-white scroll-mt-20">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ lineHeight: '1.2' }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>

        {/* Featured Article */}
        {featuredArticle && (
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            variants={fadeInUp}
            className="mb-12 max-w-6xl mx-auto"
          >
            <Card className="bg-white border-2 border-gray-200 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300 rounded-2xl">
              <div className="relative w-full h-[500px] md:h-[600px]">
                <Image
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-white">
                  <div className="mb-4">
                    <Badge className="bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white mb-4">
                      {featuredArticle.category}
                    </Badge>
                  </div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white" style={{ lineHeight: '1.2' }}>
                    {featuredArticle.title}
                  </h3>
                  <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed max-w-4xl">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-white/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(featuredArticle.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{featuredArticle.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{featuredArticle.readTime}</span>
                    </div>
                  </div>
                  {(() => {
                    const hasEventDate = 'eventDate' in featuredArticle && 
                      featuredArticle.eventDate && 
                      typeof featuredArticle.eventDate === 'string'
                    const hasLocation = 'location' in featuredArticle && 
                      featuredArticle.location && 
                      typeof featuredArticle.location === 'string'
                    
                    if (!hasEventDate) return null
                    
                    return (
                      <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                        <p className="text-sm font-semibold text-white mb-1">Ngày diễn ra:</p>
                        <p className="text-lg text-white font-bold">{formatDate(featuredArticle.eventDate as string)}</p>
                        {hasLocation ? (
                          <p className="text-sm text-white/90 mt-2">{featuredArticle.location as string}</p>
                        ) : null}
                      </div>
                    )
                  })()}
                  <Button
                    className="w-full md:w-auto bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white hover:opacity-90 hover:scale-105 transition-all duration-200"
                    size="lg"
                  >
                    Đọc ngay
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Secondary Articles - 2x2 Grid */}
        {secondaryArticles.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 max-w-6xl mx-auto px-2 py-2 overflow-visible"
          >
            {secondaryArticles.map((article, index) => (
              <motion.div
                key={article.id}
                variants={postVariants}
              >
                <Card className="bg-white border-2 border-gray-200 shadow-lg overflow-hidden group hover:shadow-2xl hover:border-[#F441A5] transition-all duration-300 h-full flex flex-col">
                  <div className="relative h-48 overflow-hidden w-full">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white">
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <div className="mb-4 flex-grow">
                      <h4 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2" style={{ lineHeight: '1.2' }}>
                        {article.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                          <Image
                            src={article.authorImage}
                            alt={article.author}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {article.author}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(article.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{article.readTime}</span>
                        </div>
                      </div>

                      {(() => {
                        const hasEventDate = 'eventDate' in article && 
                          article.eventDate && 
                          typeof article.eventDate === 'string'
                        const hasLocation = 'location' in article && 
                          article.location && 
                          typeof article.location === 'string'
                        
                        if (!hasEventDate) return null
                        
                        return (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-semibold text-gray-700 mb-1">Ngày diễn ra:</p>
                            <p className="text-sm text-[#F441A5] font-bold">{formatDate(article.eventDate as string)}</p>
                            {hasLocation ? (
                              <p className="text-xs text-gray-600 mt-1">{article.location as string}</p>
                            ) : null}
                          </div>
                        )
                      })()}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white transition-all duration-200"
                    >
                      Xem chi tiết
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Additional Grid Articles */}
        {gridArticles.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 max-w-7xl mx-auto px-2 py-2 overflow-visible"
          >
            {gridArticles.map((article, index) => (
              <motion.div
                key={article.id}
                variants={postVariants}
                className="p-2"
              >
                <Card className="bg-white border-2 border-gray-200 shadow-lg overflow-hidden group hover:shadow-2xl hover:border-[#F441A5] transition-all duration-300 h-full flex flex-col">
                  <div className="relative h-40 overflow-hidden w-full">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white text-xs">
                        {article.category}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4 flex flex-col flex-grow">
                    <h5 className="text-base font-bold text-gray-900 mb-2 line-clamp-2" style={{ lineHeight: '1.2' }}>
                      {article.title}
                    </h5>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(article.date)}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white transition-all duration-200 text-xs"
                    >
                      Xem chi tiết
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* View All Link */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center max-w-6xl mx-auto"
        >
          <Link href={`${ROUTES.BLOG}?tab=${sectionId}`}>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white transition-all duration-200 px-8"
            >
              Xem tất cả
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// Activity Categories Section Component
function ActivityCategoriesSection() {
  return (
    <section id="activities" className="section-wrapper bg-gradient-to-br from-gray-50 to-white scroll-mt-20">
      <div className="container-custom">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeInUp}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ lineHeight: '1.2' }}>
            HOẠT ĐỘNG IPD8
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Các hoạt động và dự án mà IPD8 đang triển khai để phục vụ cộng đồng
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2 py-2 overflow-visible"
        >
          {activityCategories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.id}
                variants={postVariants}
              >
                <Link href={category.href}>
                  <Card className="bg-white border-2 border-gray-200 shadow-lg overflow-hidden group hover:shadow-2xl hover:border-[#F441A5] transition-all duration-300 h-full flex flex-col cursor-pointer">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={category.image}
                        alt={category.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#F441A5] transition-colors duration-300">
                          <Icon className="h-6 w-6 text-[#F441A5] group-hover:text-white transition-colors duration-300" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3" style={{ lineHeight: '1.2' }}>
                        {category.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-4 flex-grow">
                        {category.description}
                      </p>
                      <div className="flex items-center text-[#F441A5] font-semibold group-hover:gap-2 transition-all duration-200">
                        <span>Khám phá</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

function BlogPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>('news')

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'events' || tab === 'news') {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    // Update URL without scrolling
    const newUrl = `${ROUTES.BLOG}?tab=${tab}`
    router.push(newUrl, { scroll: false })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="container-custom py-4">
          <Breadcrumb
            items={[
              { label: 'Bài viết', href: ROUTES.BLOG }
            ]}
          />
        </div>
      </div>

      {/* Hero Section */}
      <section className="section-wrapper bg-gradient-to-br from-white to-gray-50">
        <div className="container-custom">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4" style={{ lineHeight: '1.2' }}>
              TIN TỨC & HOẠT ĐỘNG
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cập nhật tin tức, sự kiện và hoạt động mới nhất từ IPD8
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="section-wrapper bg-white border-b">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => handleTabChange('news')}
              className={cn(
                'px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200',
                activeTab === 'news'
                  ? 'bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white shadow-lg scale-105'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#F441A5] hover:text-[#F441A5]'
              )}
            >
              Tin tức chung
            </button>
            <button
              onClick={() => handleTabChange('events')}
              className={cn(
                'px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200',
                activeTab === 'events'
                  ? 'bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white shadow-lg scale-105'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#F441A5] hover:text-[#F441A5]'
              )}
            >
              Sự kiện
            </button>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'news' && (
          <motion.div
            key="news"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ArticleSection
              title="TIN TỨC CHUNG"
              subtitle="Những tin tức và cập nhật mới nhất từ IPD8"
              articles={newsArticles}
              sectionId="news"
            />
          </motion.div>
        )}
        {activeTab === 'events' && (
          <motion.div
            key="events"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ArticleSection
              title="SỰ KIỆN"
              subtitle="Các sự kiện, hội thảo và workshop sắp diễn ra"
              articles={eventArticles}
              sectionId="events"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Categories Section */}
      <ActivityCategoriesSection />
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    }>
      <BlogPageContent />
    </Suspense>
  )
}
