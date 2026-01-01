'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { 
  User, 
  BookOpen, 
  Calendar, 
  TrendingUp,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  Clock,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Save,
  Phone,
  Mail,
  CheckCircle,
  Circle,
  AlertCircle,
  FileText,
  MessageSquare,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ROUTES } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import { safeWindowOpen } from '@/lib/security'

interface MenuItem {
  id: string
  name: string
  icon: React.ElementType
}

const menuItems: MenuItem[] = [
  { id: 'profile', name: 'Thông tin cá nhân', icon: User },
  { id: 'packages', name: 'Gói học của tôi', icon: BookOpen },
  { id: 'schedule', name: 'Lịch học', icon: Calendar },
  { id: 'progress', name: 'Tiến độ học', icon: TrendingUp },
  { id: 'payment', name: 'Thanh toán & Gói học', icon: CreditCard },
  { id: 'notifications', name: 'Thông báo', icon: Bell },
  { id: 'support', name: 'Hỗ trợ', icon: HelpCircle },
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

// Mock schedule session interface
interface ScheduleSession {
  id: string
  title: string
  course: string
  date: string
  time: string
  endTime?: string
  duration: string
  instructor: string
  location: string
  capacity: number
  enrolled: number
  type: 'group' | 'one-on-one'
  status: 'upcoming' | 'ongoing' | 'completed' | 'full'
  meetingLink?: string
  meetingType?: 'google-meet' | 'zoom'
}

// Mock purchased courses - user has purchased these courses
const purchasedCourses = ['Dành cho mẹ bầu', '0-12 tháng']

// Mock progress data
interface CourseProgress {
  id: string
  courseName: string
  totalSessions: number
  completedSessions: number
  progress: number
  status: 'in-progress' | 'completed' | 'not-started'
  lastActivity?: string
}

const mockProgress: CourseProgress[] = [
  {
    id: '1',
    courseName: 'Dành cho mẹ bầu',
    totalSessions: 20,
    completedSessions: 12,
    progress: 60,
    status: 'in-progress',
    lastActivity: '2025-01-15'
  },
  {
    id: '2',
    courseName: 'Dành cho mẹ có con từ 0-12 tháng',
    totalSessions: 15,
    completedSessions: 8,
    progress: 53,
    status: 'in-progress',
    lastActivity: '2025-01-14'
  },
  {
    id: '3',
    courseName: 'Gói học thử 01 buổi 99K',
    totalSessions: 1,
    completedSessions: 1,
    progress: 100,
    status: 'completed',
    lastActivity: '2025-01-10'
  }
]

// Mock payment data
interface PaymentRecord {
  id: string
  packageName: string
  amount: number
  paymentDate: string
  status: 'paid' | 'pending' | 'failed'
  paymentMethod: string
  invoiceNumber: string
}

const mockPayments: PaymentRecord[] = [
  {
    id: '1',
    packageName: 'Dành cho mẹ bầu',
    amount: 5000000,
    paymentDate: '2025-01-20',
    status: 'paid',
    paymentMethod: 'ZaloPay',
    invoiceNumber: 'INV-2025-001'
  },
  {
    id: '2',
    packageName: 'Dành cho mẹ có con từ 0-12 tháng',
    amount: 3500000,
    paymentDate: '2025-01-18',
    status: 'paid',
    paymentMethod: 'VNPay',
    invoiceNumber: 'INV-2025-002'
  },
  {
    id: '3',
    packageName: 'Gói học thử 01 buổi 99K',
    amount: 99000,
    paymentDate: '2025-01-15',
    status: 'paid',
    paymentMethod: 'ZaloPay',
    invoiceNumber: 'INV-2025-003'
  },
  {
    id: '4',
    packageName: 'Gói combo 06 buổi',
    amount: 2500000,
    paymentDate: '2025-01-12',
    status: 'paid',
    paymentMethod: 'MoMo',
    invoiceNumber: 'INV-2025-004'
  },
  {
    id: '5',
    packageName: 'Dành cho mẹ có con từ 13-24 tháng',
    amount: 4200000,
    paymentDate: '2025-01-10',
    status: 'paid',
    paymentMethod: 'VNPay',
    invoiceNumber: 'INV-2025-005'
  },
  {
    id: '6',
    packageName: 'Gói 03 tháng',
    amount: 8000000,
    paymentDate: '2025-01-08',
    status: 'paid',
    paymentMethod: 'ZaloPay',
    invoiceNumber: 'INV-2025-006'
  },
  {
    id: '7',
    packageName: 'Gói học thử 01 buổi 99K',
    amount: 99000,
    paymentDate: '2025-01-05',
    status: 'paid',
    paymentMethod: 'VNPay',
    invoiceNumber: 'INV-2025-007'
  },
  {
    id: '8',
    packageName: 'Dành cho mẹ bầu',
    amount: 5000000,
    paymentDate: '2024-12-28',
    status: 'paid',
    paymentMethod: 'ZaloPay',
    invoiceNumber: 'INV-2024-120'
  },
  {
    id: '9',
    packageName: 'Gói combo 06 buổi',
    amount: 2500000,
    paymentDate: '2024-12-25',
    status: 'paid',
    paymentMethod: 'MoMo',
    invoiceNumber: 'INV-2024-119'
  },
  {
    id: '10',
    packageName: 'Dành cho mẹ có con từ 0-12 tháng',
    amount: 3500000,
    paymentDate: '2024-12-20',
    status: 'paid',
    paymentMethod: 'VNPay',
    invoiceNumber: 'INV-2024-118'
  },
  {
    id: '11',
    packageName: 'Gói 06 tháng',
    amount: 15000000,
    paymentDate: '2024-12-15',
    status: 'paid',
    paymentMethod: 'ZaloPay',
    invoiceNumber: 'INV-2024-117'
  },
  {
    id: '12',
    packageName: 'Gói học thử 01 buổi 99K',
    amount: 99000,
    paymentDate: '2024-12-10',
    status: 'paid',
    paymentMethod: 'VNPay',
    invoiceNumber: 'INV-2024-116'
  },
  {
    id: '13',
    packageName: 'Dành cho mẹ có con từ 13-24 tháng',
    amount: 4200000,
    paymentDate: '2024-12-05',
    status: 'paid',
    paymentMethod: 'MoMo',
    invoiceNumber: 'INV-2024-115'
  },
  {
    id: '14',
    packageName: 'Gói 03 tháng',
    amount: 8000000,
    paymentDate: '2024-11-28',
    status: 'paid',
    paymentMethod: 'ZaloPay',
    invoiceNumber: 'INV-2024-114'
  },
  {
    id: '15',
    packageName: 'Gói combo 06 buổi',
    amount: 2500000,
    paymentDate: '2024-11-25',
    status: 'pending',
    paymentMethod: 'VNPay',
    invoiceNumber: 'INV-2024-113'
  }
]

// Mock notifications data
interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  date: string
  time: string
  isRead: boolean
  link?: string
}

