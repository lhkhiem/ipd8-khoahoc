import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import './globals.css'
import { Navbar } from '@/components/layouts/navbar'
import { ConditionalFooter } from '@/components/layouts/ConditionalFooter'
import { ScrollToTop } from '@/components/shared/ScrollToTop'
import { Providers } from './providers'
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/constants'

const inter = Inter({ 
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  adjustFontFallback: true
})

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['học online', 'mẹ và bé', 'nuôi dạy con', 'chăm sóc trẻ', 'thai kỳ'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <body className={`${inter.className} overflow-x-hidden w-full max-w-full`} style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>
        <Providers>
          <div className="relative flex min-h-screen flex-col overflow-x-hidden w-full max-w-full">
            {/* Navbar Section - Independent */}
            <Suspense fallback={<div className="h-[104px] md:h-[140px]"></div>}>
              <Navbar />
            </Suspense>
            {/* Main Content - No padding, hero section will handle its own spacing */}
            <main className="flex-1 w-full max-w-full">{children}</main>
            <ConditionalFooter />
            <ScrollToTop />
          </div>
        </Providers>
      </body>
    </html>
  )
}
