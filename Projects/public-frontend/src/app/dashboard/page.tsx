'use client'

import { useState } from 'react'
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
  Mail
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
                <div className="relative px-12">
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
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-full">
                                <div className="relative h-48 md:h-auto bg-gray-200">
                                  <Image
                                    src={pkg.image}
                                    alt={pkg.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
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
                                    className="btn-gradient-pink w-full mt-4"
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
                        const isToday = date.toDateString() === new Date().toDateString()
                        
                        return (
                          <button
                            key={`schedule-calendar-${scheduleMonth.getFullYear()}-${scheduleMonth.getMonth()}-${day}`}
                            onClick={() => {
                              setSelectedDate(date)
                              if (sessionsForDay.length > 0) {
                                setSelectedSession(sessionsForDay[0])
                              }
                            }}
                            className={`aspect-square rounded-md border-2 p-1 text-sm relative transition-all hover:shadow-md ${
                              isToday
                                ? 'border-[#F441A5] bg-[#F441A5]/10'
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
                    <div className="flex items-center gap-6 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#F441A5]"></div>
                        <span className="text-sm text-gray-700">Lớp full</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#1E40AF]"></div>
                        <span className="text-sm text-gray-700">Còn trống</span>
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
            
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">Tiến độ học sẽ hiển thị tại đây</p>
              </CardContent>
            </Card>
          </motion.div>
        )
      
      case 'payment':
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
            
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">Thanh toán & Gói học sẽ hiển thị tại đây</p>
              </CardContent>
            </Card>
          </motion.div>
        )
      
      case 'notifications':
        return (
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Thông báo</h2>
              <p className="text-gray-600">Xem các thông báo mới nhất</p>
            </div>
            
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">Thông báo sẽ hiển thị tại đây</p>
              </CardContent>
            </Card>
          </motion.div>
        )
      
      case 'support':
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
            
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">Hỗ trợ sẽ hiển thị tại đây</p>
              </CardContent>
            </Card>
          </motion.div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" style={{ marginTop: '-104px' }}>
      <div className="flex-1 flex">
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
        <div className="flex-1 flex flex-col ml-64 mt-[104px] md:mt-[140px]">
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
                      Trung tâm 1.000 ngày vòng đầu đời. All rights reserved.
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
                      © {new Date().getFullYear()} Trung tâm 1.000 ngày vòng đầu đời. All rights reserved.
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
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-2xl">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedSession.title}</DialogTitle>
              </DialogHeader>
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
