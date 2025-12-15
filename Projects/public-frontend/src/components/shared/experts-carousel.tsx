'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExpertCard } from '@/components/expert/expert-card'
import { Instructor } from '@/types'

interface ExpertsCarouselProps {
  instructors: Instructor[]
  autoplayDelay?: number
}

export function ExpertsCarousel({ instructors, autoplayDelay = 5000 }: ExpertsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoplay, setIsAutoplay] = useState(true)

  const itemsPerView = {
    mobile: 1,
    tablet: 2,
    desktop: 4
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => 
      prev + itemsPerView.desktop >= instructors.length ? 0 : prev + 1
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, instructors.length - itemsPerView.desktop) : prev - 1
    )
  }

  useEffect(() => {
    if (!isAutoplay) return

    const interval = setInterval(() => {
      nextSlide()
    }, autoplayDelay)

    return () => clearInterval(interval)
  }, [currentIndex, isAutoplay, autoplayDelay])

  const handleMouseEnter = () => setIsAutoplay(false)
  const handleMouseLeave = () => setIsAutoplay(true)

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 rounded-full bg-white shadow-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
        onClick={prevSlide}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 rounded-full bg-white shadow-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all"
        onClick={nextSlide}
        disabled={currentIndex + itemsPerView.desktop >= instructors.length}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>

      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView.desktop)}%)` }}
        >
          {instructors.map((instructor) => (
            <div 
              key={instructor.id} 
              className="w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-3"
            >
              <ExpertCard instructor={instructor} />
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: Math.ceil(instructors.length / itemsPerView.desktop) }).map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${
              Math.floor(currentIndex / itemsPerView.desktop) === index
                ? 'bg-primary w-8'
                : 'bg-gray-300 w-2 hover:bg-gray-400'
            }`}
            onClick={() => setCurrentIndex(index * itemsPerView.desktop)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
