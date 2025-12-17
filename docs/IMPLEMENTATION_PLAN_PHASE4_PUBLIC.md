# PHASE 4: PUBLIC FRONTEND INTEGRATION

**Mục tiêu:** Tích hợp website với Public Backend API

**Thời gian ước tính:** 2-3 tuần

**Lưu ý:** Public Frontend kết nối với **Public Backend** (không phải CMS Backend). Xem [IMPLEMENTATION_PLAN_PHASE2B_PUBLIC_BACKEND.md](./IMPLEMENTATION_PLAN_PHASE2B_PUBLIC_BACKEND.md) để biết chi tiết Public Backend API.

---

## 📋 CHECKLIST

### Setup & Infrastructure
- [ ] Configure API client
- [ ] Setup authentication flow
- [ ] Setup state management
- [ ] Update existing components

### Core Features
- [ ] Homepage integration
- [ ] Courses listing & detail
- [ ] Course booking & enrollment
- [ ] Payment integration
- [ ] User dashboard
- [ ] Authentication pages

---

## 1. SETUP & INFRASTRUCTURE

### 1.1. API Client Configuration

**File:** `src/lib/api.ts`

```typescript
// Axios/Fetch client
// Base URL: Public Backend API (không phải CMS Backend)
// Request/Response interceptors
// Error handling
// Token management (user JWT, không phải admin JWT)
```

**Base URL:** `process.env.NEXT_PUBLIC_API_URL` (Public Backend, ví dụ: `http://localhost:3001/api/public`)

**Lưu ý quan trọng:**
- **KHÔNG hardcode** URL trong code
- Phải đọc từ `.env.local` (development) hoặc `.env.production` (production)
- Environment variable: `NEXT_PUBLIC_API_URL` (cho Public Backend API)

**Checklist:**
- [ ] API client setup
- [ ] Base URL configuration từ env (Public Backend, KHÔNG hardcode)
- [ ] Request interceptors (add user token)
- [ ] Response interceptors (handle errors)
- [ ] Token refresh logic

---

### 1.2. Authentication Flow

**Files:**
- `src/lib/auth.ts` - Auth utilities
- `src/contexts/AuthContext.tsx` - Auth context
- `src/hooks/useAuth.ts` - Auth hook

**Features:**
- Login
- Register
- Logout
- Token management
- Protected routes
- Auto token refresh

**Checklist:**
- [ ] Login page integration
- [ ] Register page integration
- [ ] Auth context
- [ ] Protected routes
- [ ] Token storage (localStorage/cookies)
- [ ] Auto token refresh

---

### 1.3. State Management

**Options:**
- Zustand (lightweight)
- React Query (server state)
- Context API (auth state)

**Recommended:** Zustand + React Query

**Stores:**
- `authStore.ts` - Authentication state
- `cartStore.ts` - Shopping cart (nếu cần)

**React Query Hooks:**
- `useCourses.ts`
- `useCourseDetail.ts`
- `useEnrollments.ts`
- `useUserProfile.ts`

---

## 2. CORE FEATURES INTEGRATION

### 2.1. Homepage Integration

**Route:** `/`

**Current State:**
- Đang dùng mock data
- Cần kết nối với API

**API Endpoints:**
- `GET /api/courses?featured=true` - Featured courses
- `GET /api/posts?type=EVENT&featured=true` - Featured events
- `GET /api/instructors?featured=true` - Featured instructors

**Components to Update:**
- `HomePage.tsx` - Main homepage
- `FeaturedCourses.tsx` - Featured courses section
- `FeaturedEvents.tsx` - Featured events section
- `FeaturedInstructors.tsx` - Featured instructors section

**Checklist:**
- [ ] Replace mock data với API calls
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states

---

### 2.2. Courses Listing & Detail

**Routes:**
- `/courses` - Danh sách khóa học
- `/courses/[slug]` - Chi tiết khóa học

**API Endpoints:**
- `GET /api/courses` - Danh sách (với filter, search, pagination)
- `GET /api/courses/:id` - Chi tiết khóa học
- `GET /api/courses/:id/modules` - Modules
- `GET /api/courses/:id/sessions` - Sessions
- `GET /api/courses/:id/materials` - Materials

