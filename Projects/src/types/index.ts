export interface User {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  gender?: string
  dob?: string
  avatarUrl?: string
  role: 'guest' | 'student' | 'instructor' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface Instructor {
  id: string
  userId: string
  title: string
  credentials: string
  bio: string
  user?: User
}

export interface Course {
  id: string
  slug: string
  title: string
  targetAudience: string
  description: string
  benefitsMom?: string
  benefitsBaby?: string
  price: number
  priceType: 'one-off' | 'subscription'
  durationMinutes: number
  mode: 'group' | 'one-on-one'
  status: 'draft' | 'published'
  featured: boolean
  thumbnailUrl?: string
  videoUrl?: string
  instructorId?: string
  instructor?: Instructor
  modules?: CourseModule[]
  sessions?: CourseSession[]
  createdAt: string
  updatedAt: string
}

export interface CourseModule {
  id: string
  courseId: string
  order: number
  title: string
  description?: string
}

export interface CourseSession {
  id: string
  courseId: string
  instructorId?: string
  order: number
  title: string
  description?: string
  startTime: string
  endTime: string
  capacity: number
  status: 'scheduled' | 'full' | 'cancelled' | 'done'
  course?: Course
  instructor?: Instructor
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  type: 'trial' | 'standard' | 'combo' | '3m' | '6m' | '12m' | '24m'
  status: 'pending' | 'active' | 'cancelled' | 'completed'
  startDate?: string
  endDate?: string
  course?: Course
  progress?: Progress[]
}

export interface Progress {
  id: string
  enrollmentId: string
  moduleId?: string
  sessionId?: string
  progressPercent: number
  feedback?: string
}

export interface Material {
  id: string
  courseId: string
  title: string
  fileKey: string
  fileUrl: string
  mime: string
  size: number
  visibility: 'public' | 'private' | 'enrolled'
  provider: string
}

export interface Order {
  id: string
  userId: string
  amount: number
  currency: string
  status: 'created' | 'paid' | 'failed' | 'refunded'
  gateway: 'zalopay'
  description?: string
  metadata?: Record<string, any>
  items?: OrderItem[]
  payments?: Payment[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  courseId: string
  price: number
  quantity: number
  course?: Course
}

export interface Payment {
  id: string
  orderId: string
  gatewayTxnId?: string
  status: string
  paidAt?: string
  rawResponse?: any
}

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  readAt?: string
  createdAt: string
}

export interface Ticket {
  id: string
  userId: string
  subject: string
  content: string
  status: string
  createdAt: string
}

export interface Post {
  id: string
  slug: string
  title: string
  content: string
  excerpt?: string
  thumbnailUrl?: string
  type: 'NEWS' | 'EVENT' | 'BLOG' | 'FAQ' | 'POLICY'
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ContactForm {
  name: string
  email: string
  phone: string
  address?: string
  courseInterest?: string
  studyMode?: string
  message: string
}

export interface APIResponse<T> {
  data: T
  meta?: {
    requestId: string
    timestamp: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
