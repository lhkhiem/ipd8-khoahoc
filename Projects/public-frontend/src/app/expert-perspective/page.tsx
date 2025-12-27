'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Breadcrumb } from '@/components/shared/breadcrumb'
import { ROUTES } from '@/lib/constants'
import { ChevronRight, Users, Calendar, Clock, ArrowRight, Loader2 } from 'lucide-react'

// Mock blog posts data
const allPosts = [
  {
    id: 1,
    title: 'Tầm quan trọng của 1.000 ngày đầu đời trong sự phát triển của trẻ',
    excerpt: '1.000 ngày đầu đời là giai đoạn vàng quyết định sự phát triển toàn diện của trẻ. Nghiên cứu khoa học đã chứng minh rằng những gì xảy ra trong giai đoạn này sẽ ảnh hưởng đến sức khỏe, trí tuệ và tương lai của trẻ...',
    author: 'TS. Nguyễn Thị Lan',
    authorRole: 'Chuyên gia Nhi khoa',
    authorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=600&fit=crop',
    category: 'Nhi khoa',
    date: '2025-12-15',
    readTime: '5 phút',
    tags: ['Phát triển trẻ em', '1.000 ngày đầu đời', 'Sức khỏe'],
    slug: 'tam-quan-trong-1000-ngay-dau-doi'
  },
  {
    id: 2,
    title: 'Dinh dưỡng đúng cách cho mẹ bầu trong 3 tháng đầu thai kỳ',
    excerpt: '3 tháng đầu thai kỳ là giai đoạn quan trọng nhất cho sự hình thành và phát triển của thai nhi. Dinh dưỡng đúng cách trong giai đoạn này không chỉ giúp thai nhi phát triển khỏe mạnh mà còn đảm bảo sức khỏe cho mẹ...',
    author: 'BS. Trần Minh Anh',
    authorRole: 'Chuyên gia Dinh dưỡng',
    authorImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop',
    category: 'Dinh dưỡng',
    date: '2025-12-12',
    readTime: '7 phút',
    tags: ['Dinh dưỡng mẹ bầu', 'Thai kỳ', 'Sức khỏe'],
    slug: 'dinh-duong-dung-cach-me-bau-3-thang-dau'
  },
  {
    id: 3,
    title: 'Phương pháp giáo dục sớm Montessori cho trẻ từ 0-3 tuổi',
    excerpt: 'Giáo dục sớm theo phương pháp Montessori giúp trẻ phát triển toàn diện về trí tuệ, cảm xúc và thể chất. Phương pháp này tôn trọng sự phát triển tự nhiên của trẻ và khuyến khích trẻ học tập thông qua trải nghiệm...',
    author: 'TS. Phạm Văn Hùng',
    authorRole: 'Chuyên gia Tâm lý',
    authorImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
    category: 'Giáo dục sớm',
    date: '2025-12-10',
    readTime: '8 phút',
    tags: ['Montessori', 'Giáo dục sớm', 'Phát triển trẻ em'],
    slug: 'phuong-phap-montessori-0-3-tuoi'
  },
  {
    id: 4,
    title: 'Chăm sóc sức khỏe mẹ sau sinh: Những điều cần biết',
    excerpt: 'Sau sinh là giai đoạn quan trọng không kém thai kỳ. Mẹ cần được chăm sóc đặc biệt để phục hồi sức khỏe và có đủ năng lượng để chăm sóc em bé. Bài viết này sẽ chia sẻ những kiến thức cần thiết về chăm sóc sức khỏe mẹ sau sinh...',
    author: 'BS. Lê Thị Mai',
    authorRole: 'Chuyên gia Sản khoa',
    authorImage: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=200&h=200&fit=crop',
    image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&h=600&fit=crop',
    category: 'Sản khoa',
    date: '2025-12-08',
    readTime: '6 phút',
    tags: ['Sau sinh', 'Sức khỏe mẹ', 'Chăm sóc'],
    slug: 'cham-soc-suc-khoe-me-sau-sinh'
  },
  {
    id: 5,
    title: 'Phát triển vận động cho trẻ sơ sinh: Từ lẫy đến đi',
    excerpt: 'Phát triển vận động là một trong những cột mốc quan trọng trong quá trình phát triển của trẻ. Từ những cử động đầu tiên đến những bước đi đầu tiên, mỗi giai đoạn đều có ý nghĩa riêng...',
    author: 'BS. Nguyễn Thị Hoa',
    authorRole: 'Chuyên gia Phát triển vận động',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    image: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=800&h=600&fit=crop',
    category: 'Vận động',
    date: '2025-12-05',
    readTime: '5 phút',
    tags: ['Vận động', 'Phát triển', 'Trẻ sơ sinh'],
    slug: 'phat-trien-van-dong-tre-so-sinh'
  },
  {
    id: 6,
    title: 'Dấu hiệu nhận biết và cách xử lý khi trẻ bị sốt',
    excerpt: 'Sốt là một trong những triệu chứng phổ biến ở trẻ em. Hiểu rõ về sốt và cách xử lý đúng cách sẽ giúp cha mẹ bình tĩnh và chăm sóc trẻ tốt hơn. Bài viết này sẽ cung cấp những thông tin cần thiết về sốt ở trẻ...',
    author: 'TS. Nguyễn Thị Lan',
    authorRole: 'Chuyên gia Nhi khoa',
    authorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=600&fit=crop',
    category: 'Nhi khoa',
    date: '2025-12-03',
    readTime: '6 phút',
    tags: ['Sốt', 'Sức khỏe trẻ', 'Chăm sóc'],
    slug: 'dau-hieu-va-cach-xu-ly-tre-bi-sot'
  },
  {
    id: 7,
    title: 'Thực đơn dinh dưỡng cho trẻ từ 6-12 tháng tuổi',
    excerpt: 'Giai đoạn từ 6-12 tháng là thời điểm trẻ bắt đầu làm quen với thức ăn đặc. Việc xây dựng thực đơn dinh dưỡng đúng cách sẽ giúp trẻ phát triển tốt và hình thành thói quen ăn uống lành mạnh...',
    author: 'BS. Trần Minh Anh',
    authorRole: 'Chuyên gia Dinh dưỡng',
    authorImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop',
    category: 'Dinh dưỡng',
    date: '2025-12-01',
    readTime: '7 phút',
    tags: ['Dinh dưỡng', 'Ăn dặm', 'Trẻ em'],
    slug: 'thuc-don-dinh-duong-tre-6-12-thang'
  },
  {
    id: 8,
    title: 'Tâm lý trẻ em: Hiểu và đồng hành cùng cảm xúc của con',
    excerpt: 'Hiểu được tâm lý trẻ em là chìa khóa để cha mẹ có thể đồng hành cùng con trong quá trình phát triển. Mỗi giai đoạn phát triển đều có những đặc điểm tâm lý riêng mà cha mẹ cần nắm bắt...',
    author: 'TS. Phạm Văn Hùng',
    authorRole: 'Chuyên gia Tâm lý',
    authorImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
    category: 'Tâm lý',
    date: '2025-11-28',
    readTime: '9 phút',
    tags: ['Tâm lý', 'Cảm xúc', 'Phát triển'],
    slug: 'tam-ly-tre-em-hieu-va-dong-hanh'
  },
  {
    id: 9,
    title: 'Chuẩn bị tâm lý và vật chất cho việc sinh con',
    excerpt: 'Chuẩn bị tốt cho việc sinh con không chỉ về mặt vật chất mà còn về mặt tâm lý. Sự chuẩn bị kỹ lưỡng sẽ giúp mẹ bầu tự tin và bình tĩnh hơn trong quá trình sinh nở...',
    author: 'BS. Lê Thị Mai',
    authorRole: 'Chuyên gia Sản khoa',
    authorImage: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=200&h=200&fit=crop',
    image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&h=600&fit=crop',
    category: 'Sản khoa',
    date: '2025-11-25',
    readTime: '6 phút',
    tags: ['Sinh con', 'Chuẩn bị', 'Sản khoa'],
    slug: 'chuan-bi-tam-ly-vat-chat-sinh-con'
  },
  {
    id: 10,
    title: 'Tầm quan trọng của vận động ngoài trời cho trẻ em',
    excerpt: 'Vận động ngoài trời không chỉ giúp trẻ phát triển thể chất mà còn có nhiều lợi ích về mặt tinh thần và xã hội. Bài viết này sẽ chia sẻ về tầm quan trọng và cách khuyến khích trẻ vận động ngoài trời...',
    author: 'BS. Nguyễn Thị Hoa',
    authorRole: 'Chuyên gia Phát triển vận động',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    image: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=800&h=600&fit=crop',
    category: 'Vận động',
    date: '2025-11-22',
    readTime: '5 phút',
    tags: ['Vận động', 'Ngoài trời', 'Phát triển'],
    slug: 'tam-quan-trong-van-dong-ngoai-troi'
  }
]

