'use client'

import { ReactNode } from 'react'

interface ParallaxSectionProps {
  children: ReactNode
  className?: string
}

export function ParallaxSection({ children, className = '' }: ParallaxSectionProps) {
  return (
    <section 
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1920&h=1080&fit=crop)',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        minHeight: '60vh'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-white/90" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  )
}
