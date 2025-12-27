'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home with query parameter to open login modal
    router.replace(`${ROUTES.HOME}?auth=login`)
  }, [router])

  return null
}