// Helper function to get date string N days ago
const getDateDaysAgo = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Buổi học sắp tới',
    message: 'Bạn có buổi học "BUỔI HỌC 01" vào ngày 20/01/2025 lúc 09:00',
    type: 'info',
    date: getDateDaysAgo(0),
    time: '08:30',
    isRead: false,
    link: '/dashboard/schedule'
  },
  {
    id: '2',
    title: 'Thanh toán thành công',
    message: 'Thanh toán cho gói "Dành cho mẹ bầu" đã được xác nhận',
    type: 'success',
    date: getDateDaysAgo(1),
    time: '14:20',
    isRead: false,
    link: '/dashboard/payment'
  },
  {
    id: '3',
    title: 'Tài liệu mới',
    message: 'Tài liệu "Hướng dẫn chăm sóc trẻ sơ sinh" đã được cập nhật',
    type: 'info',
    date: getDateDaysAgo(2),
    time: '10:15',
    isRead: true,
    link: '/dashboard'
  },
  {
    id: '4',
    title: 'Nhắc nhở lịch học',
    message: 'Đừng quên buổi học "BUỔI HỌC 02" vào ngày 18/01/2025',
    type: 'warning',
    date: getDateDaysAgo(3),
    time: '09:00',
    isRead: false,
    link: '/dashboard/schedule'
  },
  {
    id: '5',
    title: 'Hoàn thành khóa học',
    message: 'Chúc mừng bạn đã hoàn thành khóa học "Gói học thử 01 buổi 99K"',
    type: 'success',
    date: getDateDaysAgo(4),
    time: '16:45',
    isRead: true,
    link: '/dashboard/progress'
  },
  {
    id: '6',
    title: 'Bài tập mới',
    message: 'Bạn có bài tập mới trong khóa "Dành cho mẹ bầu"',
    type: 'info',
    date: getDateDaysAgo(5),
    time: '11:30',
    isRead: false,
    link: '/dashboard/progress'
  },
  {
    id: '7',
    title: 'Đánh giá khóa học',
    message: 'Vui lòng đánh giá khóa học "Dành cho mẹ có con từ 0-12 tháng"',
    type: 'info',
    date: getDateDaysAgo(6),
    time: '15:20',
    isRead: true,
    link: '/dashboard'
  },
  {
    id: '8',
    title: 'Lịch học thay đổi',
    message: 'Buổi học "BUỔI HỌC 03" đã được chuyển sang ngày 25/01/2025',
    type: 'warning',
    date: getDateDaysAgo(7),
    time: '09:15',
    isRead: false,
    link: '/dashboard/schedule'
  },
  {
    id: '9',
    title: 'Thanh toán thành công',
    message: 'Thanh toán cho gói "Gói combo 06 buổi" đã được xác nhận',
    type: 'success',
    date: getDateDaysAgo(8),
    time: '13:45',
    isRead: true,
    link: '/dashboard/payment'
  },
  {
    id: '10',
    title: 'Video mới',
    message: 'Video "Chăm sóc trẻ sơ sinh tuần đầu" đã được thêm vào khóa học',
    type: 'info',
    date: getDateDaysAgo(9),
    time: '10:00',
    isRead: true,
    link: '/dashboard'
  },
  {
    id: '11',
    title: 'Nhắc nhở thanh toán',
    message: 'Gói học của bạn sắp hết hạn, vui lòng gia hạn',
    type: 'warning',
    date: getDateDaysAgo(10),
    time: '14:30',
    isRead: false,
    link: '/dashboard/payment'
  },
  {
    id: '12',
    title: 'Chứng chỉ hoàn thành',
    message: 'Chứng chỉ khóa học "Dành cho mẹ bầu" đã sẵn sàng để tải xuống',
    type: 'success',
    date: getDateDaysAgo(11),
    time: '16:00',
    isRead: true,
    link: '/dashboard/progress'
  },
  {
    id: '13',
    title: 'Buổi học bị hủy',
    message: 'Buổi học "BUỔI HỌC 04" vào ngày 15/01/2025 đã bị hủy',
    type: 'error',
    date: getDateDaysAgo(12),
    time: '08:00',
    isRead: false,
    link: '/dashboard/schedule'
  },
  {
    id: '14',
    title: 'Tài liệu mới',
    message: 'Tài liệu "Dinh dưỡng cho mẹ bầu" đã được cập nhật',
    type: 'info',
    date: getDateDaysAgo(13),
    time: '11:20',
    isRead: true,
    link: '/dashboard'
  },
  {
    id: '15',
    title: 'Thanh toán thành công',
    message: 'Thanh toán cho gói "Gói 03 tháng" đã được xác nhận',
    type: 'success',
    date: getDateDaysAgo(14),
    time: '15:10',
    isRead: true,
    link: '/dashboard/payment'
  },
  {
    id: '16',
    title: 'Nhắc nhở lịch học',
    message: 'Đừng quên buổi học "BUỔI HỌC 05" vào ngày 12/01/2025',
    type: 'warning',
    date: getDateDaysAgo(15),
    time: '09:30',
    isRead: true,
    link: '/dashboard/schedule'
  },
  {
    id: '17',
    title: 'Bài viết mới',
    message: 'Bài viết "10 điều cần biết khi mang thai" đã được đăng',
    type: 'info',
    date: getDateDaysAgo(16),
    time: '10:45',
    isRead: true,
    link: '/dashboard'
  },
  {
    id: '18',
    title: 'Hoàn thành bài tập',
    message: 'Bạn đã hoàn thành bài tập "Chăm sóc trẻ sơ sinh"',
    type: 'success',
    date: getDateDaysAgo(17),
    time: '14:00',
    isRead: true,
    link: '/dashboard/progress'
  },
  {
    id: '19',
    title: 'Thanh toán thất bại',
    message: 'Thanh toán cho gói "Gói học thử 01 buổi 99K" không thành công',
    type: 'error',
    date: getDateDaysAgo(18),
    time: '12:15',
    isRead: false,
    link: '/dashboard/payment'
  },
  {
    id: '20',
    title: 'Video mới',
    message: 'Video "Massage cho trẻ sơ sinh" đã được thêm vào khóa học',
    type: 'info',
    date: getDateDaysAgo(19),
    time: '11:00',
    isRead: true,
    link: '/dashboard'
  },
  {
    id: '21',
    title: 'Nhắc nhở lịch học',
    message: 'Đừng quên buổi học "BUỔI HỌC 06" vào ngày 10/01/2025',
    type: 'warning',
    date: getDateDaysAgo(20),
    time: '08:45',
    isRead: true,
    link: '/dashboard/schedule'
  },
  {
    id: '22',
    title: 'Thanh toán thành công',
    message: 'Thanh toán cho gói "Dành cho mẹ có con từ 13-24 tháng" đã được xác nhận',
    type: 'success',
    date: getDateDaysAgo(21),
    time: '13:20',
    isRead: true,
    link: '/dashboard/payment'
  },
  {
    id: '23',
    title: 'Tài liệu mới',
    message: 'Tài liệu "Phát triển kỹ năng vận động cho trẻ" đã được cập nhật',
    type: 'info',
    date: getDateDaysAgo(22),
    time: '10:30',
    isRead: true,
    link: '/dashboard'
  },
  {
    id: '24',
    title: 'Buổi học sắp tới',
    message: 'Bạn có buổi học "BUỔI HỌC 07" vào ngày 08/01/2025 lúc 14:00',
    type: 'info',
    date: getDateDaysAgo(23),
    time: '13:00',
    isRead: true,
    link: '/dashboard/schedule'
  },
  {
    id: '25',
    title: 'Hoàn thành khóa học',
    message: 'Chúc mừng bạn đã hoàn thành khóa học "Gói combo 06 buổi"',
    type: 'success',
    date: getDateDaysAgo(24),
    time: '17:30',
    isRead: true,
    link: '/dashboard/progress'
  },
  {
    id: '26',
    title: 'Thanh toán thành công',
    message: 'Thanh toán cho gói "Gói 06 tháng" đã được xác nhận',
    type: 'success',
    date: getDateDaysAgo(25),
    time: '15:45',
    isRead: true,
    link: '/dashboard/payment'
  },
  {
    id: '27',
    title: 'Nhắc nhở lịch học',
    message: 'Đừng quên buổi học "BUỔI HỌC 08" vào ngày 06/01/2025',
    type: 'warning',
    date: getDateDaysAgo(26),
    time: '09:15',
    isRead: true,
    link: '/dashboard/schedule'
  },
  {
    id: '28',
    title: 'Video mới',
    message: 'Video "Tập cho trẻ ăn dặm" đã được thêm vào khóa học',
    type: 'info',
    date: getDateDaysAgo(27),
    time: '11:30',
    isRead: true,
    link: '/dashboard'
  },
  {
    id: '29',
    title: 'Thanh toán thành công',
    message: 'Thanh toán cho gói "Dành cho mẹ bầu" đã được xác nhận',
    type: 'success',
    date: getDateDaysAgo(28),
    time: '14:00',
    isRead: true,
    link: '/dashboard/payment'
  },
  {
    id: '30',
    title: 'Tài liệu mới',
    message: 'Tài liệu "Chăm sóc sức khỏe mẹ sau sinh" đã được cập nhật',
    type: 'info',
    date: getDateDaysAgo(29),
    time: '10:00',
    isRead: true,
    link: '/dashboard'
  }
]

