'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants'

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home with query parameter to open register modal
    router.replace(`${ROUTES.HOME}?auth=register`)
  }, [router])

  return null
}













