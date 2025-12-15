'use client'

import { usePathname } from 'next/navigation'
import { Footer } from './footer'

export function ConditionalFooter() {
  const pathname = usePathname()
  const isDashboard = pathname?.startsWith('/dashboard')
  
  // Don't show footer in dashboard - it has its own footer
  if (isDashboard) {
    return null
  }
  
  return <Footer />
}