// Mock schedule data - October 2025 for trial package
const mockUserSessions: ScheduleSession[] = [
  // October 6 - Multiple sessions
  {
    id: '1',
    title: 'BUỔI HỌC 01',
    course: 'Gói học thử 01 buổi 99K',
    date: '2025-10-06',
    time: '09:00',
    endTime: '11:00',
    duration: '120 phút',
    instructor: 'MDPhuong',
    location: 'Phòng học A',
    capacity: 15,
    enrolled: 15, // Full
    type: 'group',
    status: 'upcoming',
  },
  {
    id: '2',
    title: 'BUỔI HỌC 02',
    course: 'Gói học thử 01 buổi 99K',
    date: '2025-10-06',
    time: '13:00',
    endTime: '14:00',
    duration: '60 phút',
    instructor: 'MDPhuong',
    location: 'Phòng học A',
    capacity: 15,
    enrolled: 8, // Available
    type: 'group',
    status: 'upcoming',
  },
  {
    id: '3',
    title: 'BUỔI HỌC 03',
    course: 'Gói học thử 01 buổi 99K',
    date: '2025-10-06',
    time: '15:00',
    endTime: '16:00',
    duration: '60 phút',
    instructor: 'Thu Ba Dương',
    location: 'Phòng học C',
    capacity: 10,
    enrolled: 5, // Available
    type: 'group',
    status: 'upcoming',
  },
  {
    id: '4',
    title: 'BUỔI HỌC 04',
    course: 'Gói học thử 01 buổi 99K',
    date: '2025-10-06',
    time: '19:00',
    endTime: '20:00',
    duration: '60 phút',
    instructor: 'MDPhuong',
    location: 'Phòng học A',
    capacity: 15,
    enrolled: 12, // Available
    type: 'group',
    status: 'upcoming',
  },
  // October 8
  {
    id: '5',
    title: 'BUỔI HỌC 01',
    course: 'Gói học thử 01 buổi 99K',
    date: '2025-10-08',
    time: '09:00',
    endTime: '11:00',
    duration: '120 phút',
    instructor: 'MDPhuong',
    location: 'Phòng học A',
    capacity: 15,
    enrolled: 10, // Available
    type: 'group',
    status: 'upcoming',
  },
  {
    id: '6',
    title: 'BUỔI HỌC 02',
    course: 'Gói học thử 01 buổi 99K',
    date: '2025-10-08',
    time: '13:00',
    endTime: '14:00',
    duration: '60 phút',
    instructor: 'MDPhuong',
    location: 'Phòng học A',
    capacity: 15,
    enrolled: 15, // Full
    type: 'group',
    status: 'upcoming',
  },
  {
    id: '7',
    title: 'BUỔI HỌC 03',
    course: 'Gói học thử 01 buổi 99K',
    date: '2025-10-08',
    time: '15:00',
    endTime: '16:00',
    duration: '60 phút',
    instructor: 'Thu Ba Dương',
    location: 'Phòng học C',
    capacity: 10,
    enrolled: 6, // Available
    type: 'group',
    status: 'upcoming',
  },
  {
    id: '8',
    title: 'BUỔI HỌC 04',
    course: 'Gói học thử 01 buổi 99K',
    date: '2025-10-08',
    time: '19:00',
    endTime: '20:00',
    duration: '60 phút',
    instructor: 'MDPhuong',
    location: 'Phòng học A',
    capacity: 15,
    enrolled: 11, // Available
    type: 'group',
    status: 'upcoming',
  },
  // October 9
  {
    id: '9',
    title: 'BUỔI HỌC 01',
    course: 'Gói học thử 01 buổi 99K',
    date: '2025-10-09',
    time: '09:00',
    endTime: '11:00',
    duration: '120 phút',
    instructor: 'MDPhuong',
    location: 'Phòng học A',
    capacity: 15,
    enrolled: 9, // Available
    type: 'group',
    status: 'upcoming',
  },
  {
    id: '10',
    title: 'BUỔI HỌC 02',
    course: 'Gói học thử 01 buổi 99K',
    date: '2025-10-09',
    time: '13:00',
    endTime: '14:00',
    duration: '60 phút',
    instructor: 'Thu Ba Dương',
    location: 'Phòng học C',
    capacity: 10,
    enrolled: 7, // Available
    type: 'group',
    status: 'upcoming',
  },
  {
    id: '11',
    title: 'BUỔI HỌC 03',
    course: 'Gói học thử 01 buổi 99K',
    date: '2025-10-09',
    time: '15:00',
    endTime: '16:00',
    duration: '60 phút',
    instructor: 'MDPhuong',
    location: 'Phòng học A',
    capacity: 15,
    enrolled: 15, // Full
    type: 'group',
    status: 'upcoming',
  },
  {
    id: '12',
    title: 'BUỔI HỌC 04',
    course: 'Gói học thử 01 buổi 99K',
    date: '2025-10-09',
    time: '19:00',
    endTime: '20:00',
    duration: '60 phút',
    instructor: 'MDPhuong',
    location: 'Phòng học A',
    capacity: 15,
    enrolled: 10, // Available
    type: 'group',
    status: 'upcoming',
  },
  // October 10
  {
    id: '13',
    title: 'BUỔI HỌC 01',
    course: 'Gói học thử 01 buổi 99K',
    date: '2025-10-10',
    time: '09:00',
    endTime: '11:00',
    duration: '120 phút',
    instructor: 'MDPhuong',
    location: 'Phòng học A',
    capacity: 15,
    enrolled: 8, // Available
    type: 'group',
    status: 'upcoming',
  },
  {
    id: '14',
    title: 'BUỔI HỌC 02',
    course: 'Gói học thử 01 buổi 99K',
    date: '2025-10-10',
    time: '13:00',
    endTime: '14:00',
    duration: '60 phút',
    instructor: 'Thu Ba Dương',
    location: 'Phòng học C',
    capacity: 10,
    enrolled: 5, // Available
    type: 'group',
    status: 'upcoming',
  },
  {
    id: '15',
    title: 'BUỔI HỌC 03',
    course: 'Gói học thử 01 buổi 99K',
    date: '2025-10-10',
    time: '15:00',
    endTime: '16:00',
    duration: '60 phút',
    instructor: 'MDPhuong',
    location: 'Phòng học A',
    capacity: 15,
    enrolled: 12, // Available
    type: 'group',
    status: 'upcoming',
  },
  {
    id: '16',
    title: 'BUỔI HỌC 04',
    course: 'Gói học thử 01 buổi 99K',
    date: '2025-10-10',
    time: '19:00',
    endTime: '20:00',
    duration: '60 phút',
    instructor: 'MDPhuong',
    location: 'Phòng học A',
    capacity: 15,
    enrolled: 15, // Full
    type: 'group',
    status: 'upcoming',
  },
]

// Mock course packages for slider
const mockCoursePackages = [
  {
    id: 1,
    title: 'GÓI HỌC THỬ 1 BUỔI 99K',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop',
    description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed',
    duration: '60 phút',
    instructor: 'Nguyễn Văn A - Trường ĐH Y Dược',
    benefitsForMother: 'Chăm sóc sức khỏe thai kỳ, Dinh dưỡng hợp lý',
    benefitsForBaby: 'Phát triển toàn diện, Tăng cường miễn dịch',
  },
  {
    id: 2,
    title: 'DÀNH CHO MẸ BẦU',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
    description: 'Chương trình toàn diện cho mẹ bầu',
    duration: '20 buổi',
    instructor: 'Nguyễn Văn A - Trường ĐH Y Dược',
    benefitsForMother: 'Chăm sóc sức khỏe, Tư vấn dinh dưỡng',
    benefitsForBaby: 'Phát triển trí tuệ, Tăng cường thể chất',
  },
  {
    id: 3,
    title: 'DÀNH CHO MẸ CÓ CON TỪ 0-12 THÁNG',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&h=600&fit=crop',
    description: 'Chương trình chuyên sâu cho trẻ sơ sinh',
    duration: '15 buổi',
    instructor: 'Thu Ba Dương - Chuyên gia IPD8',
    benefitsForMother: 'Kiến thức nuôi dạy, Chăm sóc trẻ',
    benefitsForBaby: 'Phát triển vận động, Kỹ năng xã hội',
  },
]

