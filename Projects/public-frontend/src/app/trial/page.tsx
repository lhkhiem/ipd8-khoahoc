'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ChevronRight } from 'lucide-react'
import { TrialHero } from '@/components/trial/TrialHero'
import { TrialVideo } from '@/components/trial/TrialVideo'
import { SessionDetailContent } from '@/components/trial/SessionDetailContent'
import { SessionSidebar } from '@/components/trial/SessionSidebar'
import { EvaluationSection } from '@/components/trial/EvaluationSection'
import { BookingDrawer } from '@/components/trial/BookingDrawer'
import { StickyBookingSummary } from '@/components/trial/StickyBookingSummary'
import { Session } from '@/components/trial/SessionCard'
import { useSessions } from '@/hooks/useSessions'
import { ROUTES } from '@/lib/constants'
import { ContactForm } from '@/components/courses/ContactForm'

export default function TrialPage() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [stickySession, setStickySession] = useState<Session | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: sessions = [], isLoading: sessionsLoading, error: sessionsError } = useSessions('hoc-thu')

  const handleRegister = (session: Session) => {
    setSelectedSession(session)
    setStickySession(session)
    setIsModalOpen(true)
  }

  const handleBookingSuccess = (bookingId: string) => {
    setIsModalOpen(false)
    setStickySession(null)
  }

  const handlePricingBlockRegister = (blockId: string) => {
    // Handle pricing block registration
    if (sessions.length > 0) {
      handleRegister(sessions[0])
    }
  }

  // Mock data for session detail
  const sessionDetail = {
    sessionName: 'BUỔI HỌC 01: GIỚI THIỆU VỀ PHƯƠNG PHÁP IPD8',
    description: `Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.

Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.`,
    benefitsForMom: [
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
      'Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.',
    ],
    benefitsForBaby: [
      'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.',
      'Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.',
    ],
    instructor: {
      name: 'MDPhuong',
      title: 'Nguyễn Văn A & Thu Ba Dương Đại Học Y Dược',
      image: sessions[0]?.instructor?.image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    },
  }

  // Mock pricing blocks
  const pricingBlocks = [
    {
      id: 'me-bau',
      title: 'DÀNH CHO MẸ BẦU',
      sessions: 20,
      format: 'Nhóm nhỏ 1-1',
      instructor: 'Nguyễn Văn A - Trường ĐH Y Dược',
      startDate: '02/02/2025',
      schedule: 'Thứ 2 + Thứ 4 + Thứ 6 hàng tuần',
      time: '3:00PM - 4:00PM',
      price: 'Liên hệ',
    },
    {
      id: '0-12-thang',
      title: 'DÀNH CHO MẸ CÓ CON TỪ 0 - 12 THÁNG',
      sessions: 20,
      format: 'Nhóm nhỏ 1-1',
      instructor: 'Nguyễn Văn A - Trường ĐH Y Dược',
      startDate: '02/02/2025',
      schedule: 'Thứ 2 + Thứ 4 + Thứ 6 hàng tuần',
      time: '3:00PM - 4:00PM',
      price: 'Liên hệ',
    },
    {
      id: 'trial-99k',
      title: 'GÓI HỌC THỬ 99K',
      sessions: 1,
      format: 'Nhóm nhỏ 1-1',
      instructor: 'Nguyễn Văn A - Trường ĐH Y Dược',
      startDate: '02/02/2025',
      schedule: 'Thứ 2 + Thứ 4 + Thứ 6 hàng tuần',
      time: '3:00PM - 4:00PM',
      price: 99000,
    },
  ]

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href={ROUTES.HOME} className="hover:text-[#F441A5] transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={ROUTES.COURSES} className="hover:text-[#F441A5] transition-colors">
              Khóa học
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">Học thử</span>
          </nav>
        </div>
      </div>

      {/* Trial Hero */}
      <TrialHero
        onBookNow={() => {
          if (sessions.length > 0) {
            handleRegister(sessions[0])
          }
        }}
        onRegister={() => {
          if (sessions.length > 0) {
            handleRegister(sessions[0])
          }
        }}
      />

      {/* Video Section */}
      <TrialVideo />

      {/* Main Content - 2 Column Layout */}
      <section className="w-full bg-white py-16 md:py-20 lg:py-24">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2">
              <SessionDetailContent
                sessionName={sessionDetail.sessionName}
                description={sessionDetail.description}
                benefitsForMom={sessionDetail.benefitsForMom}
                benefitsForBaby={sessionDetail.benefitsForBaby}
                instructor={sessionDetail.instructor}
              />
              <EvaluationSection />
            </div>

            {/* Right Column - Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <SessionSidebar
                  pricingBlocks={pricingBlocks}
                  onRegister={handlePricingBlockRegister}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <ContactForm parallax={true} />

      {/* Booking Drawer */}
      <BookingDrawer
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        session={selectedSession}
        onSuccess={handleBookingSuccess}
      />

      {/* Sticky Booking Summary */}
      {stickySession && (
        <StickyBookingSummary
          session={stickySession}
          onRegister={() => setIsModalOpen(true)}
          onClose={() => setStickySession(null)}
        />
      )}
    </>
  )
}
