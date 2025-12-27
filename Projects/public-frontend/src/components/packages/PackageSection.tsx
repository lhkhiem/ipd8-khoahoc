'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PackageCard } from './PackageCard'
import { Package } from '@/types'

interface PackageSectionProps {
  title?: string
  subtitle?: string
  packages: Package[]
  showLargeCard?: boolean
}

export function PackageSection({ 
  title = "Gói học 8i - Giải pháp toàn diện",
  subtitle = "Các gói học được thiết kế chuyên biệt cho từng giai đoạn phát triển của con",
  packages,
  showLargeCard = false
}: PackageSectionProps) {
  const CARDS_PER_VIEW = 3
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mobileIndex, setMobileIndex] = useState(0)

  // Calculate max index based on total packages
  const maxIndex = Math.max(0, (packages?.length || 0) - CARDS_PER_VIEW)
  const mobileMaxIndex = Math.max(0, (packages?.length || 0) - 1)

  // Navigation functions with loop
  const goPrev = () => {
    setCurrentIndex(prev => {
      if (prev === 0) {
        return maxIndex // Quay về card cuối
      }
      return prev - 1
    })
  }

  const goNext = () => {
    setCurrentIndex(prev => {
      if (prev >= maxIndex) {
        return 0 // Quay về card đầu
      }
      return prev + 1
    })
  }

  // Mobile navigation functions with loop
  const goPrevMobile = () => {
    setMobileIndex(prev => {
      if (prev === 0) {
        return mobileMaxIndex // Quay về card cuối
      }
      return prev - 1
    })
  }

  const goNextMobile = () => {
    setMobileIndex(prev => {
      if (prev >= mobileMaxIndex) {
        return 0 // Quay về card đầu
      }
      return prev + 1
    })
  }

  // Lấy 3 cards hiển thị dựa trên currentIndex
  const getVisibleCards = () => {
    if (!packages || packages.length === 0) return []
    
    const visibleCards = []
    for (let i = 0; i < CARDS_PER_VIEW; i++) {
      const index = (currentIndex + i) % packages.length
      visibleCards.push(packages[index])
    }
    return visibleCards
  }

  const visibleCards = getVisibleCards()
  const cardWidth = '28%'
  const gapWidth = '2.5%'

  return (
    <section className="section-wrapper bg-white">
      <div className="container-custom">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Slider Container */}
        <div className="w-full">
          {/* Mobile portrait < 770px: 1 card với slider */}
          <div className="min-[770px]:hidden">
            <div className="flex items-center justify-center gap-4">
              {/* Left Arrow */}
              <button
                onClick={goPrevMobile}
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 bg-[#F441A5] text-white hover:bg-[#F441A5]/90"
                aria-label="Previous package"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* 1 Card */}
              <div className="flex-1 max-w-full">
                {packages && packages.length > 0 && packages[mobileIndex] && (
                  <PackageCard 
                    package={packages[mobileIndex]} 
                    index={mobileIndex}
                    isLarge={false}
                  />
                )}
              </div>

              {/* Right Arrow */}
              <button
                onClick={goNextMobile}
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 bg-[#F441A5] text-white hover:bg-[#F441A5]/90"
                aria-label="Next package"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Desktop/Tablet ≥ 770px: 3 cards với slider */}
          <div className="relative py-4 px-2 sm:px-4 overflow-visible w-full max-w-full">
            <div className="hidden min-[770px]:flex min-[770px]:items-center min-[770px]:justify-center min-[770px]:gap-5">
            {/* Left Arrow */}
            <button
              onClick={goPrev}
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 bg-[#F441A5] text-white hover:bg-[#F441A5]/90 hover:scale-110"
              aria-label="Previous packages"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

              {/* 3 Slots cố định - Căn trái/giữa/phải */}
              <div
                className="flex overflow-visible pb-20 pt-4 justify-between mx-auto" 
                style={{
                  width: '85%', // Giảm xuống để có không gian cho shadow trái/phải
                  maxWidth: '85%',
                  minWidth: '85%'
                }}
              >
                {visibleCards.map((pkg, slotIndex) => {
                  const originalIndex = packages.findIndex(p => p.id === pkg.id)
                  return (
                  <div 
                      key={`${pkg.id}-${currentIndex}-${slotIndex}`}
                    className="flex-shrink-0"
                    style={{
                        width: cardWidth,
                        minWidth: cardWidth,
                        maxWidth: cardWidth,
                        flexBasis: cardWidth
                    }}
                  >
                    <PackageCard 
                      package={pkg} 
                        index={originalIndex}
                        isLarge={showLargeCard && slotIndex === Math.floor(CARDS_PER_VIEW / 2)}
                    />
                  </div>
                  )
                })}
            </div>

            {/* Right Arrow */}
            <button
              onClick={goNext}
                className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 bg-[#F441A5] text-white hover:bg-[#F441A5]/90 hover:scale-110"
              aria-label="Next packages"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
