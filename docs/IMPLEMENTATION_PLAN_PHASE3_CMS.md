# PHASE 3: CMS FRONTEND DEVELOPMENT

**Mục tiêu:** Xây dựng dashboard quản lý IPD8 đầy đủ chức năng

**Thời gian ước tính:** 3-4 tuần

---

## 📋 CHECKLIST

### Setup & Infrastructure
- [ ] Setup project structure
- [ ] Configure API client
- [ ] Setup authentication
- [ ] Setup routing
- [ ] Setup state management
- [ ] Setup UI components library

### Core Modules
- [ ] Dashboard Overview
- [ ] Quản lý Khóa học (Courses)
- [ ] Quản lý Giảng viên (Instructors)
- [ ] Quản lý Đăng ký (Enrollments)
- [ ] Quản lý Thanh toán (Payments)
- [ ] Quản lý Nội dung (Posts, Content)
- [ ] Quản lý Người dùng (Users)
- [ ] Báo cáo & Thống kê (Analytics)

---

## 1. SETUP & INFRASTRUCTURE

### 1.1. Project Structure

```
cms-frontend/
├── app/
│   ├── (root)/
│   │   └── page.tsx              # Dashboard home
│   ├── dashboard/
│   │   ├── courses/              # Quản lý khóa học
│   │   ├── instructors/         # Quản lý giảng viên
│   │   ├── enrollments/          # Quản lý đăng ký
│   │   ├── orders/               # Quản lý đơn hàng
│   │   ├── payments/            # Quản lý thanh toán
│   │   ├── posts/               # Quản lý bài viết
│   │   ├── users/                # Quản lý người dùng
│   │   ├── analytics/            # Báo cáo & thống kê
│   │   └── settings/             # Cài đặt hệ thống
│   └── login/
│       └── page.tsx
├── components/
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── layout.tsx
│   ├── courses/
│   │   ├── CourseList.tsx
│   │   ├── CourseForm.tsx
│   │   └── CourseDetail.tsx
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── api.ts                    # API client
│   ├── auth.ts                   # Auth utilities
│   └── utils.ts
└── hooks/
    ├── useAuth.ts
    ├── useCourses.ts
    └── ...
```

### 1.2. API Client Setup

**File:** `lib/api.ts`

```typescript
// Axios/Fetch client configuration
// Base URL: Từ environment variable (KHÔNG hardcode)
// Request/Response interceptors
// Error handling
// Token management
```

**Environment Variables:**
- `NEXT_PUBLIC_CMS_API_BASE_URL` - CMS Backend API URL (ví dụ: `http://localhost:3000/api`)
- **Lưu ý:** KHÔNG hardcode URL, phải đọc từ `.env.local` (development) hoặc `.env.production` (production)

### 1.3. Authentication

**File:** `lib/auth.ts`, `hooks/useAuth.ts`

- Login/Logout
- Token management
- Protected routes
- Role-based access

---

## 2. CORE MODULES DEVELOPMENT

### 2.1. Dashboard Overview

**Route:** `/dashboard`

**Features:**
- Statistics cards (tổng số khóa học, học viên, doanh thu, v.v.)
- Recent enrollments
- Recent orders
- Quick actions
- Charts (revenue, enrollments over time)

**Components:**
- `DashboardStats.tsx`
- `RecentEnrollments.tsx`
- `RecentOrders.tsx`
- `RevenueChart.tsx`

**Checklist:**
- [ ] Dashboard layout
- [ ] Statistics cards
- [ ] Recent activities
- [ ] Charts integration (recharts/chart.js)
- [ ] Quick actions

---

### 2.2. Quản lý Khóa học (Courses)

**Route:** `/dashboard/courses`

**Features:**
- Danh sách khóa học (với filter, search, pagination)
- Tạo/Sửa/Xóa khóa học
- Quản lý modules
- Quản lý sessions
- Quản lý materials
- Upload thumbnail, video

**Pages:**
- `/dashboard/courses` - Danh sách
- `/dashboard/courses/new` - Tạo mới
- `/dashboard/courses/[id]` - Chi tiết
- `/dashboard/courses/[id]/edit` - Chỉnh sửa
- `/dashboard/courses/[id]/modules` - Quản lý modules
- `/dashboard/courses/[id]/sessions` - Quản lý sessions
- `/dashboard/courses/[id]/materials` - Quản lý tài liệu

**Components:**
- `CourseList.tsx` - Danh sách với filter, search
- `CourseForm.tsx` - Form tạo/sửa
- `CourseDetail.tsx` - Chi tiết khóa học
- `ModuleManager.tsx` - Quản lý modules
- `SessionManager.tsx` - Quản lý sessions
- `MaterialManager.tsx` - Quản lý materials
- `CourseFilters.tsx` - Filter component

**Checklist:**
- [ ] Course list page
- [ ] Course form (create/edit)
- [ ] Course detail page
- [ ] Module management
- [ ] Session management
- [ ] Material management
- [ ] Filter & search
- [ ] Pagination
- [ ] Image/video upload
- [ ] SEO fields

