'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  value: string
  duration?: number
}

export function AnimatedCounter({ value, duration = 2000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  // Extract number from string like "10,000+" or "98%"
  const getNumber = (str: string): number => {
    const numStr = str.replace(/[^0-9]/g, '')
    return parseInt(numStr) || 0
  }

  // Get suffix like "+" or "%"
  const getSuffix = (str: string): string => {
    return str.replace(/[0-9,]/g, '')
  }

  const targetNumber = getNumber(value)
  const suffix = getSuffix(value)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true)
            
            const startTime = Date.now()
            const startValue = 0

            const animate = () => {
              const currentTime = Date.now()
              const elapsed = currentTime - startTime
              const progress = Math.min(elapsed / duration, 1)

              // Easing function for smooth animation
              const easeOutQuart = 1 - Math.pow(1 - progress, 4)
              const currentValue = Math.floor(startValue + (targetNumber - startValue) * easeOutQuart)

              setCount(currentValue)

              if (progress < 1) {
                requestAnimationFrame(animate)
              } else {
                setCount(targetNumber)
              }
            }

            animate()
          }
        })
      },
      { threshold: 0.5 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [targetNumber, duration, hasAnimated])

  // Format number with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  return (
    <div ref={elementRef}>
      {formatNumber(count)}
      {suffix}
    </div>
  )
}