**Components to Update:**
- `CoursesPage.tsx` - Danh sách khóa học
- `CourseDetailPage.tsx` - Chi tiết khóa học
- `CourseFilters.tsx` - Filter component
- `CourseCard.tsx` - Course card component

**Features:**
- Filter by target audience
- Filter by mode (group/one-on-one)
- Filter by price range
- Search courses
- Pagination
- Course detail với modules, sessions, materials

**Checklist:**
- [ ] Courses listing page
- [ ] Course detail page
- [ ] Filter functionality
- [ ] Search functionality
- [ ] Pagination
- [ ] Loading states
- [ ] Error handling

---

### 2.3. Course Booking & Enrollment

**Routes:**
- `/courses/[slug]/book` - Booking page
- `/trial/booking` - Trial booking (đã có, cần update)

**API Endpoints:**
- `POST /api/enrollments` - Đăng ký khóa học
- `GET /api/courses/:id/sessions` - Lịch học
- `POST /api/session-registrations` - Đăng ký buổi học

**Components:**
- `BookingPage.tsx` - Booking page
- `TrialBookingPage.tsx` - Trial booking (update)
- `SessionSelector.tsx` - Chọn buổi học
- `PackageSelector.tsx` - Chọn gói học (trial, standard, combo, 3m, 6m, 12m, 24m)

**Flow:**
1. User chọn khóa học
2. Chọn gói học (trial, standard, combo, v.v.)
3. Chọn buổi học (nếu có)
4. Điền thông tin
5. Tạo đơn hàng
6. Thanh toán

**Checklist:**
- [ ] Booking page
- [ ] Trial booking (update)
- [ ] Package selection
- [ ] Session selection
- [ ] Enrollment creation
- [ ] Form validation
- [ ] Success/Error handling

---

### 2.4. Payment Integration

**Routes:**
- `/checkout` - Checkout page
- `/checkout/success` - Payment success
- `/checkout/failed` - Payment failed

**API Endpoints:**
- `POST /api/orders` - Tạo đơn hàng
- `POST /api/orders/:id/pay` - Thanh toán
- `POST /api/payments/callback` - Payment callback

**Payment Gateways:**
- ZaloPay
- VNPay
- MoMo

**Components:**
- `CheckoutPage.tsx` - Checkout page
- `PaymentMethodSelector.tsx` - Chọn phương thức thanh toán
- `PaymentForm.tsx` - Form thanh toán
- `PaymentSuccess.tsx` - Success page
- `PaymentFailed.tsx` - Failed page

**Flow:**
1. User tạo đơn hàng
2. Chọn phương thức thanh toán
3. Redirect đến payment gateway
4. User thanh toán
5. Callback từ gateway
6. Update order status
7. Redirect về success/failed page

**Checklist:**
- [ ] Checkout page
- [ ] Payment method selection
- [ ] ZaloPay integration
- [ ] VNPay integration
- [ ] MoMo integration
- [ ] Payment callback handling
- [ ] Success/Failed pages
- [ ] Order status update

---

### 2.5. User Dashboard

**Route:** `/dashboard` (user dashboard, khác với CMS dashboard)

**Features:**
- Profile management
- My enrollments
- My schedule
- My progress
- Payment history
- Notifications

**API Endpoints:**
- `GET /api/users/me` - User profile
- `PUT /api/users/me` - Update profile
- `GET /api/enrollments?user_id=me` - My enrollments
- `GET /api/session-registrations?user_id=me` - My sessions
- `GET /api/orders?user_id=me` - My orders
- `GET /api/notifications` - My notifications

**Pages:**
- `/dashboard` - Dashboard home
- `/dashboard/profile` - Profile
- `/dashboard/enrollments` - My enrollments
- `/dashboard/schedule` - My schedule
- `/dashboard/progress` - My progress
- `/dashboard/orders` - Payment history
- `/dashboard/notifications` - Notifications

**Components:**
- `UserDashboard.tsx` - Dashboard home
- `UserProfile.tsx` - Profile page
- `MyEnrollments.tsx` - Enrollments list
- `MySchedule.tsx` - Schedule calendar
- `MyProgress.tsx` - Progress tracking
- `PaymentHistory.tsx` - Orders list
- `Notifications.tsx` - Notifications list