---

### 2.3. Quản lý Giảng viên (Instructors)

**Route:** `/dashboard/instructors`

**Features:**
- Danh sách giảng viên
- Tạo/Sửa/Xóa giảng viên
- Upload avatar
- Quản lý credentials, achievements
- Xem khóa học của giảng viên

**Pages:**
- `/dashboard/instructors` - Danh sách
- `/dashboard/instructors/new` - Tạo mới
- `/dashboard/instructors/[id]` - Chi tiết
- `/dashboard/instructors/[id]/edit` - Chỉnh sửa
- `/dashboard/instructors/[id]/courses` - Khóa học

**Components:**
- `InstructorList.tsx`
- `InstructorForm.tsx`
- `InstructorDetail.tsx`
- `InstructorCourses.tsx`

**Checklist:**
- [ ] Instructor list page
- [ ] Instructor form
- [ ] Instructor detail page
- [ ] Avatar upload
- [ ] Credentials management
- [ ] Achievements management
- [ ] Featured toggle

---

### 2.4. Quản lý Đăng ký (Enrollments)

**Route:** `/dashboard/enrollments`

**Features:**
- Danh sách đăng ký (với filter theo status, course, user)
- Chi tiết đăng ký
- Cập nhật trạng thái (pending → active → completed)
- Xem tiến độ học tập
- Quản lý gói học (trial, standard, combo, 3m, 6m, 12m, 24m)

**Pages:**
- `/dashboard/enrollments` - Danh sách
- `/dashboard/enrollments/[id]` - Chi tiết
- `/dashboard/enrollments/[id]/progress` - Tiến độ

**Components:**
- `EnrollmentList.tsx`
- `EnrollmentDetail.tsx`
- `EnrollmentProgress.tsx`
- `EnrollmentFilters.tsx`
- `StatusBadge.tsx`

**Checklist:**
- [ ] Enrollment list page
- [ ] Enrollment detail page
- [ ] Status management
- [ ] Progress tracking
- [ ] Filter by status, course, user
- [ ] Package type management

---

### 2.5. Quản lý Thanh toán (Payments)

**Route:** `/dashboard/orders`, `/dashboard/payments`

**Features:**
- Danh sách đơn hàng (với filter theo status, date range)
- Chi tiết đơn hàng
- Xử lý thanh toán
- Hoàn tiền (refund)
- Export báo cáo
- Thống kê doanh thu

**Pages:**
- `/dashboard/orders` - Danh sách đơn hàng
- `/dashboard/orders/[id]` - Chi tiết đơn hàng
- `/dashboard/payments` - Danh sách thanh toán
- `/dashboard/payments/[id]` - Chi tiết thanh toán

**Components:**
- `OrderList.tsx`
- `OrderDetail.tsx`
- `PaymentList.tsx`
- `PaymentDetail.tsx`
- `RefundModal.tsx`
- `RevenueStats.tsx`

**Checklist:**
- [ ] Order list page
- [ ] Order detail page
- [ ] Payment list page
- [ ] Payment detail page
- [ ] Status management
- [ ] Refund functionality
- [ ] Export reports
- [ ] Revenue statistics

---

### 2.6. Quản lý Nội dung (Posts)

**Route:** `/dashboard/posts`

**Features:**
- Danh sách bài viết (với filter theo type, status)
- Tạo/Sửa/Xóa bài viết
- Rich text editor
- Upload thumbnail
- SEO fields
- Tags management
- Lên lịch xuất bản

**Pages:**
- `/dashboard/posts` - Danh sách
- `/dashboard/posts/new` - Tạo mới
- `/dashboard/posts/[id]` - Chi tiết
- `/dashboard/posts/[id]/edit` - Chỉnh sửa

**Components:**
- `PostList.tsx`
- `PostForm.tsx`
- `PostDetail.tsx`
- `RichTextEditor.tsx` - TinyMCE hoặc tương tự
- `TagSelector.tsx`
- `SEOPopup.tsx`

**Checklist:**
- [ ] Post list page
- [ ] Post form
- [ ] Post detail page
- [ ] Rich text editor
- [ ] Image upload
- [ ] SEO fields
- [ ] Tags management
- [ ] Post types (NEWS, EVENT, BLOG, FAQ, POLICY)
- [ ] Schedule publish

---

### 2.7. Quản lý Người dùng (Users)

**Route:** `/dashboard/users`

**Features:**
- Danh sách người dùng (với filter theo role, status)
- Chi tiết người dùng
- Tạo/Sửa/Xóa người dùng
- Xem lịch sử đăng ký
- Xem tiến độ học tập
- Quản lý quyền truy cập

**Pages:**
- `/dashboard/users` - Danh sách
- `/dashboard/users/new` - Tạo mới
- `/dashboard/users/[id]` - Chi tiết
- `/dashboard/users/[id]/edit` - Chỉnh sửa
- `/dashboard/users/[id]/enrollments` - Đăng ký
- `/dashboard/users/[id]/progress` - Tiến độ

