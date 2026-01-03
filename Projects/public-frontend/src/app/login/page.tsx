'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/lib/constants'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (!isLoading && isAuthenticated) {
      router.replace(ROUTES.DASHBOARD)
      return
    }

    // If not authenticated, redirect to home with query parameter to open login modal
    if (!isLoading && !isAuthenticated) {
      router.replace(`${ROUTES.HOME}?auth=login`)
    }
  }, [isAuthenticated, isLoading, router])

  // Show nothing while checking authentication or redirecting
  return null
}