**Checklist:**
- [ ] User dashboard layout
- [ ] Profile page
- [ ] My enrollments
- [ ] My schedule
- [ ] My progress
- [ ] Payment history
- [ ] Notifications
- [ ] Protected routes

---

### 2.6. Authentication Pages

**Routes:**
- `/login` - Login page
- `/register` - Register page
- `/forgot-password` - Forgot password
- `/reset-password` - Reset password

**API Endpoints:**
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

**Components:**
- `LoginPage.tsx` - Login (đã có, cần update)
- `RegisterPage.tsx` - Register
- `ForgotPasswordPage.tsx` - Forgot password
- `ResetPasswordPage.tsx` - Reset password

**Features:**
- Email/Password login
- Email verification
- Password reset
- Remember me
- Social login (optional)

**Checklist:**
- [ ] Login page (update)
- [ ] Register page
- [ ] Forgot password
- [ ] Reset password
- [ ] Email verification
- [ ] Form validation
- [ ] Error handling

---

## 3. UI/UX IMPROVEMENTS

### 3.1. Loading States

**Components:**
- Skeleton loaders
- Loading spinners
- Progress indicators

**Checklist:**
- [ ] Skeleton loaders cho courses
- [ ] Loading spinners
- [ ] Progress indicators

---

### 3.2. Error Handling

**Components:**
- Error boundaries
- Error messages
- Retry mechanisms

**Checklist:**
- [ ] Error boundaries
- [ ] Error messages
- [ ] Retry buttons
- [ ] 404 pages
- [ ] 500 pages

---

### 3.3. Empty States

**Components:**
- Empty state illustrations
- Empty state messages
- CTA buttons

**Checklist:**
- [ ] Empty states cho courses
- [ ] Empty states cho enrollments
- [ ] Empty states cho orders

---

## 4. OPTIMIZATION

### 4.1. Performance

**Optimizations:**
- Image optimization
- Code splitting
- Lazy loading
- Caching strategies

**Checklist:**
- [ ] Image optimization (Next.js Image)
- [ ] Code splitting
- [ ] Lazy loading components
- [ ] React Query caching
- [ ] API response caching

---

### 4.2. SEO

**Features:**
- Meta tags
- Open Graph tags
- Structured data
- Sitemap

**Checklist:**
- [ ] Meta tags cho mỗi page
- [ ] Open Graph tags
- [ ] Structured data (JSON-LD)
- [ ] Sitemap generation
- [ ] robots.txt

---

## 5. TESTING

### 5.1. Component Tests

**Tools:** Jest + React Testing Library

**Checklist:**
- [ ] Component unit tests
- [ ] Form validation tests
- [ ] API integration tests (mock)

---

### 5.2. E2E Tests

**Tools:** Playwright/Cypress

**Critical Flows:**
- Course browsing
- Course booking
- Payment flow
- User dashboard

**Checklist:**
- [ ] Course browsing flow
- [ ] Course booking flow
- [ ] Payment flow
- [ ] User dashboard flow
- [ ] Authentication flow

---

## 6. CHECKLIST TỔNG KẾT

### Setup ✅
- [ ] API client configuration
- [ ] Authentication flow
- [ ] State management
- [ ] Protected routes

### Core Features ✅
- [ ] Homepage integration
- [ ] Courses listing & detail
- [ ] Course booking & enrollment
- [ ] Payment integration
- [ ] User dashboard
- [ ] Authentication pages

### UI/UX ✅
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states

### Optimization ✅
- [ ] Performance optimization
- [ ] SEO optimization

### Testing ✅
- [ ] Component tests
- [ ] E2E tests

---

## TÓM TẮT

**Phase 4: Public Frontend Integration** bao gồm:
1. ✅ Setup infrastructure
2. ✅ Core features integration
3. ✅ UI/UX improvements
4. ✅ Optimization
5. ✅ Testing

**Kết quả:** Website hoàn chỉnh, tích hợp với backend API, sẵn sàng cho Phase 5 (Testing & Deployment).