**Components:**
- `UserList.tsx`
- `UserForm.tsx`
- `UserDetail.tsx`
- `UserEnrollments.tsx`
- `UserProgress.tsx`
- `RoleSelector.tsx`

**Checklist:**
- [ ] User list page
- [ ] User form
- [ ] User detail page
- [ ] Role management
- [ ] Status management
- [ ] Email/Phone verification
- [ ] User enrollments view
- [ ] User progress view

---

### 2.8. Báo cáo & Thống kê (Analytics)

**Route:** `/dashboard/analytics`

**Features:**
- Dashboard tổng quan
- Báo cáo khóa học
- Báo cáo đăng ký
- Báo cáo doanh thu
- Báo cáo người dùng
- Export reports (PDF, Excel)

**Pages:**
- `/dashboard/analytics` - Dashboard
- `/dashboard/analytics/courses` - Báo cáo khóa học
- `/dashboard/analytics/enrollments` - Báo cáo đăng ký
- `/dashboard/analytics/revenue` - Báo cáo doanh thu
- `/dashboard/analytics/users` - Báo cáo người dùng

**Components:**
- `AnalyticsDashboard.tsx`
- `CourseAnalytics.tsx`
- `EnrollmentAnalytics.tsx`
- `RevenueAnalytics.tsx`
- `UserAnalytics.tsx`
- `ChartComponents.tsx` - Recharts/Chart.js
- `ExportButton.tsx`

**Checklist:**
- [ ] Analytics dashboard
- [ ] Course analytics
- [ ] Enrollment analytics
- [ ] Revenue analytics
- [ ] User analytics
- [ ] Charts integration
- [ ] Date range filters
- [ ] Export functionality

---

## 3. UI COMPONENTS

### 3.1. Shared Components

**Components:**
- `DataTable.tsx` - Table với sort, filter, pagination
- `Modal.tsx` - Modal dialog
- `ConfirmDialog.tsx` - Confirmation dialog
- `FormField.tsx` - Form input wrapper
- `Select.tsx` - Dropdown select
- `DatePicker.tsx` - Date picker
- `FileUpload.tsx` - File upload component
- `ImageUpload.tsx` - Image upload với preview
- `StatusBadge.tsx` - Status badge
- `LoadingSpinner.tsx` - Loading indicator
- `EmptyState.tsx` - Empty state

**Checklist:**
- [ ] DataTable component
- [ ] Modal components
- [ ] Form components
- [ ] Upload components
- [ ] Status badges
- [ ] Loading states
- [ ] Empty states

---

## 4. STATE MANAGEMENT

### 4.1. State Management Solution

**Options:**
- Zustand (lightweight)
- Redux Toolkit (nếu cần phức tạp)
- React Query (cho server state)

**Recommended:** Zustand + React Query

### 4.2. Stores

**Stores:**
- `authStore.ts` - Authentication state
- `courseStore.ts` - Course state (optional)
- `uiStore.ts` - UI state (sidebar, modals)

### 4.3. React Query Hooks

**Hooks:**
- `useCourses.ts` - Courses queries/mutations
- `useEnrollments.ts` - Enrollments queries/mutations
- `useOrders.ts` - Orders queries/mutations
- `useUsers.ts` - Users queries/mutations

---

## 5. ROUTING & NAVIGATION

### 5.1. Protected Routes

**File:** `middleware.ts` hoặc `components/AuthGuard.tsx`

- Check authentication
- Redirect to login if not authenticated
- Role-based route protection

### 5.2. Navigation

**File:** `components/dashboard/sidebar.tsx`

- Menu items
- Active route highlighting
- Role-based menu items

---

## 6. TESTING

### 6.1. Component Tests

**Tools:** Jest + React Testing Library

**Checklist:**
- [ ] Component unit tests
- [ ] Form validation tests
- [ ] API integration tests (mock)

### 6.2. E2E Tests

**Tools:** Playwright/Cypress

**Checklist:**
- [ ] Login flow
- [ ] Course creation flow
- [ ] Enrollment management flow
- [ ] Payment processing flow

---

## 7. CHECKLIST TỔNG KẾT

### Setup ✅
- [ ] Project structure
- [ ] API client
- [ ] Authentication
- [ ] Routing
- [ ] State management
- [ ] UI components

### Core Modules ✅
- [ ] Dashboard Overview
- [ ] Quản lý Khóa học
- [ ] Quản lý Giảng viên
- [ ] Quản lý Đăng ký
- [ ] Quản lý Thanh toán
- [ ] Quản lý Nội dung
- [ ] Quản lý Người dùng
- [ ] Báo cáo & Thống kê

### Testing ✅
- [ ] Component tests
- [ ] E2E tests

---

## TÓM TẮT

**Phase 3: CMS Frontend Development** bao gồm:
1. ✅ Setup infrastructure
2. ✅ Core modules (8 modules)
3. ✅ UI components
4. ✅ State management
5. ✅ Testing

**Kết quả:** CMS Dashboard hoàn chỉnh, sẵn sàng cho Phase 5 (Testing & Deployment).

