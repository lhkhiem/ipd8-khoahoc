'use client'

import React, { use } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Check, 
  Gift, 
  Star,
  Phone,
  MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { allPackages, packageContentMap } from '@/data/packages'
import { mockCourses } from '@/data/courses'
import { getRelatedCourseIds } from '@/data/package-course-mapping'
import { getPackageVideoId, getVideoEmbedUrl } from '@/data/package-video-mapping'
import { PackageRelatedCourses } from '@/components/packages/PackageRelatedCourses'
import { ROUTES } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { validateSlug } from '@/lib/security'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  
  // Validate and sanitize slug
  const validatedSlug = validateSlug(slug)
  
  const pkg = validatedSlug ? allPackages.find((p) => p.slug === validatedSlug) : null

  if (!validatedSlug || !pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-4 max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Gói học không tồn tại
          </h1>
          <p className="text-gray-600 mb-8">
            Gói học bạn tìm kiếm không có trong hệ thống.
          </p>
          <Link href={ROUTES.COURSES || '/'}>
            <Button>Quay lại danh sách gói học</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Get related courses
  const relatedCourseIds = getRelatedCourseIds(pkg.slug)
  const relatedCourses = relatedCourseIds
    .map(id => mockCourses.find(c => c.id === id))
    .filter((course): course is typeof mockCourses[0] => course !== undefined)

  // Get package content
  const packageContent = packageContentMap[pkg.slug] || ''

  // Format content with line breaks
  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.trim() === '') return <br key={index} />
      return <p key={index} className="mb-3">{line}</p>
    })
  }

  const hasDiscount = pkg.originalPrice && pkg.originalPrice > pkg.price
  const discountPercent = hasDiscount 
    ? Math.round(((pkg.originalPrice! - pkg.price) / pkg.originalPrice!) * 100)
    : 0

  // Get video ID for this package
  const videoId = getPackageVideoId(pkg.slug, pkg.id)
  const videoUrl = videoId ? getVideoEmbedUrl(videoId) : null

  return (
    <>
      {/* Hero Banner */}
      <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-gradient-to-br from-[#F441A5] to-[#FF5F6D]">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4 md:px-6 max-w-[80%]">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <Link 
                href={ROUTES.COURSES || '/'}
                className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Quay lại danh sách gói học</span>
              </Link>
              
              <div className="flex items-center gap-3 mb-4">
                {pkg.popular && (
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border border-white/30">
                    <Star className="h-3 w-3 mr-1" />
                    Phổ biến
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge className="bg-red-500 text-white">
                    -{discountPercent}%
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {pkg.title}
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl leading-relaxed">
                {pkg.description}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full bg-white py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-[80%]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Package Video - Only show if video exists */}
              {videoUrl && (
                <motion.div
                  {...fadeInUp}
                  className="w-full rounded-2xl overflow-hidden shadow-xl"
                  style={{ aspectRatio: '16/9' }}
                >
                  <iframe
                    src={videoUrl}
                    className="w-full h-full border-0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={`Video giới thiệu ${pkg.title}`}
                  />
                </motion.div>
              )}

              {/* Package Info Cards */}
              <motion.div
                {...fadeInUp}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <Card className="border border-gray-200">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-[#F441A5]" />
                      <h3 className="font-semibold text-gray-900">Thời lượng</h3>
                    </div>
                    <p className="text-lg text-gray-700">{pkg.duration}</p>
                    <p className="text-sm text-gray-500 mt-1">{pkg.sessions} buổi học</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="h-5 w-5 text-[#F441A5]" />
                      <h3 className="font-semibold text-gray-900">Đối tượng</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pkg.targetAudience.map((audience, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {audience === 'me-bau' ? 'Mẹ bầu' : 
                           audience === '0-1-tuoi' ? '0-1 tuổi' : 
                           audience === '1-2-tuoi' ? '1-2 tuổi' : 
                           'Tất cả'}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Features */}
              {pkg.features && pkg.features.length > 0 && (
                <motion.div {...fadeInUp}>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    Tính năng nổi bật
                  </h2>
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <ul className="space-y-3">
                        {pkg.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-[#F441A5] mt-0.5 shrink-0" />
                            <span className="text-gray-700 leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Benefits */}
              {pkg.benefits && pkg.benefits.length > 0 && (
                <motion.div {...fadeInUp}>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    Lợi ích bạn nhận được
                  </h2>
                  <Card className="border border-gray-200 bg-gradient-to-br from-pink-50 to-rose-50">
                    <CardContent className="p-6">
                      <ul className="space-y-3">
                        {pkg.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="h-2 w-2 rounded-full bg-[#F441A5] mt-2 shrink-0" />
                            <span className="text-gray-700 leading-relaxed">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Package Content */}
              {packageContent && (
                <motion.div {...fadeInUp}>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                    Chi tiết gói học
                  </h2>
                  <Card className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="prose prose-lg max-w-none text-gray-700">
                        {formatContent(packageContent)}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Right Column - Pricing Card */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="sticky top-24"
              >
                <Card className="border-2 border-[#F441A5] shadow-xl">
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                      Đăng ký ngay
                    </h3>

                    {/* Price */}
                    <div className="mb-6">
                      {hasDiscount && (
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-500 line-through">
                            {formatCurrency(pkg.originalPrice!)}
                          </span>
                          <Badge className="bg-red-500 text-white">
                            -{discountPercent}%
                          </Badge>
                        </div>
                      )}
                      <div className="text-4xl font-bold text-[#F441A5] mb-2">
                        {formatCurrency(pkg.price)}
                      </div>
                      
                      {/* Member Price */}
                      {pkg.memberPrice && (
                        <div className="mt-4 space-y-2 text-sm">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="font-semibold text-gray-700 mb-1">
                              Thành viên Bạc:
                            </div>
                            <div className="text-lg font-bold text-[#F441A5]">
                              {formatCurrency(pkg.memberPrice.silver || pkg.price)}
                            </div>
                          </div>
                          {pkg.memberPrice.gold && (
                            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <div className="font-semibold text-gray-700 mb-1">
                                Thành viên Vàng:
                              </div>
                              <div className="text-lg font-bold text-[#F441A5]">
                                {formatCurrency(pkg.memberPrice.gold)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bonuses */}
                    {pkg.bonuses && pkg.bonuses.length > 0 && (
                      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Gift className="h-5 w-5 text-yellow-600" />
                          <h4 className="font-semibold text-yellow-900">Quà tặng kèm</h4>
                        </div>
                        <ul className="space-y-2">
                          {pkg.bonuses.map((bonus, idx) => (
                            <li key={idx} className="text-sm text-yellow-800 flex items-start gap-2">
                              <span className="text-yellow-600">•</span>
                              <span>{bonus}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-[#F441A5] hover:bg-[#F441A5]/90 text-white text-lg py-6"
                        size="lg"
                      >
                        Đăng ký ngay
                      </Button>
                      
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white"
                          asChild
                        >
                          <a href={`tel:0947701010`}>
                            <Phone className="h-4 w-4 mr-2" />
                            Gọi ngay
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white"
                          asChild
                        >
                          <a href="https://zalo.me/0947701010" target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Zalo
                          </a>
                        </Button>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-600 text-center">
                        Hoặc liên hệ qua Zalo: <strong>0947 70 10 10</strong>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <PackageRelatedCourses courses={relatedCourses} />
      )}
    </>
  )
}

