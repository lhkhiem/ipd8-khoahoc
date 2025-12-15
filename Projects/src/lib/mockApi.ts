import { Session } from '@/components/trial/SessionCard'

// Mock sessions data
export const mockSessions: Session[] = [
  {
    id: '1',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '09:00 - 10:00',
    instructor: {
      name: 'TS. Nguyễn Thị Lan',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    },
    capacity: 10,
    registered: 3,
    location: 'Cơ sở Quận 1, TP.HCM',
    description: 'Buổi học thử giúp mẹ và bé làm quen với phương pháp IPD8. Trải nghiệm đầy đủ các hoạt động giáo dục sớm được thiết kế riêng cho từng độ tuổi.',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop',
  },
  {
    id: '2',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '14:00 - 15:00',
    instructor: {
      name: 'BS. Trần Minh Anh',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop',
    },
    capacity: 8,
    registered: 5,
    location: 'Cơ sở Quận 3, TP.HCM',
    description: 'Trải nghiệm phương pháp giáo dục sớm cho trẻ 0-12 tháng',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=400&fit=crop',
  },
  {
    id: '3',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '10:00 - 11:00',
    instructor: {
      name: 'TS. Phạm Văn Hùng',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop',
    },
    capacity: 12,
    registered: 8,
    location: 'Cơ sở Quận 7, TP.HCM',
    description: 'Học thử chương trình phát triển tâm lý và cảm xúc cho trẻ',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop',
  },
  {
    id: '4',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '15:00 - 16:00',
    instructor: {
      name: 'BS. Lê Thị Mai',
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop',
    },
    capacity: 10,
    registered: 10,
    location: 'Cơ sở Quận 1, TP.HCM',
    description: 'Buổi học thử dành cho mẹ bầu và trẻ sơ sinh',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop',
  },
  {
    id: '5',
    date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '09:00 - 10:00',
    instructor: {
      name: 'TS. Nguyễn Thị Lan',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop',
    },
    capacity: 8,
    registered: 2,
    location: 'Cơ sở Quận 3, TP.HCM',
    description: 'Trải nghiệm phương pháp giáo dục sớm IPD8',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&h=400&fit=crop',
  },
  {
    id: '6',
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '14:00 - 15:00',
    instructor: {
      name: 'BS. Trần Minh Anh',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop',
    },
    capacity: 10,
    registered: 1,
    location: 'Cơ sở Quận 7, TP.HCM',
    description: 'Buổi học thử miễn phí cho gia đình mới',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&h=400&fit=crop',
  },
]

// Mock API functions
export const fetchSessions = async (type?: string): Promise<Session[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  if (type === 'hoc-thu') {
    return mockSessions
  }
  
  return mockSessions
}

export const registerTrial = async (data: {
  sessionId: string
  name: string
  phone: string
  email: string
  message?: string
}): Promise<{ success: boolean; bookingId: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  return {
    success: true,
    bookingId: `BK-${Date.now()}`,
  }
}

export const createZaloPayPayment = async (bookingId: string, amount: number): Promise<{
  success: boolean
  paymentUrl?: string
  transactionId?: string
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return {
    success: true,
    paymentUrl: `https://zalopay.vn/payment/${bookingId}`,
    transactionId: `TXN-${Date.now()}`,
  }
}

