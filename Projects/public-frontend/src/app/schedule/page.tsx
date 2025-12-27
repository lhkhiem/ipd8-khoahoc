'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Users, MapPin, ChevronLeft, ChevronRight, Filter, List, Grid, X, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ROUTES } from '@/lib/constants'

// Mock data for schedule sessions
interface ScheduleSession {
  id: string
  title: string
  course: string
  date: string
  time: string
  endTime?: string // For time range display
  duration: string
  instructor: string
  location: string
  capacity: number
  enrolled: number
  type: 'group' | 'one-on-one'
  status: 'upcoming' | 'ongoing' | 'completed' | 'full'
}

// Generate schedule based on weekly pattern (Thứ 2, 4, 6 hoặc Thứ 3, 5)
const generateWeeklySchedule = (
  course: string,
  titlePrefix: string,
  startDate: string,
  time: string,
  duration: string,
  instructor: string,
  location: string,
  capacity: number,
  baseEnrolled: number,
  type: 'group' | 'one-on-one',
  daysOfWeek: number[], // 0 = CN, 1 = T2, 2 = T3, ..., 6 = T7
  totalSessions: number
): ScheduleSession[] => {
  const sessions: ScheduleSession[] = []
  const start = new Date(startDate)
  let sessionCount = 0
  let currentDate = new Date(start)
  
  // Create unique identifier for this schedule (course + time + location)
  const scheduleId = `${course}-${time}-${location}`.replace(/\s+/g, '-').toLowerCase()
  
  // Find first matching day
  while (!daysOfWeek.includes(currentDate.getDay()) && sessionCount === 0) {
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  while (sessionCount < totalSessions && currentDate.getMonth() === 11) { // December = 11
    const dayOfWeek = currentDate.getDay()
    if (daysOfWeek.includes(dayOfWeek)) {
      sessionCount++
      const dateStr = currentDate.toISOString().split('T')[0]
      // Create unique ID using scheduleId, date, and sessionCount
      sessions.push({
        id: `${scheduleId}-${dateStr}-${sessionCount}`,
        title: `${titlePrefix} ${String(sessionCount).padStart(2, '0')}`,
        course,
        date: dateStr,
        time,
        duration,
        instructor,
        location,
        capacity,
        enrolled: baseEnrolled + Math.floor(Math.random() * 5),
        type,
        status: 'upcoming',
      })
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return sessions
}

const mockSessions: ScheduleSession[] = [
  // Thời khóa biểu tháng 12/2025 - Dành cho mẹ bầu (Thứ 2, 4, 6 - 09:00)
  ...generateWeeklySchedule(
    'Dành cho mẹ bầu',
    'BUỔI HỌC',
    '2025-12-01',
    '09:00',
    '60 phút',
    'MDPhuong',
    'Phòng học A',
    15,
    8,
    'group',
    [1, 3, 5], // Thứ 2, 4, 6
    10
  ),
  // Dành cho mẹ bầu - Lớp buổi chiều (Thứ 2, 4, 6 - 14:00)
  ...generateWeeklySchedule(
    'Dành cho mẹ bầu',
    'BUỔI HỌC',
    '2025-12-01',
    '14:00',
    '60 phút',
    'Nguyễn Văn A',
    'Phòng học B',
    15,
    6,
    'group',
    [1, 3, 5], // Thứ 2, 4, 6
    10
  ),
  // 0-12 tháng - Lớp buổi sáng (Thứ 3, 5 - 09:30)
  ...generateWeeklySchedule(
    '0-12 tháng',
    'BUỔI HỌC',
    '2025-12-01',
    '09:30',
    '45 phút',
    'Thu Ba Dương',
    'Phòng học C',
    10,
    6,
    'group',
    [2, 4], // Thứ 3, 5
    10
  ),
  // 0-12 tháng - Lớp buổi chiều (Thứ 3, 5 - 15:00)
  ...generateWeeklySchedule(
    '0-12 tháng',
    'BUỔI HỌC',
    '2025-12-01',
    '15:00',
    '45 phút',
    'Nguyễn Văn A',
    'Phòng học C',
    10,
    5,
    'group',
    [2, 4], // Thứ 3, 5
    10
  ),
  // 13-24 tháng - Lớp buổi sáng (Thứ 2, 4, 6 - 10:00)
  ...generateWeeklySchedule(
    '13-24 tháng',
    'BUỔI HỌC',
    '2025-12-01',
    '10:00',
    '50 phút',
    'MDPhuong',
    'Phòng học D',
    12,
    7,
    'group',
    [1, 3, 5], // Thứ 2, 4, 6
    10
  ),
  // 13-24 tháng - Lớp buổi chiều (Thứ 2, 4, 6 - 15:30)
  ...generateWeeklySchedule(
    '13-24 tháng',
    'BUỔI HỌC',
    '2025-12-01',
    '15:30',
    '50 phút',
    'Thu Ba Dương',
    'Phòng học D',
    12,
    8,
    'group',
    [1, 3, 5], // Thứ 2, 4, 6
    10
  ),
]

export default function SchedulePage() {
  const [headerHeight, setHeaderHeight] = useState<string>('104px')
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 11, 1)) // December 2025
  const [popupDate, setPopupDate] = useState<Date | null>(null)

  // Calculate header height
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (typeof window === 'undefined') return

      const header = document.querySelector('header')
      if (header) {
        const actualHeight = header.offsetHeight
        setHeaderHeight(`${actualHeight}px`)
      } else {
        setHeaderHeight(window.innerWidth >= 768 ? '140px' : '104px')
      }
    }

    updateHeaderHeight()

    const handleResize = () => {
      requestAnimationFrame(() => {
        updateHeaderHeight()
      })
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateHeaderHeight)
    } else {
      updateHeaderHeight()
    }

    const timeoutId = setTimeout(updateHeaderHeight, 100)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      }
      document.removeEventListener('DOMContentLoaded', updateHeaderHeight)
      clearTimeout(timeoutId)
    }
  }, [])

  // Calculate endTime from time and duration
  const calculateEndTime = (time: string, duration: string): string => {
    const [hours, minutes] = time.split(':').map(Number)
    const durationMinutes = parseInt(duration.replace(/\D/g, ''))
    const totalMinutes = hours * 60 + minutes + durationMinutes
    const endHours = Math.floor(totalMinutes / 60)
    const endMins = totalMinutes % 60
    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`
  }

  // Update sessions with endTime and status
  const sessionsWithEndTime = mockSessions.map(session => ({
    ...session,
    endTime: calculateEndTime(session.time, session.duration),
    status: session.enrolled >= session.capacity ? 'full' as const : session.status,
  }))

  // Get all unique courses
  const courses = ['all', ...Array.from(new Set(mockSessions.map(s => s.course)))]

  // Filter sessions
  const filteredSessions = sessionsWithEndTime.filter(session => {
    if (selectedCourse !== 'all' && session.course !== selectedCourse) return false
    return true
  })

  // Sort sessions by date and time
  const sortedFilteredSessions = [...filteredSessions].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date)
    if (dateCompare !== 0) return dateCompare
    return a.time.localeCompare(b.time)
  })

  // Get sessions for selected date
  const getSessionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return filteredSessions.filter(s => s.date === dateStr)
  }

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      month: 'long',
      year: 'numeric',
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isSelected = (date: Date | null) => {
    if (!date) return false
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    )
  }

  // Get session color based on status
  const getSessionColor = (status: string) => {
    if (status === 'full') return 'bg-[#F441A5]' // Pink
    return 'bg-blue-600' // Dark blue for available
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const selectedCourseName = selectedCourse === 'all' ? 'TẤT CẢ CÁC GÓI HỌC' : selectedCourse.toUpperCase()

  // Course packages for dropdown
  const coursePackages = [
    { value: 'all', label: 'Tất cả các gói học' },
    { value: 'Dành cho mẹ bầu', label: 'Dành cho mẹ bầu' },
    { value: '0-12 tháng', label: 'Dành cho mẹ có con từ 0 - 12 tháng' },
    { value: '13-24 tháng', label: 'Dành cho mẹ có con từ 13 - 24 tháng' },
    { value: 'trial', label: 'Gói học thử 01 buổi 99k' },
    { value: 'combo', label: 'Gói combo 06 buổi' },
    { value: '3month', label: 'Gói 03 tháng' },
    { value: '6month', label: 'Gói 06 tháng' },
    { value: '12month', label: 'Gói 12 tháng' },
  ]

  return (
    <>
      {/* Main Content */}
      <section className="w-full bg-gray-50 border-b py-4 md:py-6" style={{ marginTop: headerHeight }}>
        <div className="container-custom">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6" style={{ lineHeight: '1.2' }}>
            LỊCH HỌC THEO GÓI
          </h1>

          {/* Layout: Sidebar + Main Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - Filters */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <Card className="p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      CÁC GÓI HỌC
                    </label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {coursePackages.map(pkg => (
                          <SelectItem key={pkg.value} value={pkg.value}>
                            {pkg.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      THÁNG
                    </label>
                    <Select 
                      value={currentMonth.getMonth().toString()} 
                      onValueChange={(value) => {
                        const newDate = new Date(currentMonth)
                        newDate.setMonth(parseInt(value))
                        setCurrentMonth(newDate)
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          Tháng {currentMonth.getMonth() + 1}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            Tháng {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full bg-gray-700 hover:bg-gray-800 text-white">
                    <Search className="h-4 w-4 mr-2" />
                    TÌM
                  </Button>
                </div>
              </Card>
            </div>

            {/* Main Content - Calendar */}
            <div className="flex-1">
              {/* Calendar Title */}
              <div className="mb-4">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                  Lịch học tháng {currentMonth.getMonth() + 1} / {selectedCourseName}
                </h2>
              </div>

              {/* Filters and View Toggle */}
              <div className="mb-4 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                <div className="flex flex-wrap gap-3 items-center">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700 font-medium">Lọc theo:</span>
                  <div className="flex flex-wrap gap-2">
                    {courses.map(course => (
                      <Button
                        key={course}
                        variant={selectedCourse === course ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCourse(course)}
                        className={
                          selectedCourse === course
                            ? 'bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white border-0'
                            : 'border-gray-300 hover:border-[#F441A5]'
                        }
                      >
                        {course === 'all' ? 'Tất cả' : course}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'calendar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('calendar')}
                    className={
                      viewMode === 'calendar'
                        ? 'bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white border-0'
                        : ''
                    }
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Lịch
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={
                      viewMode === 'list'
                        ? 'bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white border-0'
                        : ''
                    }
                  >
                    <List className="h-4 w-4 mr-2" />
                    Danh sách
                  </Button>
                </div>
              </div>

              {/* Calendar View */}
              {viewMode === 'calendar' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-3 md:p-4"
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="border-gray-300 hover:border-[#F441A5]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg md:text-xl font-bold text-gray-900 capitalize">
                  {formatMonthYear(currentMonth)}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="border-gray-300 hover:border-[#F441A5]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-gray-600 py-1"
                  >
                    {day}
                  </div>
                ))}
                {daysInMonth.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />
                  }
                  
                  const sessionsForDate = getSessionsForDate(date)
                  const hasSessions = sessionsForDate.length > 0
                  const uniqueCourses = Array.from(new Set(sessionsForDate.map(s => s.course)))
                  
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => {
                        setSelectedDate(date)
                        if (hasSessions) {
                          setPopupDate(date)
                        }
                      }}
                      className={`
                        aspect-square rounded-md border border-gray-200 transition-all duration-200
                        flex flex-col items-start justify-start p-0.5 relative min-h-[65px]
                        ${isToday(date) ? 'border-[#F441A5] bg-[#F441A5]/10' : 'border-gray-200'}
                        ${isSelected(date) ? 'ring-1 ring-[#F441A5] ring-offset-1' : ''}
                        ${hasSessions ? 'hover:border-[#F441A5] hover:bg-[#F441A5]/5 cursor-pointer' : 'hover:border-gray-300'}
                      `}
                    >
                      <span
                        className={`
                          text-base font-medium absolute top-0.5 right-1
                          ${isToday(date) ? 'text-[#F441A5]' : 'text-gray-700'}
                          ${isSelected(date) ? 'font-bold' : ''}
                        `}
                      >
                        {date.getDate()}
                      </span>
                      {hasSessions && (
                        <div className="w-full flex flex-col items-start justify-start gap-0.5 mt-1 px-0.5">
                          {sessionsForDate.map((session, idx) => {
                            const isFull = session.enrolled >= session.capacity
                            return (
                              <div
                                key={session.id}
                                className="flex items-center gap-1.5 w-full"
                              >
                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getSessionColor(session.status)}`} />
                                <span className="text-xs text-gray-700 leading-tight">
                                  {session.time}-{session.endTime}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#F441A5]" />
                  <span className="text-gray-700">Lớp full</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="text-gray-700">Còn trống</span>
                </div>
              </div>

            </motion.div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {sortedFilteredSessions.length > 0 ? (
                sortedFilteredSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-2 border-gray-200 hover:border-[#F441A5] transition-all duration-200 hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Date & Time */}
                        <div className="flex-shrink-0">
                          <div className="bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white rounded-xl p-4 text-center min-w-[100px]">
                            <div className="text-2xl font-bold">
                              {new Date(session.date).getDate()}
                            </div>
                            <div className="text-sm opacity-90">
                              {new Date(session.date).toLocaleDateString('vi-VN', { month: 'short' })}
                            </div>
                            <div className="text-xs mt-1 opacity-75">
                              {session.time}
                            </div>
                          </div>
                        </div>

                        {/* Session Info */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-start gap-2 mb-2">
                            <Badge className="bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white">
                              {session.course}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                session.status === 'upcoming'
                                  ? 'border-green-500 text-green-600'
                                  : session.status === 'ongoing'
                                  ? 'border-blue-500 text-blue-600'
                                  : 'border-gray-400 text-gray-600'
                              }
                            >
                              {session.status === 'upcoming'
                                ? 'Sắp diễn ra'
                                : session.status === 'ongoing'
                                ? 'Đang diễn ra'
                                : 'Đã hoàn thành'}
                            </Badge>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3" style={{ lineHeight: '1.2' }}>
                            {session.title}
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-[#F441A5]" />
                              <span>{session.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-[#F441A5]" />
                              <span>{session.instructor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[#F441A5]" />
                              <span>{session.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-[#F441A5]" />
                              <span>{session.enrolled}/{session.capacity}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex-shrink-0">
                          <Button
                            className="btn-gradient-pink"
                            size="lg"
                          >
                            Đăng ký
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 text-lg">Không có lớp học nào phù hợp với bộ lọc</p>
                </div>
              )}
            </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Session Detail Popup */}
      <Dialog open={popupDate !== null} onOpenChange={(open) => !open && setPopupDate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-bold text-gray-900" style={{ lineHeight: '1.2' }}>
              Lớp học ngày {popupDate ? formatDate(popupDate) : ''}
            </DialogTitle>
          </DialogHeader>
          
          {popupDate && getSessionsForDate(popupDate).length > 0 && (
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {getSessionsForDate(popupDate).map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-2 border-gray-200 hover:border-[#F441A5] transition-all duration-200 hover:shadow-lg">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className="bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white">
                          {session.course}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            session.status === 'upcoming'
                              ? 'border-green-500 text-green-600'
                              : session.status === 'ongoing'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-gray-400 text-gray-600'
                          }
                        >
                          {session.status === 'upcoming'
                            ? 'Sắp diễn ra'
                            : session.status === 'ongoing'
                            ? 'Đang diễn ra'
                            : 'Đã hoàn thành'}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-gray-900 mb-3" style={{ lineHeight: '1.2' }}>
                        {session.title}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#F441A5] shrink-0" />
                          <span>{session.time} - {session.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#F441A5] shrink-0" />
                          <span>Giảng viên: {session.instructor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#F441A5] shrink-0" />
                          <span>{session.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-[#F441A5] shrink-0" />
                          <span>
                            {session.enrolled}/{session.capacity} học viên đã đăng ký
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#F441A5] shrink-0" />
                          <span>Hình thức: {session.type === 'group' ? 'Học nhóm' : 'Học 1-1'}</span>
                        </div>
                      </div>
                      <Button
                        className="btn-gradient-pink w-full"
                        size="lg"
                      >
                        Đăng ký ngay
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
          
          {popupDate && getSessionsForDate(popupDate).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Không có lớp học nào vào ngày này</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