// Mock documents
const mockDocuments = [
  {
    id: 1,
    title: 'Gói học thử 1 buổi 99k',
    type: 'PDF',
    size: '2.5 MB',
    downloadUrl: '#'
  },
  {
    id: 2,
    title: 'Tài liệu dinh dưỡng cho mẹ bầu',
    type: 'PDF',
    size: '1.8 MB',
    downloadUrl: '#'
  },
  {
    id: 3,
    title: 'Hướng dẫn chăm sóc trẻ sơ sinh',
    type: 'PDF',
    size: '3.2 MB',
    downloadUrl: '#'
  },
]

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState('packages')
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 9, 1)) // October 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSession, setSelectedSession] = useState<ScheduleSession | null>(null)
  const [selectedDateSessions, setSelectedDateSessions] = useState<ScheduleSession[]>([])
  
  // Schedule filter states
  const [selectedPackage, setSelectedPackage] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState('10')
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set())
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    username: user?.name || 'xxx xxx',
    email: user?.email || 'xxx xxxx@gmail.com',
    phone: user?.phone || '*******39',
    address: 'xxx xxx xxx xxx xxx xx',
    gender: '',
    birthDate: '**/**/1988',
    avatar: null as File | null
  })
  
  // Children and pregnancy info state
  interface ChildInfo {
    id: string
    name: string
    birthDate: string
    age: string // e.g., "6 tháng", "2 tuổi"
  }
  
  const [children, setChildren] = useState<ChildInfo[]>([])
  const [dueDate, setDueDate] = useState<string>('')
  const [pregnancyWeeks, setPregnancyWeeks] = useState<number | null>(null)
  const [showAddChildForm, setShowAddChildForm] = useState(false)
  const [newChild, setNewChild] = useState({ name: '', birthDate: '' })
  
  // Load registration info from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDueDate = localStorage.getItem('userDueDate')
      const savedMotherType = localStorage.getItem('userMotherType')
      const savedChildAge = localStorage.getItem('userChildAge')
      
      // Load dueDate if exists
      if (savedDueDate) {
        setDueDate(savedDueDate)
      }
      
      // If registered as mom with child age, create initial child
      if (savedMotherType === 'mom' && savedChildAge && children.length === 0) {
        const childAgeMonths = parseInt(savedChildAge)
        const today = new Date()
        const birthDate = new Date(today.getFullYear(), today.getMonth() - childAgeMonths, today.getDate())
        const ageText = childAgeMonths < 12 
          ? `${childAgeMonths} tháng` 
          : `${Math.floor(childAgeMonths / 12)} tuổi ${childAgeMonths % 12} tháng`
        
        const initialChild: ChildInfo = {
          id: 'initial-child',
          name: 'Con của bạn',
          birthDate: birthDate.toISOString().split('T')[0],
          age: ageText
        }
        setChildren([initialChild])
      }
    }
  }, [])
  
  // Save dueDate to localStorage when changed
  useEffect(() => {
    if (dueDate && typeof window !== 'undefined') {
      localStorage.setItem('userDueDate', dueDate)
    }
  }, [dueDate])
  
  // Calculate pregnancy weeks from due date
  const calculatePregnancyWeeks = (dueDateStr: string) => {
    if (!dueDateStr) return null
    const dueDate = new Date(dueDateStr)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const weeks = Math.floor((280 - diffDays) / 7) // 280 days = 40 weeks full term
    return weeks > 0 && weeks <= 40 ? weeks : null
  }
  
  useEffect(() => {
    if (dueDate) {
      const weeks = calculatePregnancyWeeks(dueDate)
      setPregnancyWeeks(weeks)
    } else {
      setPregnancyWeeks(null)
    }
  }, [dueDate])
  
  const handleAddChild = () => {
    if (newChild.name && newChild.birthDate) {
      const birthDate = new Date(newChild.birthDate)
      const today = new Date()
      const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
      const ageText = ageInMonths < 12 
        ? `${ageInMonths} tháng` 
        : `${Math.floor(ageInMonths / 12)} tuổi ${ageInMonths % 12} tháng`
      
      const child: ChildInfo = {
        id: Date.now().toString(),
        name: newChild.name,
        birthDate: newChild.birthDate,
        age: ageText
      }
      setChildren([...children, child])
      setNewChild({ name: '', birthDate: '' })
      setShowAddChildForm(false)
    }
  }
  
  const handleDeleteChild = (id: string) => {
    setChildren(children.filter(c => c.id !== id))
  }
  
  // Support form state
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: '',
    category: 'general'
  })
  const [supportSubmitted, setSupportSubmitted] = useState(false)
  
  // Payment pagination state
  const [paymentPage, setPaymentPage] = useState(1)
  const paymentsPerPage = 10
  
  // Notification pagination state
  const [notificationPage, setNotificationPage] = useState(1)
  const notificationsPerPage = 10

  const handleLogout = () => {
    logout()
  }

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileData(prev => ({ ...prev, avatar: file }))
    }
  }

  const handleSaveProfile = () => {
    // Save profile logic
    console.log('Saving profile:', profileData)
  }

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getSessionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return mockUserSessions.filter(s => s.date === dateStr)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Get color for each course
  const getCourseColor = (courseName: string) => {
    const colors = [
      '#F441A5', // Pink
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Amber
      '#8B5CF6', // Purple
      '#EF4444', // Red
      '#06B6D4', // Cyan
      '#F97316', // Orange
    ]
    let hash = 0
    for (let i = 0; i < courseName.length; i++) {
      hash = courseName.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const renderContent = () => {
    switch (activeMenu) {
      case 'profile':
        return (
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Form */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label htmlFor="username">Tên đăng nhập</Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => handleProfileChange('username', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label htmlFor="email">Email</Label>
                        <button className="text-sm text-[#F441A5] hover:underline">Cập nhật</button>
                      </div>
                      <Input
                        id="email"
                        value={profileData.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <button className="text-sm text-[#F441A5] hover:underline">Cập nhật</button>
                      </div>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) => handleProfileChange('address', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label>Giới tính</Label>
                      <RadioGroup
                        value={profileData.gender}
                        onValueChange={(value) => handleProfileChange('gender', value)}
                        className="flex gap-6 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male" className="cursor-pointer">Nam</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female" className="cursor-pointer">Nữ</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div>
                      <Label htmlFor="birthDate">Ngày sinh</Label>
                      <Input
                        id="birthDate"
                        value={profileData.birthDate}
                        onChange={(e) => handleProfileChange('birthDate', e.target.value)}
                        className="mt-1"
                        placeholder="DD/MM/YYYY"
                      />
                    </div>
                    
                    <Button
                      onClick={handleSaveProfile}
                      className="btn-gradient-pink w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      LƯU
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Children and Pregnancy Info Block */}
                <Card className="mt-6">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {dueDate ? 'Thông tin thai kỳ' : children.length > 0 ? 'Thông tin con' : 'Thông tin con và thai kỳ'}
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Ngày dự sinh và tuổi thai - Hiển thị nếu đang mang thai */}
                      {dueDate && (
                        <div className="p-4 bg-[#F441A5]/10 rounded-lg border border-[#F441A5]/20">
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-sm font-medium text-gray-700">Ngày dự sinh</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDueDate('')
                                if (typeof window !== 'undefined') {
                                  localStorage.removeItem('userDueDate')
                                }
                              }}
                              className="text-red-500 hover:text-red-700 h-6 px-2"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                          <Input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="mb-2"
                          />
                          <p className="text-sm text-gray-600 mb-1">
                            {new Date(dueDate).toLocaleDateString('vi-VN', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                          {pregnancyWeeks !== null && (
                            <p className="text-sm text-[#F441A5] font-medium">
                              Tuổi thai: {pregnancyWeeks} tuần
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Số con - Chỉ hiển thị nếu có con */}
                      {children.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Số con</Label>
                          <p className="text-lg font-semibold text-gray-900 mt-1">{children.length} con</p>
                        </div>
                      )}
                      
                      {/* Danh sách con */}
                      {children.length > 0 && (
                        <div className="space-y-3">
                          <Label className="text-sm font-medium text-gray-700">Danh sách con</Label>
                          {children.map((child) => (
                            <div key={child.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                              <div>
                                <Label className="text-xs text-gray-600 mb-1 block">Tên con</Label>
                                <Input
                                  value={child.name}
                                  onChange={(e) => {
                                    setChildren(children.map(c => 
                                      c.id === child.id ? { ...c, name: e.target.value } : c
                                    ))
                                  }}
                                  className="font-medium"
                                  placeholder="Nhập tên con"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600 mb-1 block">Ngày sinh</Label>
                                <Input
                                  type="date"
                                  value={child.birthDate}
                                  onChange={(e) => {
                                    const newBirthDate = e.target.value
                                    const birthDate = new Date(newBirthDate)
                                    const today = new Date()
                                    const ageInMonths = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
                                    const ageText = ageInMonths < 12 
                                      ? `${ageInMonths} tháng` 
                                      : `${Math.floor(ageInMonths / 12)} tuổi ${ageInMonths % 12} tháng`
                                    setChildren(children.map(c => 
                                      c.id === child.id ? { ...c, birthDate: newBirthDate, age: ageText } : c
                                    ))
                                  }}
                                />
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Tuổi hiện tại:</span> {child.age}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteChild(child.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Form nhập ngày dự sinh - Hiển thị để thêm chu kỳ mang thai mới */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                            {dueDate ? 'Thêm chu kỳ mang thai mới' : 'Ngày dự sinh'}
                          </Label>
                          {dueDate && (
                            <span className="text-xs text-gray-500">(Thay đổi ngày dự sinh hiện tại)</span>
                          )}
                        </div>
                        <Input
                          id="dueDate"
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="mt-1"
                          placeholder="Chọn ngày dự sinh"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {dueDate 
                            ? 'Cập nhật ngày dự sinh cho chu kỳ mang thai hiện tại' 
                            : 'Nhập ngày dự sinh nếu bạn đang mang thai hoặc muốn thêm chu kỳ mang thai mới'}
                        </p>
                      </div>
                      
                      {/* Thêm con */}
                      {!showAddChildForm ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowAddChildForm(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Thêm con
                        </Button>
                      ) : (
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <Label htmlFor="childName" className="text-sm font-medium text-gray-700">Tên con</Label>
                            <Input
                              id="childName"
                              value={newChild.name}
                              onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                              className="mt-1"
                              placeholder="Nhập tên con"
                            />
                          </div>
                          <div>
                            <Label htmlFor="childBirthDate" className="text-sm font-medium text-gray-700">Ngày sinh</Label>
                            <Input
                              id="childBirthDate"
                              type="date"
                              value={newChild.birthDate}
                              onChange={(e) => setNewChild({ ...newChild, birthDate: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setShowAddChildForm(false)
                                setNewChild({ name: '', birthDate: '' })
                              }}
                            >
                              Hủy
                            </Button>
                            <Button
                              className="flex-1 btn-gradient-pink"
                              onClick={handleAddChild}
                              disabled={!newChild.name || !newChild.birthDate}
                            >
                              Thêm
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Thông báo khi chưa có thông tin */}
                      {children.length === 0 && !dueDate && (
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                          <p className="text-sm text-gray-600">
                            Bạn chưa có thông tin con hoặc thai kỳ. Vui lòng thêm thông tin để được hỗ trợ tốt nhất.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column - Avatar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {profileData.avatar ? (
                          <Image
                            src={URL.createObjectURL(profileData.avatar)}
                            alt="Avatar"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-16 w-16 text-gray-400" />
                        )}
                      </div>
                      <label htmlFor="avatar-upload">
                        <Button
                          variant="outline"
                          className="w-full cursor-pointer"
                          asChild
                        >
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            CHỌN ẢNH
                          </span>
                        </Button>
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 text-center">
                        Dung lượng file tối đa 1MB<br />
                        Định dạng: JPEG, .PNG
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )
      
      case 'packages':
        const daysInMonth = getDaysInMonth(currentMonth)
        const firstDay = getFirstDayOfMonth(currentMonth)
        const days = []
        
        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
          days.push(null)
        }
        
        // Add days of month
        for (let i = 1; i <= daysInMonth; i++) {
          days.push(i)
        }
        
        const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
        
        return (
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="space-y-6"
          >
            {/* Layout: Gói học + Tài liệu */}
            <div className="space-y-6">
              {/* Gói học Section with Slider */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">GÓI HỌC</h2>
                <div className="relative px-12 mt-6">
                  <Swiper
                    modules={[Navigation]}
                    spaceBetween={20}
                    slidesPerView={1}
                    breakpoints={{
                      640: { slidesPerView: 1.5, spaceBetween: 20 },
                      1024: { slidesPerView: 2, spaceBetween: 24 }
                    }}
                      navigation={{
                        nextEl: '.swiper-button-next-packages',
                        prevEl: '.swiper-button-prev-packages'
                      }}
                      className="w-full"
                    >
                      {mockCoursePackages.map((pkg) => (
                        <SwiperSlide key={pkg.id}>
                          <Card className="h-full flex flex-col">
                            <CardContent className="p-0 flex-1 flex flex-col">
                              <div className="flex flex-col h-full">
                                {/* Image on top */}
                                <div className="relative h-48 w-full bg-gray-200 flex-shrink-0">
                                  <Image
                                    src={pkg.image}
                                    alt={pkg.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                {/* Content below */}
                                <div className="p-4 md:p-5 flex flex-col flex-1">
                                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{pkg.title}</h3>
                                  <p className="text-xs md:text-sm text-gray-600 mb-3">{pkg.description}</p>
                                  <ul className="space-y-1.5 text-xs md:text-sm text-gray-700 flex-1">
                                    <li className="flex items-start gap-2">
                                      <span className="font-medium">- Thời lượng:</span>
                                      <span className="flex-1">{pkg.duration}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="font-medium">- Giáo viên:</span>
                                      <span className="flex-1">{pkg.instructor}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="font-medium">- Lợi ích cho mẹ:</span>
                                      <span className="flex-1">{pkg.benefitsForMother}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="font-medium">- Lợi ích cho bé:</span>
                                      <span className="flex-1">{pkg.benefitsForBaby}</span>
                                    </li>
                                  </ul>
                                  <Button
                                    className="btn-gradient-pink w-full mt-auto"
                                    size="sm"
                                    onClick={() => router.push(`/dashboard/courses/${pkg.id}`)}
                                  >
                                    Chi tiết gói học
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    <button className="swiper-button-prev-packages absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50">
                      <ChevronLeft className="h-5 w-5 text-gray-700" />
                    </button>
                    <button className="swiper-button-next-packages absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50">
                      <ChevronRight className="h-5 w-5 text-gray-700" />
                    </button>
                  </div>
                </div>

              {/* Tài liệu Section */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">TÀI LIỆU</h2>
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-200">
                      {mockDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#F441A5]/10 rounded-lg flex items-center justify-center">
                              <Download className="h-5 w-5 text-[#F441A5]" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{doc.title}</p>
                              <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => safeWindowOpen(doc.downloadUrl)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Tải xuống
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Lịch học Section - Below */}
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Lịch học tháng {currentMonth.toLocaleDateString('vi-VN', { month: 'long' })}
              </h2>
              <Card>
                <CardContent className="p-4">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <h3 className="text-sm font-bold text-gray-900">
                      {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day) => (
                      <div key={day} className="text-center text-xs font-semibold text-gray-700 py-1">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => {
                      if (day === null) {
                        return <div key={`packages-empty-${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${index}`} className="aspect-square" />
                      }
                      
                      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                      const sessionsForDay = getSessionsForDate(date)
                      const isToday = date.toDateString() === new Date().toDateString()
                      const hasSessions = sessionsForDay.length > 0
                      
                      return (
                        <button
                          key={`packages-calendar-${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`}
                          onClick={() => {
                            setSelectedDate(date)
                            if (sessionsForDay.length > 0) {
                              setSelectedSession(sessionsForDay[0])
                            }
                          }}
                          className={`aspect-square rounded border p-0.5 text-xs relative transition-all hover:shadow-sm ${
                            isToday
                              ? 'border-[#F441A5] bg-[#F441A5]/10'
                              : hasSessions
                              ? 'border-[#F441A5] bg-[#F441A5]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`text-right ${isToday ? 'font-bold text-[#F441A5] text-xs' : 'text-gray-700 text-[10px]'}`}>
                            {day}
                          </div>
                          {hasSessions && (
                            <div className="absolute bottom-0.5 left-0.5 right-0.5">
                              <div className="flex gap-0.5 justify-center">
                                {sessionsForDay.slice(0, 3).map((session, idx) => (
                                  <div
                                    key={`${day}-session-${idx}`}
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: getCourseColor(session.course) }}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )
      
      case 'schedule':
        const scheduleMonth = new Date(2025, parseInt(selectedMonth) - 1, 1)
        const scheduleDaysInMonth = getDaysInMonth(scheduleMonth)
        const scheduleFirstDay = getFirstDayOfMonth(scheduleMonth)
        const scheduleDays = []
        
        // Add empty cells for days before month starts
        for (let i = 0; i < scheduleFirstDay; i++) {
          scheduleDays.push(null)
        }
        
        // Add days of month
        for (let i = 1; i <= scheduleDaysInMonth; i++) {
          scheduleDays.push(i)
        }
        
        const scheduleWeekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
        
        // Filter sessions based on selected package and month
        const filteredSessions = mockUserSessions.filter(session => {
          const sessionDate = new Date(session.date)
          const sessionMonth = sessionDate.getMonth() + 1
          if (parseInt(selectedMonth) !== sessionMonth) return false
          if (selectedPackage === 'all') return true
          
          // Map package IDs to course names
          const packageMap: Record<string, string> = {
            'me-bau': 'Dành cho mẹ bầu',
            '0-12': '0-12 tháng',
            '13-24': '13-24 tháng',
            'trial-99k': 'Gói học thử 01 buổi 99K',
            'trial-me-bau': 'Gói học thử 01 buổi 99K',
            'trial-0-26': 'Gói học thử 01 buổi 99K',
            'combo-6': 'Gói combo 06 buổi',
            'combo-1': 'Gói combo 06 buổi',
            'combo-2': 'Gói combo 06 buổi',
            '3month': 'Gói 03 tháng',
            '6month': 'Gói 06 tháng',
            '12month': 'Gói 12 tháng',
          }
          
          const courseName = packageMap[selectedPackage] || selectedPackage
          return session.course.toLowerCase().includes(courseName.toLowerCase())
        })
        
        const getSessionsForScheduleDate = (date: Date) => {
          const dateStr = date.toISOString().split('T')[0]
          return filteredSessions.filter(s => s.date === dateStr)
        }
        
        // Check if user has purchased a course
        const isPurchasedCourse = (courseName: string) => {
          return purchasedCourses.some(purchased => 
            courseName.toLowerCase().includes(purchased.toLowerCase()) ||
            purchased.toLowerCase().includes(courseName.toLowerCase())
          )
        }
        
        // Get purchased sessions for a date
        const getPurchasedSessionsForDate = (date: Date) => {
          const dateStr = date.toISOString().split('T')[0]
          return filteredSessions.filter(s => 
            s.date === dateStr && isPurchasedCourse(s.course)
          )
        }
        
        // Course packages structure with nested items
        const coursePackagesList = [
          { id: 'me-bau', name: 'Dành cho mẹ bầu', hasChildren: false },
          { id: '0-12', name: 'Dành cho mẹ có con từ 0 - 12 tháng', hasChildren: false },
          { id: '13-24', name: 'Dành cho mẹ có con từ 13 - 24 tháng', hasChildren: false },
          { 
            id: 'trial-99k', 
            name: 'Gói học thử 01 buổi 99K', 
            hasChildren: true,
            children: [
              { id: 'trial-me-bau', name: 'Dành cho mẹ bầu' },
              { id: 'trial-0-26', name: 'Dành cho mẹ có con từ 0 - 26 tháng' }
            ]
          },
          { 
            id: 'combo-6', 
            name: 'Gói combo 06 buổi', 
            hasChildren: true,
            children: [
              { id: 'combo-1', name: 'Gói 01' },
              { id: 'combo-2', name: 'Gói 02' }
            ]
          },
          { id: '3month', name: 'Gói 03 tháng', hasChildren: false },
          { id: '6month', name: 'Gói 06 tháng', hasChildren: false },
          { id: '12month', name: 'Gói 12 tháng', hasChildren: false },
          { id: 'all', name: 'Tất cả các gói học', hasChildren: false }
        ]
        
        const togglePackage = (packageId: string) => {
          setExpandedPackages(prev => {
            const newSet = new Set(prev)
            if (newSet.has(packageId)) {
              newSet.delete(packageId)
            } else {
              newSet.add(packageId)
            }
            return newSet
          })
        }
        
        const handleSearch = () => {
          // Filter logic is already handled by selectedPackage and selectedMonth
          // This function can be used for additional filtering if needed
        }
        
        // Get selected package name for display
        const getSelectedPackageName = () => {
          if (selectedPackage === 'all') return 'TẤT CẢ CÁC GÓI HỌC'
          const pkg = coursePackagesList.find(p => p.id === selectedPackage)
          return pkg ? pkg.name.toUpperCase() : 'TẤT CẢ CÁC GÓI HỌC'
        }
        
        return (
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="space-y-6"
          >
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">LỊCH HỌC THEO GÓI</h1>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Sidebar - Filters */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    {/* Dropdowns and Search Button */}
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-1 block">CÁC GÓI HỌC</Label>
                        <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn gói học" />
                          </SelectTrigger>
                          <SelectContent>
                            {coursePackagesList.map((pkg) => (
                              <SelectItem key={pkg.id} value={pkg.id}>
                                {pkg.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs font-semibold text-gray-700 mb-1 block">THÁNG</Label>
                          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                                <SelectItem key={`schedule-month-${month}`} value={month.toString()}>
                                  Tháng {month}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <Button
                            onClick={handleSearch}
                            className="bg-gray-900 text-white hover:bg-gray-800 h-10 px-4"
                          >
                            TÌM
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Package List */}
                    <div className="mt-6 space-y-1">
                      {coursePackagesList.map((pkg) => (
                        <div key={pkg.id}>
                          <button
                            key={`package-btn-${pkg.id}`}
                            onClick={() => {
                              if (pkg.hasChildren) {
                                togglePackage(pkg.id)
                              } else {
                                setSelectedPackage(pkg.id)
                              }
                            }}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              selectedPackage === pkg.id
                                ? 'bg-[#F441A5]/10 text-[#F441A5] font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{pkg.name}</span>
                              {pkg.hasChildren && (
                                <ChevronRight 
                                  className={`h-4 w-4 transition-transform ${
                                    expandedPackages.has(pkg.id) ? 'rotate-90' : ''
                                  }`}
                                />
                              )}
                            </div>
                          </button>
                          {pkg.hasChildren && expandedPackages.has(pkg.id) && (
                            <div className="ml-4 mt-1 space-y-1">
                              {pkg.children?.map((child) => (
                                <button
                                  key={`package-child-${pkg.id}-${child.id}`}
                                  onClick={() => setSelectedPackage(child.id)}
                                  className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${
                                    selectedPackage === child.id
                                      ? 'bg-[#F441A5]/10 text-[#F441A5] font-medium'
                                      : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                                >
                                  {child.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Calendar View */}
              <div className="lg:col-span-3">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Lịch học tháng {scheduleMonth.toLocaleDateString('vi-VN', { month: 'long' })} / {getSelectedPackageName()}
                  </h2>
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {scheduleWeekDays.map((day) => (
                        <div key={day} className="text-center font-semibold text-gray-700 py-2 text-sm">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 mb-6">
                      {scheduleDays.map((day, index) => {
                        if (day === null) {
                          return <div key={`schedule-empty-${scheduleMonth.getFullYear()}-${scheduleMonth.getMonth()}-${index}`} className="aspect-square" />
                        }
                        
                        const date = new Date(scheduleMonth.getFullYear(), scheduleMonth.getMonth(), day)
                        const sessionsForDay = getSessionsForScheduleDate(date)
                        const purchasedSessionsForDay = getPurchasedSessionsForDate(date)
                        const hasPurchasedSessions = purchasedSessionsForDay.length > 0
                        const isToday = date.toDateString() === new Date().toDateString()
                        
                        return (
                          <button
                            key={`schedule-calendar-${scheduleMonth.getFullYear()}-${scheduleMonth.getMonth()}-${day}`}
                            onClick={() => {
                              setSelectedDate(date)
                              const sessionsToShow = hasPurchasedSessions ? purchasedSessionsForDay : sessionsForDay
                              if (sessionsToShow.length > 0) {
                                setSelectedDateSessions(sessionsToShow)
                                setSelectedSession(sessionsToShow[0])
                              } else {
                                setSelectedDateSessions([])
                                setSelectedSession(null)
                              }
                            }}
                            className={`aspect-square rounded-md border-2 p-1 text-sm relative transition-all hover:shadow-md ${
                              isToday
                                ? 'border-[#F441A5] bg-[#F441A5]/10'
                                : hasPurchasedSessions
                                ? 'border-[#F441A5]/50 bg-[#F441A5]/20'
                                : sessionsForDay.length > 0
                                ? 'border-gray-200 bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`text-right mb-1 text-xs ${isToday ? 'font-bold text-[#F441A5]' : 'text-gray-700'}`}>
                              {day}
                            </div>
                            {sessionsForDay.length > 0 && (
                              <div className="space-y-1">
                                {sessionsForDay.slice(0, 4).map((session, idx) => {
                                  const isFull = session.enrolled >= session.capacity
                                  const sessionColor = isFull ? '#F441A5' : '#1E40AF'
                                  const timeRange = session.endTime ? `${session.time}-${session.endTime}` : session.time
                                  return (
                                    <div key={`schedule-${day}-session-${idx}-${session.time}`} className="flex items-center gap-1">
                                      <div 
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: sessionColor }}
                                      />
                                      <span className="text-[10px] text-gray-700 truncate">{timeRange}</span>
                                    </div>
                                  )
                                })}
                                {sessionsForDay.length > 4 && (
                                  <span className="text-[10px] text-gray-500">+{sessionsForDay.length - 4}</span>
                                )}
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center gap-6 pt-4 border-t flex-wrap">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#F441A5]"></div>
                        <span className="text-sm text-gray-700">Lớp full</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#1E40AF]"></div>
                        <span className="text-sm text-gray-700">Còn trống</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#F441A5]/50 border border-[#F441A5]"></div>
                        <span className="text-sm text-gray-700">Lớp đã mua</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )
      
      case 'progress':
        return (
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Tiến độ học</h2>
              <p className="text-gray-600">Theo dõi tiến độ học tập của bạn</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockProgress.map((course) => (
                <Card key={course.id} className="h-full">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-bold text-gray-900">{course.courseName}</h3>
                        {course.status === 'completed' && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        )}
                        {course.status === 'in-progress' && (
                          <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Tiến độ</span>
                          <span className="font-semibold text-gray-900">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all ${
                              course.status === 'completed'
                                ? 'bg-green-500'
                                : 'bg-gradient-to-r from-[#F441A5] to-[#FF5F6D]'
                            }`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Đã hoàn thành</span>
                          <span className="font-semibold text-gray-900">
                            {course.completedSessions}/{course.totalSessions} buổi
                          </span>
                        </div>
                        {course.lastActivity && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>Hoạt động cuối: {new Date(course.lastActivity).toLocaleDateString('vi-VN')}</span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => router.push(`/dashboard/courses/${course.id}`)}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Summary Card */}
            <Card className="bg-gradient-to-r from-[#F441A5]/10 to-[#FF5F6D]/10 border-[#F441A5]/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Tổng quan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#F441A5]">
                      {mockProgress.reduce((sum, c) => sum + c.completedSessions, 0)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Buổi đã hoàn thành</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#F441A5]">
                      {mockProgress.reduce((sum, c) => sum + c.totalSessions - c.completedSessions, 0)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Buổi còn lại</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#F441A5]">
                      {Math.round(mockProgress.reduce((sum, c) => sum + c.progress, 0) / mockProgress.length)}%
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Tiến độ trung bình</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      
      case 'payment':
        // Calculate pagination
        const totalPaymentPages = Math.ceil(mockPayments.length / paymentsPerPage)
        const startIndex = (paymentPage - 1) * paymentsPerPage
        const endIndex = startIndex + paymentsPerPage
        const currentPagePayments = mockPayments.slice(startIndex, endIndex)
        
        return (
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán & Gói học</h2>
              <p className="text-gray-600">Quản lý thanh toán và gói học của bạn</p>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Tổng đã thanh toán</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(mockPayments.reduce((sum, p) => sum + p.amount, 0))}
                      </p>
                    </div>
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Số gói đã mua</p>
                      <p className="text-2xl font-bold text-gray-900">{mockPayments.length}</p>
                    </div>
                    <BookOpen className="h-10 w-10 text-[#F441A5]" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Gói đang học</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockProgress.filter(p => p.status === 'in-progress').length}
                      </p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Payment History */}
            <Card>
              <CardContent className="p-0">
                <div className="p-6 border-b flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Lịch sử thanh toán</h3>
                  <span className="text-sm text-gray-600">
                    Hiển thị {startIndex + 1}-{Math.min(endIndex, mockPayments.length)} / {mockPayments.length} hóa đơn
                  </span>
                </div>
                <div className="divide-y divide-gray-200">
                  {currentPagePayments.map((payment) => (
                    <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{payment.packageName}</h4>
                            {payment.status === 'paid' && (
                              <Badge className="bg-green-100 text-green-700 border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Đã thanh toán
                              </Badge>
                            )}
                            {payment.status === 'pending' && (
                              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Đang xử lý
                              </Badge>
                            )}
                            {payment.status === 'failed' && (
                              <Badge className="bg-red-100 text-red-700 border-red-200">
                                <XCircle className="h-3 w-3 mr-1" />
                                Thất bại
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Số tiền:</span>
                              <p className="text-gray-900 font-semibold">{formatCurrency(payment.amount)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Ngày thanh toán:</span>
                              <p className="text-gray-900">{new Date(payment.paymentDate).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div>
                              <span className="font-medium">Phương thức:</span>
                              <p className="text-gray-900">{payment.paymentMethod}</p>
                            </div>
                            <div>
                              <span className="font-medium">Mã giao dịch:</span>
                              <p className="text-gray-900 font-mono text-xs">{payment.invoiceNumber}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPaymentPages > 1 && (
                  <div className="p-6 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Trang {paymentPage} / {totalPaymentPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentPage(prev => Math.max(1, prev - 1))}
                        disabled={paymentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Trước
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPaymentPages }, (_, i) => i + 1).map((page) => {
                          if (
                            page === 1 ||
                            page === totalPaymentPages ||
                            (page >= paymentPage - 1 && page <= paymentPage + 1)
                          ) {
                            return (
                              <Button
                                key={page}
                                variant={paymentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setPaymentPage(page)}
                                className={paymentPage === page ? "bg-[#F441A5] text-white" : ""}
                              >
                                {page}
                              </Button>
                            )
                          } else if (page === paymentPage - 2 || page === paymentPage + 2) {
                            return <span key={page} className="px-2 text-gray-400">...</span>
                          }
                          return null
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentPage(prev => Math.min(totalPaymentPages, prev + 1))}
                        disabled={paymentPage === totalPaymentPages}
                      >
                        Sau
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      
      case 'notifications':
        // Filter notifications within last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const filteredNotifications = mockNotifications.filter(notification => {
          const notificationDate = new Date(notification.date)
          return notificationDate >= thirtyDaysAgo
        })
        
        // Calculate pagination
        const totalNotificationPages = Math.ceil(filteredNotifications.length / notificationsPerPage)
        const notificationStartIndex = (notificationPage - 1) * notificationsPerPage
        const notificationEndIndex = notificationStartIndex + notificationsPerPage
        const currentPageNotifications = filteredNotifications.slice(notificationStartIndex, notificationEndIndex)
        
        const unreadCount = filteredNotifications.filter(n => !n.isRead).length
        
        return (
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Thông báo</h2>
                <p className="text-gray-600">Xem các thông báo mới nhất (30 ngày gần nhất)</p>
              </div>
              {unreadCount > 0 && (
                <Badge className="bg-[#F441A5] text-white px-3 py-1">
                  {unreadCount} thông báo chưa đọc
                </Badge>
              )}
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="p-6 border-b flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Lịch sử thông báo</h3>
                  <span className="text-sm text-gray-600">
                    Hiển thị {notificationStartIndex + 1}-{Math.min(notificationEndIndex, filteredNotifications.length)} / {filteredNotifications.length} thông báo
                  </span>
                </div>
                <div className="divide-y divide-gray-200">
                  {currentPageNotifications.map((notification) => {
                    const getIcon = () => {
                      switch (notification.type) {
                        case 'success':
                          return <CheckCircle2 className="h-5 w-5 text-green-500" />
                        case 'warning':
                          return <AlertCircle className="h-5 w-5 text-yellow-500" />
                        case 'error':
                          return <XCircle className="h-5 w-5 text-red-500" />
                        default:
                          return <Bell className="h-5 w-5 text-blue-500" />
                      }
                    }
                    
                    const getBgColor = () => {
                      switch (notification.type) {
                        case 'success':
                          return 'bg-green-50'
                        case 'warning':
                          return 'bg-yellow-50'
                        case 'error':
                          return 'bg-red-50'
                        default:
                          return notification.isRead ? 'bg-white' : 'bg-blue-50'
                      }
                    }
                    
                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${getBgColor()} ${
                          !notification.isRead ? 'border-l-4 border-[#F441A5]' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {getIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-1">
                              <h4 className={`font-semibold text-gray-900 ${!notification.isRead ? 'font-bold' : ''}`}>
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <div className="h-2 w-2 bg-[#F441A5] rounded-full flex-shrink-0 mt-2" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{new Date(notification.date).toLocaleDateString('vi-VN')}</span>
                              <span>{notification.time}</span>
                              {notification.link && (
                                <button
                                  onClick={() => router.push(notification.link!)}
                                  className="text-[#F441A5] hover:underline"
                                >
                                  Xem chi tiết →
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Pagination */}
                {totalNotificationPages > 1 && (
                  <div className="p-6 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Trang {notificationPage} / {totalNotificationPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNotificationPage(prev => Math.max(1, prev - 1))}
                        disabled={notificationPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Trước
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalNotificationPages }, (_, i) => i + 1).map((page) => {
                          if (
                            page === 1 ||
                            page === totalNotificationPages ||
                            (page >= notificationPage - 1 && page <= notificationPage + 1)
                          ) {
                            return (
                              <Button
                                key={page}
                                variant={notificationPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setNotificationPage(page)}
                                className={notificationPage === page ? "bg-[#F441A5] text-white" : ""}
                              >
                                {page}
                              </Button>
                            )
                          } else if (page === notificationPage - 2 || page === notificationPage + 2) {
                            return <span key={page} className="px-2 text-gray-400">...</span>
                          }
                          return null
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setNotificationPage(prev => Math.min(totalNotificationPages, prev + 1))}
                        disabled={notificationPage === totalNotificationPages}
                      >
                        Sau
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      
      case 'support':
        const handleSupportSubmit = (e: React.FormEvent) => {
          e.preventDefault()
          setSupportSubmitted(true)
          setTimeout(() => {
            setSupportSubmitted(false)
            setSupportForm({ subject: '', message: '', category: 'general' })
          }, 2000)
        }
        
        return (
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Hỗ trợ</h2>
              <p className="text-gray-600">Liên hệ với chúng tôi để được hỗ trợ</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact Info */}
              <div className="lg:col-span-1 space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Thông tin liên hệ</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-[#F441A5] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Hotline</p>
                          <a href="tel:+84947701010" className="text-sm text-gray-600 hover:text-[#F441A5]">
                            0947 70 10 10
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-[#F441A5] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Email</p>
                          <a href="mailto:contact@ipd8.org" className="text-sm text-gray-600 hover:text-[#F441A5]">
                            contact@ipd8.org
                          </a>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-[#F441A5] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Giờ làm việc</p>
                          <p className="text-sm text-gray-600">Thứ 2 - Chủ nhật: 8:00 - 20:00</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Câu hỏi thường gặp</h3>
                    <div className="space-y-3">
                      <a href="/faqs" className="block text-sm text-gray-600 hover:text-[#F441A5] transition-colors">
                        → Làm thế nào để đăng ký khóa học?
                      </a>
                      <a href="/faqs" className="block text-sm text-gray-600 hover:text-[#F441A5] transition-colors">
                        → Phương thức thanh toán nào được chấp nhận?
                      </a>
                      <a href="/faqs" className="block text-sm text-gray-600 hover:text-[#F441A5] transition-colors">
                        → Có thể hủy hoặc hoàn tiền không?
                      </a>
                      <a href="/faqs" className="block text-sm text-gray-600 hover:text-[#F441A5] transition-colors">
                        → Làm sao để tham gia buổi học online?
                      </a>
                    </div>
                    <Button variant="outline" className="w-full mt-4" onClick={() => router.push('/faqs')}>
                      Xem tất cả FAQs
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              {/* Support Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Gửi yêu cầu hỗ trợ</h3>
                    {supportSubmitted ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Gửi thành công!</h4>
                        <p className="text-gray-600">Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSupportSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="support-category">Loại yêu cầu</Label>
                          <Select
                            value={supportForm.category}
                            onValueChange={(value) => setSupportForm({ ...supportForm, category: value })}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">Câu hỏi chung</SelectItem>
                              <SelectItem value="technical">Vấn đề kỹ thuật</SelectItem>
                              <SelectItem value="payment">Thanh toán</SelectItem>
                              <SelectItem value="course">Khóa học</SelectItem>
                              <SelectItem value="schedule">Lịch học</SelectItem>
                              <SelectItem value="other">Khác</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="support-subject">Tiêu đề</Label>
                          <Input
                            id="support-subject"
                            value={supportForm.subject}
                            onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                            className="mt-1"
                            placeholder="Nhập tiêu đề yêu cầu"
                            required
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="support-message">Nội dung</Label>
                          <textarea
                            id="support-message"
                            value={supportForm.message}
                            onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                            className="mt-1 w-full min-h-[150px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            placeholder="Mô tả chi tiết vấn đề của bạn..."
                            required
                          />
                        </div>
                        
                        <Button type="submit" className="btn-gradient-pink w-full">
                          <Send className="h-4 w-4 mr-2" />
                          Gửi yêu cầu
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 flex pt-[104px] md:pt-[140px]">
        {/* Sidebar */}
        <aside className="fixed left-0 w-64 bg-white border-r border-gray-200 h-[calc(100vh-104px)] md:h-[calc(100vh-140px)] top-[104px] md:top-[140px]">
          <div className="px-4 pb-4 pt-[30px] space-y-2 h-full overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeMenu === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="font-medium whitespace-nowrap text-sm">{item.name}</span>
                </button>
              )
            })}
            
            <div className="pt-8 border-t border-gray-200 mt-8">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium whitespace-nowrap text-sm">Đăng xuất</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-64">
          <main className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
          
          {/* Dashboard Footer - Starts from right edge of sidebar */}
          <footer className="bg-gray-50 border-t w-full">
            <div className="py-8 px-8">
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* Company Info */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Trung tâm 1.000 ngày vàng đầu đời. All rights reserved.
                    </p>
                  </div>
                  
                  {/* About Us */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Về chúng tôi</h4>
                    <ul className="space-y-2">
                      <li>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          Về IPD8
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          Tầm nhìn & Sứ mệnh
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          Đội ngũ chuyên gia
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          Tin tức
                        </a>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Courses */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Khóa học</h4>
                    <ul className="space-y-2">
                      <li>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          Khóa học Mẹ bầu
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          Khóa học 0-12 tháng
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          Khóa học 13-24 tháng
                        </a>
                      </li>
                      <li>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          Lịch học
                        </a>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Contact & Support */}
                  <div>
                    <h4 className="font-medium text-sm mb-2">Liên hệ</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Tầng 8, Tòa nhà Vietnam Business Center số 57-59 đường Hồ Tùng Mậu, Phường Sài Gòn, TP. HCM</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>+84 94 770 10 10</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>contact@ipd8.org</span>
                      </li>
                    </ul>
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2">Hỗ trợ</h4>
                      <ul className="space-y-2">
                        <li>
                          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            FAQs
                          </a>
                        </li>
                        <li>
                          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            Chính sách
                          </a>
                        </li>
                        <li>
                          <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            Liên hệ
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-6 border-t">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      © {new Date().getFullYear()} Trung tâm 1.000 ngày vàng đầu đời. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        Chính sách bảo mật
                      </a>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        Điều khoản
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
      
      {/* Session Detail Dialog */}
      <Dialog open={!!selectedSession && selectedDateSessions.length > 0} onOpenChange={() => {
        setSelectedSession(null)
        setSelectedDateSessions([])
      }}>
        <DialogContent className="max-w-2xl">
          {selectedSession && selectedDateSessions.length > 0 && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedDateSessions.length > 1 
                    ? `Lịch học ngày ${formatDate(selectedDate || new Date())}`
                    : selectedSession.title
                  }
                </DialogTitle>
              </DialogHeader>
              
              {selectedDateSessions.length > 1 ? (
                // Multiple sessions - show tabs
                <Tabs defaultValue={`session-${selectedDateSessions[0].id}`} className="w-full">
                  <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${selectedDateSessions.length}, 1fr)` }}>
                    {selectedDateSessions.map((session, index) => (
                      <TabsTrigger 
                        key={session.id} 
                        value={`session-${session.id}`}
                        className="text-xs"
                      >
                        {session.time}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {selectedDateSessions.map((session) => (
                    <TabsContent key={session.id} value={`session-${session.id}`} className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">{session.title}</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Khóa học:</span>
                              <span className="font-medium">{session.course}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{formatDate(new Date(session.date))}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{session.time} - {session.endTime} ({session.duration})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">Giáo viên: {session.instructor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{session.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Số lượng:</span>
                              <span className="font-medium">{session.enrolled}/{session.capacity}</span>
                            </div>
                          </div>
                        </div>
                        {session.meetingLink && (
                          <div>
                            <Button
                              className="w-full bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white flex items-center justify-center gap-2"
                              onClick={() => safeWindowOpen(session.meetingLink)}
                            >
                              {session.meetingType === 'google-meet' ? (
                                <>
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z" fill="currentColor"/>
                                  </svg>
                                  Tham gia Google Meet
                                </>
                              ) : (
                                'Tham gia Zoom'
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                // Single session - show directly
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Thông tin lớp học</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Khóa học:</span>
                        <span className="font-medium">{selectedSession.course}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{formatDate(new Date(selectedSession.date))}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{selectedSession.time} - {selectedSession.endTime} ({selectedSession.duration})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Giáo viên: {selectedSession.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{selectedSession.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Số lượng:</span>
                        <span className="font-medium">{selectedSession.enrolled}/{selectedSession.capacity}</span>
                      </div>
                    </div>
                  </div>
                  {selectedSession.meetingLink && (
                    <div>
                      <Button
                        className="w-full bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white flex items-center justify-center gap-2"
                        onClick={() => safeWindowOpen(selectedSession.meetingLink)}
                      >
                        {selectedSession.meetingType === 'google-meet' ? (
                          <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z" fill="currentColor"/>
                            </svg>
                            Tham gia Google Meet
                          </>
                        ) : (
                          'Tham gia Zoom'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
