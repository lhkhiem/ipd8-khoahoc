'use client'

import { useState, useEffect } from 'react'
import { AboutHero } from '@/components/about/AboutHero'
import { AboutSection } from '@/components/about/AboutSection'
import { ThousandDaysSection } from '@/components/about/ThousandDaysSection'
import { VisionMissionSection } from '@/components/about/VisionMissionSection'
import { MethodologySection } from '@/components/about/MethodologySection'
import { FinalCTA } from '@/components/about/FinalCTA'

// Content data for about sections
const aboutSections = [
  {
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&h=800&fit=crop',
    imageAlt: 'Trung tâm IPD8',
    title: 'Tìm Hiểu Về IPD8',
    description: 'Trung tâm 1.000 ngày vàng đầu đời Việt Nam – New Zealand IPD 8 thành lập 16/04/2025, quyết định 08/QĐ – IPD, với sứ mệnh tiên phong trong việc triển khai các chương trình giáo dục sớm cho trẻ từ giai đoạn thai kỳ đến 2 tuổi – giai đoạn được Tổ chức Y tế Thế giới (WHO) và UNICEF xác định là "1.000 ngày vàng đầu đời" có ý nghĩa quyết định đối với sự phát triển trí tuệ, thể chất và cảm xúc của trẻ.',
    bullets: [
      'Thành lập theo quyết định 08/QĐ – IPD ngày 16/04/2025',
      'Tiên phong trong giáo dục sớm cho trẻ từ thai kỳ đến 2 tuổi',
      'Tuân thủ khuyến nghị của WHO và UNICEF về 1.000 ngày vàng đầu đời',
      'Tập trung vào phát triển trí tuệ, thể chất và cảm xúc toàn diện'
    ],
    reverse: false,
  },
  {
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&h=800&fit=crop',
    imageAlt: 'Giá trị cốt lõi IPD8',
    title: 'Giá Trị Cốt Lõi',
    description: 'Cách chúng tôi thực hiện: Thông qua tương tác chân thực, ý nghĩa: tiếp xúc âu yếm, ánh nhìn trìu mến, giọng nói dịu dàng, thói quen chăm sóc hàng ngày, cha mẹ được tạo cơ hội thực hành để đáp ứng nhịp phát triển tự nhiên của trẻ.',
    bullets: [
      'Tương tác chân thực, ý nghĩa giữa cha mẹ và con',
      'Tiếp xúc âu yếm, ánh nhìn trìu mến, giọng nói dịu dàng',
      'Thói quen chăm sóc hàng ngày được thiết kế khoa học',
      'Đáp ứng nhịp phát triển tự nhiên của trẻ'
    ],
    reverse: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=1200&h=800&fit=crop',
    imageAlt: 'Kết quả dựa trên bằng chứng',
    title: 'Kết Quả Dựa Trên Bằng Chứng',
    description: 'Mỗi hoạt động đều có mục tiêu rõ ràng, hướng dẫn từng bước và liên hệ trực tiếp đến các hệ thống trong não bộ. Gia đình được khuyến khích quan sát, ghi nhận và ăn mừng các cột mốc phát triển trong suốt hành trình của mình.',
    bullets: [
      'Mỗi hoạt động có mục tiêu rõ ràng và hướng dẫn từng bước',
      'Liên hệ trực tiếp đến các hệ thống trong não bộ',
      'Khuyến khích quan sát và ghi nhận cột mốc phát triển',
      'Xây dựng sự tự tin và kỹ năng cho gia đình'
    ],
    reverse: false,
  },
  {
    image: 'https://images.unsplash.com/photo-1445633629932-0029acc44e88?w=1200&h=800&fit=crop',
    imageAlt: 'Mỗi ngày đều có ý nghĩa',
    title: 'Mỗi Ngày Đều Có Ý Nghĩa',
    description: 'Khi gia đình kết nối bằng tình yêu thương, từng ngày sẽ góp phần định hình cả tương lai. Chương trình của chúng tôi biến mỗi ngày thành một viên gạch xây dựng sức khỏe, khả năng phục hồi và tiềm năng của trẻ.',
    bullets: [
      'Mỗi ngày góp phần định hình tương lai của trẻ',
      'Biến mỗi ngày thành viên gạch xây dựng sức khỏe và tiềm năng',
      'Vun đắp những gia đình tự tin và hạnh phúc',
      'Không chỉ xây dựng não bộ mà còn vun đắp tình yêu thương'
    ],
    reverse: true,
  },
]

export default function AboutPage() {
  const [headerHeight, setHeaderHeight] = useState<string>('104px')

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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <AboutHero marginTop={headerHeight} />

      {/* 1000 Ngày Đầu Tiên Section */}
      <ThousandDaysSection />

      {/* Alternating Content Sections */}
      {aboutSections.map((section, index) => (
        <AboutSection
          key={index}
          image={section.image}
          imageAlt={section.imageAlt}
          title={section.title}
          description={section.description}
          bullets={section.bullets}
          reverse={section.reverse}
          index={index}
        />
      ))}

      {/* Tầm Nhìn và Sứ Mệnh Section */}
      <VisionMissionSection />

      {/* Phương Pháp Triển Khai Section */}
      <MethodologySection />

      {/* Final CTA Section */}
      <FinalCTA />
    </div>
  )
}
