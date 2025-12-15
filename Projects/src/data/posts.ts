import { Post } from '@/types'

export const mockPosts: Post[] = [
  {
    id: '1',
    slug: 'dinh-duong-me-bau-3-thang-dau',
    title: 'Dinh dưỡng cho mẹ bầu trong 3 tháng đầu thai kỳ',
    excerpt: 'Những điều cần biết về dinh dưỡng trong giai đoạn quan trọng nhất của thai kỳ.',
    content: 'Nội dung chi tiết về dinh dưỡng...',
    thumbnailUrl: '/images/blog/nutrition-1.jpg',
    type: 'BLOG',
    publishedAt: '2024-01-15T00:00:00Z',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    slug: 'su-kien-hoi-thao-nuoi-con-khoa-hoc',
    title: 'Hội thảo "Nuôi con khoa học - Con khỏe, mẹ vui"',
    excerpt: 'Sự kiện lớn với sự tham gia của các chuyên gia hàng đầu về nuôi dạy con.',
    content: 'Chi tiết sự kiện...',
    thumbnailUrl: '/images/events/event-1.jpg',
    type: 'EVENT',
    publishedAt: '2024-02-01T00:00:00Z',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: '3',
    slug: 'phat-trien-tri-tue-cho-be-0-3-tuoi',
    title: 'Cách kích thích phát triển trí tuệ cho bé 0-3 tuổi',
    excerpt: 'Các phương pháp và hoạt động giúp kích thích phát triển não bộ cho trẻ nhỏ.',
    content: 'Nội dung chi tiết...',
    thumbnailUrl: '/images/blog/brain-dev.jpg',
    type: 'BLOG',
    publishedAt: '2024-01-25T00:00:00Z',
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z',
  },
]

export const mockFAQs: Post[] = [
  {
    id: 'faq-1',
    slug: 'lam-sao-de-dang-ky-khoa-hoc',
    title: 'Làm sao để đăng ký khóa học?',
    content: 'Bạn có thể đăng ký khóa học bằng cách: 1) Tạo tài khoản trên website 2) Chọn khóa học phù hợp 3) Thanh toán qua ZaloPay 4) Nhận xác nhận qua email.',
    type: 'FAQ',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'faq-2',
    slug: 'co-the-hoan-tien-khong',
    title: 'Có thể hoàn tiền nếu không học được không?',
    content: 'IPD8 hỗ trợ hoàn tiền 100% nếu bạn hủy khóa học trước 7 ngày khai giảng. Sau thời gian này, chúng tôi sẽ xem xét từng trường hợp cụ thể.',
    type: 'FAQ',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

export const mockPolicies: Post[] = [
  {
    id: 'policy-1',
    slug: 'chinh-sach-bao-mat',
    title: 'Chính sách bảo mật',
    content: 'IPD8 cam kết bảo vệ thông tin cá nhân của học viên...',
    type: 'POLICY',
    publishedAt: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'policy-2',
    slug: 'dieu-khoan-su-dung',
    title: 'Điều khoản sử dụng',
    content: 'Khi sử dụng dịch vụ của IPD8, bạn đồng ý với các điều khoản sau...',
    type: 'POLICY',
    publishedAt: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]