const POSTS_PER_PAGE = 6

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
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export default function ExpertPerspectivePage() {
  const [headerHeight, setHeaderHeight] = useState<string>('104px')
  const [displayedPosts, setDisplayedPosts] = useState(allPosts.slice(0, POSTS_PER_PAGE))

  // Calculate header height
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (typeof window === 'undefined') return

      const header = document.querySelector('header')
      if (header) {
        const actualHeight = header.offsetHeight
        setHeaderHeight(`${actualHeight}px`)
      } else {
        setHeaderHeight(window.innerWidth >= 768 ? '140px' : '104px')
      }
    }

    updateHeaderHeight()

    const handleResize = () => {
      requestAnimationFrame(() => {
        updateHeaderHeight()
      })
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateHeaderHeight)
    } else {
      updateHeaderHeight()
    }

    const timeoutId = setTimeout(updateHeaderHeight, 100)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      }
      document.removeEventListener('DOMContentLoaded', updateHeaderHeight)
      clearTimeout(timeoutId)
    }
  }, [])
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(allPosts.length > POSTS_PER_PAGE)
  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMorePosts()
        }
      },
      { threshold: 0.1 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current)
      }
    }
  }, [hasMore, isLoading])

  const loadMorePosts = () => {
    setIsLoading(true)
    
    // Simulate API call delay
    setTimeout(() => {
      const nextIndex = displayedPosts.length
      const nextPosts = allPosts.slice(nextIndex, nextIndex + POSTS_PER_PAGE)
      
      if (nextPosts.length > 0) {
        setDisplayedPosts((prev) => [...prev, ...nextPosts])
        setHasMore(nextIndex + POSTS_PER_PAGE < allPosts.length)
      } else {
        setHasMore(false)
      }
      
      setIsLoading(false)
    }, 1000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b" style={{ marginTop: headerHeight }}>
        <div className="container-custom py-4">
          <Breadcrumb
            items={[
              { label: 'Chuyên gia IPD8', href: ROUTES.EXPERTS },
              { label: 'Góc chuyên gia', href: ROUTES.EXPERT_PERSPECTIVE }
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
              className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold border-2 border-gray-200 hover:border-[#F441A5] hover:text-[#F441A5] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Users className="h-5 w-5 inline-block mr-2" />
              CHUYÊN GIA IPD8
            </Link>
            <Link
              href={ROUTES.EXPERT_PERSPECTIVE}
              className="btn-gradient-pink px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg flex items-center gap-2"
            >
              Góc chuyên gia
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

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
              GÓC CHUYÊN GIA
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tổng hợp những chia sẻ, kiến thức và kinh nghiệm từ các chuyên gia hàng đầu trong lĩnh vực chăm sóc và phát triển trẻ em
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="section-wrapper bg-gray-50">
        <div className="container-custom">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2 py-2 overflow-visible"
          >
            <AnimatePresence>
              {displayedPosts.map((post) => (
                <motion.div
                  key={post.id}
                  variants={postVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout
                >
                  <div className="p-2">
                    <Link href={`/expert-perspective/${post.slug}`}>
                      <Card className="bg-white border-2 border-gray-200 shadow-lg overflow-hidden group hover:shadow-2xl hover:border-[#F441A5] transition-all duration-300 h-full flex flex-col cursor-pointer">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white">
                          {post.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <div className="mb-4 flex-grow">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2" style={{ lineHeight: '1.2' }}>
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                            <Image
                              src={post.authorImage}
                              alt={post.author}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {post.author}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {post.authorRole}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(post.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white transition-all duration-200"
                      >
                        Đọc thêm
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Loading indicator and observer */}
          <div ref={observerRef} className="mt-8">
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center py-8"
              >
                <Loader2 className="h-8 w-8 animate-spin text-[#F441A5]" />
              </motion.div>
            )}
            {!hasMore && displayedPosts.length > POSTS_PER_PAGE && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <p className="text-gray-600">Đã hiển thị tất cả bài viết</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

