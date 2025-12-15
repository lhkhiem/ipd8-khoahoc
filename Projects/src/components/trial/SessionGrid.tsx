'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Calendar as CalendarIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SessionCard, Session } from './SessionCard'

interface SessionGridProps {
  sessions: Session[]
  onRegister: (session: Session) => void
}

export function SessionGrid({ sessions, onRegister }: SessionGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState<string>('all')
  const [selectedInstructor, setSelectedInstructor] = useState<string>('all')

  // Get unique instructors
  const instructors = useMemo(() => {
    const unique = new Set(sessions.map(s => s.instructor.name))
    return Array.from(unique)
  }, [sessions])

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch = 
        session.instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.location?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDate = selectedDate === 'all' || session.date === selectedDate
      const matchesInstructor = selectedInstructor === 'all' || session.instructor.name === selectedInstructor

      return matchesSearch && matchesDate && matchesInstructor
    })
  }, [sessions, searchQuery, selectedDate, selectedInstructor])

  // Get unique dates
  const dates = useMemo(() => {
    const unique = new Set(sessions.map(s => s.date))
    return Array.from(unique).sort()
  }, [sessions])

  return (
    <div className="space-y-8 w-full overflow-x-hidden">
      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-md p-6 w-full overflow-x-hidden">
        <div className="flex flex-col md:flex-row gap-4 w-full min-w-0">
          {/* Search */}
          <div className="flex-1 relative min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo giảng viên, địa điểm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-gray-200 focus:border-[#F441A5] rounded-xl"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#F441A5] focus:outline-none appearance-none bg-white"
            >
              <option value="all">Tất cả ngày</option>
              {dates.map(date => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('vi-VN')}
                </option>
              ))}
            </select>
          </div>

          {/* Instructor Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
            <select
              value={selectedInstructor}
              onChange={(e) => setSelectedInstructor(e.target.value)}
              className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#F441A5] focus:outline-none appearance-none bg-white"
            >
              <option value="all">Tất cả giảng viên</option>
              {instructors.map(instructor => (
                <option key={instructor} value={instructor}>
                  {instructor}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Tìm thấy <span className="font-semibold text-[#F441A5]">{filteredSessions.length}</span> buổi học
        </div>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-2 md:px-0">
          {filteredSessions.map((session, index) => (
            <SessionCard
              key={session.id}
              session={session}
              onRegister={onRegister}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl shadow-md">
          <p className="text-gray-600 mb-4">Không tìm thấy buổi học nào phù hợp</p>
          <Button
            onClick={() => {
              setSearchQuery('')
              setSelectedDate('all')
              setSelectedInstructor('all')
            }}
            variant="outline"
            className="border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white"
          >
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </div>
  )
}

