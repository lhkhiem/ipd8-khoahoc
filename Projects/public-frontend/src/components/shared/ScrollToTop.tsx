'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp } from 'lucide-react'

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-[90] h-14 w-14 rounded-full bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] border-2 border-white flex items-center justify-center shadow-lg hover:opacity-90 hover:scale-110 transition-all duration-200"
          style={{ right: 'min(2rem, calc(100vw - 4rem))' }}
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6 text-white" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

