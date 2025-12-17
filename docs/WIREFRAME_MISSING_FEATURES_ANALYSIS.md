# PHÂN TÍCH CHỨC NĂNG CÒN THIẾU TỪ WIREFRAME IPD8

**Ngày tạo:** 2025-01-XX  
**Phiên bản:** 1.0  
**Mục đích:** Tài liệu phân tích các chức năng còn thiếu khi so sánh wireframe với codebase hiện tại

---

## 📋 MỤC LỤC

1. [Tổng Quan](#1-tổng-quan)
2. [Chức Năng Thiếu Hoàn Toàn](#2-chức-năng-thiếu-hoàn-toàn)
3. [Chức Năng Cần Cải Thiện](#3-chức-năng-cần-cải-thiện)
4. [Chức Năng Nice To Have](#4-chức-năng-nice-to-have)
5. [Chi Tiết Từng Chức Năng](#5-chi-tiết-từng-chức-năng)
6. [Kế Hoạch Triển Khai](#6-kế-hoạch-triển-khai)

---

## 1. TỔNG QUAN

### 1.1. Mục Đích Phân Tích

Tài liệu này phân tích file wireframe `IPD8_Wireframe Update.pdf` và so sánh với codebase hiện tại để xác định các chức năng còn thiếu hoặc chưa hoàn thiện.

### 1.2. Phạm Vi Phân Tích

- ✅ **Đã kiểm tra:** Wireframe PDF, codebase frontend, database schema
- ✅ **Đã so sánh:** Routes, components, pages với wireframe
- ✅ **Đã xác định:** 25+ chức năng cần bổ sung/cải thiện

### 1.3. Thống Kê

| Loại | Số Lượng | Mô Tả |
|------|----------|-------|
| **Thiếu hoàn toàn** | 7 | Chưa có file/page |
| **Cần cải thiện** | 5 | Có nhưng chưa đầy đủ |
| **Nice to have** | 13 | Tính năng bổ sung |
| **TỔNG CỘNG** | **25** | Chức năng cần xử lý |

---

## 2. CHỨC NĂNG THIẾU HOÀN TOÀN

### 2.1. Trang Đăng Ký (Register Page) ⚠️ **ƯU TIÊN CAO**

**Trạng thái:** ❌ Chưa có file  
**Route:** `/register`  
**Wireframe:** Có form đăng ký đầy đủ

**Yêu cầu từ wireframe:**
- Form đăng ký với các trường:
  - Họ và tên*
  - Email*
  - Số điện thoại*
  - Mật khẩu*
  - Nhập lại mật khẩu*
- Nút "XÁC NHẬN"
- Link "BẠN ĐÃ CÓ TÀI KHOẢN? ĐĂNG NHẬP"
- Validation form

**File cần tạo:**
```
Projects/public-frontend/src/app/register/page.tsx
```

**Database liên quan:**
- Bảng `users` (tái cấu trúc)
- Cần validate: email unique, phone unique

---

### 2.2. Trang Chính Sách (Policies Page) ⚠️ **ƯU TIÊN CAO**

**Trạng thái:** ❌ Chưa có file  
**Route:** `/policies` (có trong ROUTES nhưng chưa có page)  
**Wireframe:** Có section "FAQs & CHÍNH SÁCH" với dropdown

**Yêu cầu từ wireframe:**
- Bảo mật thông tin
- Thanh toán
- Quy định học viên
- Quy trình tiếp nhận giải quyết và khiếu nại

**File cần tạo:**
```
Projects/public-frontend/src/app/policies/page.tsx
```

**Database liên quan:**
- Bảng `faq_categories`, `faq_questions` (có thể dùng cho policies)
- Có thể tạo bảng `policies` riêng hoặc dùng posts với type='policy'

---

### 2.3. Dashboard - Tiến Độ Học (Progress) ⚠️ **ƯU TIÊN CAO**

**Trạng thái:** ⚠️ Có menu nhưng chỉ placeholder  
**Route:** `/dashboard` (tab: progress)  
**Wireframe:** Có section "Tiến độ học"

**Yêu cầu từ wireframe:**
- Hiển thị tiến độ học tập chi tiết
- Theo dõi theo course, module, session
- Progress bar/percentage
- Danh sách bài học đã hoàn thành/chưa hoàn thành

**File cần cập nhật:**
```
Projects/public-frontend/src/app/dashboard/page.tsx
```

**Database liên quan:**
- Bảng `progress` (tạo mới)
- Bảng `enrollments`
- Bảng `course_modules`, `course_sessions`

---

### 2.4. Dashboard - Thanh Toán & Gói Học (Payment) ⚠️ **ƯU TIÊN CAO**

**Trạng thái:** ⚠️ Có menu nhưng chỉ placeholder  
**Route:** `/dashboard` (tab: payment)  
**Wireframe:** Có section "Thanh toán & Gói học"

**Yêu cầu từ wireframe:**
- Lịch sử thanh toán
- Danh sách gói học đã mua
- Trạng thái thanh toán (đã thanh toán, chưa thanh toán, đang xử lý)
- Invoice/Receipt
- Chi tiết từng đơn hàng

**File cần cập nhật:**
```
Projects/public-frontend/src/app/dashboard/page.tsx
```

**Database liên quan:**
- Bảng `orders` (tạo mới - IPD8)
- Bảng `order_items` (tạo mới)
- Bảng `payments` (tạo mới)

---

### 2.5. Dashboard - Thông Báo (Notifications) ⚠️ **ƯU TIÊN CAO**

**Trạng thái:** ⚠️ Có menu nhưng chỉ placeholder  
**Route:** `/dashboard` (tab: notifications)  
**Wireframe:** Có section "Thông báo"

**Yêu cầu từ wireframe:**
- Danh sách thông báo
- Đánh dấu đã đọc/chưa đọc
- Filter theo loại thông báo
- Thời gian thông báo
- Link đến nội dung liên quan

**File cần cập nhật:**
```
Projects/public-frontend/src/app/dashboard/page.tsx
```

**Database liên quan:**
- Bảng `notifications` (tạo mới)
- Các loại: course_update, payment, session_reminder, system

---

### 2.6. Dashboard - Hỗ Trợ (Support) ⚠️ **ƯU TIÊN CAO**

**Trạng thái:** ⚠️ Có menu nhưng chỉ placeholder  
**Route:** `/dashboard` (tab: support)  
**Wireframe:** Có section "Hỗ trợ"

**Yêu cầu từ wireframe:**
- Form gửi ticket hỗ trợ
- Lịch sử tickets
- Trạng thái ticket (mới, đang xử lý, đã giải quyết)
- Chat/messaging với support team

**File cần cập nhật:**
```
Projects/public-frontend/src/app/dashboard/page.tsx
```

**Database liên quan:**
- Có thể dùng bảng `contact_forms` (tái cấu trúc) với status
- Hoặc tạo bảng `support_tickets` riêng

---

### 2.7. Form Đăng Ký Tư Vấn (Consultation Form) ⚠️ **ƯU TIÊN CAO**

**Trạng thái:** ❌ Chưa có component riêng  
**Wireframe:** Có form "ĐĂNG KÝ TƯ VẤN" ở nhiều trang

**Yêu cầu từ wireframe:**
- Họ và tên*
- Email*
- Số điện thoại*
- Địa chỉ*
- Khóa học* (dropdown)
- Hình thức học* (dropdown)
- Lời nhắn*
- Nút "GỬI THÔNG TIN"

**File cần tạo:**
```
Projects/public-frontend/src/components/shared/consultation-form.tsx
```

**Database liên quan:**
- Bảng `contact_forms` (tái cấu trúc)
- Các trường: course_interest, study_mode, message

---

## 3. CHỨC NĂNG CẦN CẢI THIỆN

### 3.1. Trang Chủ - Countdown Timer

**Trạng thái:** ⚠️ Cần kiểm tra  
**Wireframe:** Có countdown timer với format: `00:00:00` (ngày:giờ:phút:giây)

**Yêu cầu:**
- Component countdown cho sự kiện/khuyến mãi
- Hiển thị: Days, Hours, Minutes, Seconds
- Auto-update mỗi giây
- Responsive design

**File cần kiểm tra/cập nhật:**
```
Projects/public-frontend/src/app/page.tsx
Projects/public-frontend/src/components/shared/countdown-timer.tsx (cần tạo)
```

---

### 3.2. Trang Chủ - Đánh Giá Chuyên Gia (Expert Reviews)

**Trạng thái:** ⚠️ Cần kiểm tra  
**Wireframe:** Có section "ĐÁNH GIÁ CHUYÊN GIA"

**Yêu cầu:**
- Hiển thị reviews/testimonials về chuyên gia
- Rating stars
- Tên người đánh giá
- Nội dung đánh giá
- Carousel/slider

**File cần kiểm tra/cập nhật:**
```
Projects/public-frontend/src/app/page.tsx
Projects/public-frontend/src/components/shared/expert-reviews.tsx (cần tạo)
```

**Database liên quan:**
- Có thể dùng bảng `posts` với type='review'
- Hoặc tạo bảng `expert_reviews` riêng

---

### 3.3. Trang Lịch Học Công Khai - Đăng Ký Buổi Học

**Trạng thái:** ⚠️ Cần kiểm tra  
**Wireframe:** Có nút đăng ký cho từng buổi học trong calendar

**Yêu cầu:**
- Modal/form đăng ký session từ trang public schedule
- Validation: đã đăng nhập, đã mua gói học
- Hiển thị trạng thái: còn trống, đã full
- Xác nhận đăng ký

**File cần kiểm tra/cập nhật:**
```
Projects/public-frontend/src/app/schedule/page.tsx
Projects/public-frontend/src/components/schedule/session-registration-modal.tsx (cần tạo)
```

**Database liên quan:**
- Bảng `session_registrations` (tạo mới)
- Bảng `enrollments` (kiểm tra user đã mua gói chưa)

---

### 3.4. Trang Gói Học - Bộ Lọc Nâng Cao

**Trạng thái:** ⚠️ Cần cải thiện  
**Wireframe:** Có filter theo nhiều tiêu chí

**Yêu cầu:**
- Filter theo độ tuổi (mẹ bầu, 0-12 tháng, 13-24 tháng)
- Filter theo giá
- Filter theo thời lượng
- Filter theo chuyên gia
- Sort (giá, thời lượng, mới nhất)

**File cần cập nhật:**
```
Projects/public-frontend/src/app/courses/page.tsx
Projects/public-frontend/src/components/courses/CourseFilter.tsx (cần cải thiện)
```

---

### 3.5. Trang Chủ - Tìm Kiếm Gói Học

**Trạng thái:** ⚠️ Cần kiểm tra  
**Wireframe:** Có search box "Tìm kiếm gói học..." ở navbar

**Yêu cầu:**
- Search functionality với autocomplete
- Tìm kiếm theo tên gói học, mô tả
- Hiển thị kết quả real-time
- Link đến trang kết quả tìm kiếm

**File cần kiểm tra/cập nhật:**
```
Projects/public-frontend/src/components/layouts/navbar.tsx
Projects/public-frontend/src/components/shared/search-box.tsx (cần cải thiện)
```

---

## 4. CHỨC NĂNG NICE TO HAVE

### 4.1. Email/Phone Verification

**Database có:** `email_verified`, `phone_verified` trong users table  
**Cần:** Flow xác thực email và số điện thoại

**Yêu cầu:**
- Gửi OTP qua email/SMS
- Verify code
- Update status trong database
- Resend OTP

**Files cần tạo:**
```
Projects/public-frontend/src/app/verify-email/page.tsx
Projects/public-frontend/src/app/verify-phone/page.tsx
Projects/public-frontend/src/components/auth/otp-verification.tsx
```

---

### 4.2. Quên Mật Khẩu (Forgot Password)

**Wireframe:** Không thấy rõ  
**Cần:** Trang reset password

**Yêu cầu:**
- Form nhập email
- Gửi link reset password
- Trang đặt lại mật khẩu mới
- Validation token

**Files cần tạo:**
```
Projects/public-frontend/src/app/forgot-password/page.tsx
Projects/public-frontend/src/app/reset-password/[token]/page.tsx
```

---

### 4.3. Đổi Mật Khẩu Trong Dashboard

**Cần:** Form đổi mật khẩu trong phần profile

**Yêu cầu:**
- Mật khẩu cũ*
- Mật khẩu mới*
- Xác nhận mật khẩu mới*
- Validation

**File cần cập nhật:**
```
Projects/public-frontend/src/app/dashboard/page.tsx (section profile)
```

---

### 4.4. Payment Gateway Integration

**Database có:** Bảng `payments`, `orders`  
**Cần:** Tích hợp payment gateway

**Yêu cầu:**
- VNPay integration
- MoMo integration
- Bank transfer
- Payment status tracking
- Webhook handling

**Files cần tạo:**
```
Projects/public-frontend/src/lib/payment/vnpay.ts
Projects/public-frontend/src/lib/payment/momo.ts
Projects/public-frontend/src/app/payment/callback/page.tsx
```

---

### 4.5. Session Registration từ Dashboard

**Database có:** Bảng `session_registrations`  
**Cần:** Chức năng đăng ký/hủy buổi học từ dashboard

**Yêu cầu:**
- Đăng ký buổi học
- Hủy đăng ký
- Xem lịch sử đăng ký
- Notification khi đăng ký thành công

**File cần cập nhật:**
```
Projects/public-frontend/src/app/dashboard/page.tsx (section schedule)
```

---

### 4.6. Dashboard - Upload Avatar với Validation

**Wireframe có:** Upload avatar với validation (max 1MB, JPEG/PNG)  
**Hiện tại:** Có UI nhưng cần kiểm tra validation và upload logic

**Yêu cầu:**
- Validate file size (max 1MB)
- Validate file type (JPEG, PNG only)
- Preview image trước khi upload
- Upload to server
- Update database

**File cần cập nhật:**
```
Projects/public-frontend/src/app/dashboard/page.tsx (section profile)
```

---

### 4.7. Dashboard - Tài Liệu (Materials) Integration

**Wireframe có:** Section "TÀI LIỆU" với danh sách tài liệu có thể tải  
**Hiện tại:** Có mock data nhưng cần tích hợp với API

**Yêu cầu:**
- Lấy danh sách materials từ API
- Filter theo course
- Download file
- Hiển thị file type, size
- Progress khi download

**File cần cập nhật:**
```
Projects/public-frontend/src/app/dashboard/page.tsx (section packages)
```

**Database liên quan:**
- Bảng `materials` (tạo mới)
- Relationship với `courses`, `course_modules`

---

### 4.8. Trang Lịch Học - Legend và Trạng Thái Lớp

**Wireframe có:** Legend "Lớp full" và "Còn trống"  
**Hiện tại:** Có trong code nhưng cần đảm bảo hiển thị đúng

**Yêu cầu:**
- Hiển thị legend rõ ràng
- Color coding: full (pink), available (blue)
- Update real-time khi có đăng ký mới

**File cần kiểm tra:**
```
Projects/public-frontend/src/app/schedule/page.tsx
Projects/public-frontend/src/app/dashboard/page.tsx (section schedule)
```

---

### 4.9. Trang Chủ - Section "Tại sao chọn IPD8?"

**Wireframe có:** Section này với nội dung mô tả  
**Cần:** Kiểm tra xem đã có đầy đủ nội dung chưa

**File cần kiểm tra:**
```
Projects/public-frontend/src/app/page.tsx
```

---

### 4.10. Trang Chủ - Section "Đội ngũ chuyên gia"

**Wireframe có:** Section hiển thị danh sách chuyên gia  
**Cần:** Kiểm tra xem đã có carousel/slider chưa

**File cần kiểm tra:**
```
Projects/public-frontend/src/app/page.tsx
Projects/public-frontend/src/components/shared/experts-carousel.tsx
```

---

### 4.11. Trang Chủ - Section "Các gói học nổi bật"

**Wireframe có:** Section này  
**Cần:** Kiểm tra xem đã hiển thị đúng format chưa

**File cần kiểm tra:**
```
Projects/public-frontend/src/app/page.tsx
```

---

### 4.12. Dashboard - Chi Tiết Gói Học

**Wireframe có:** Trang chi tiết gói học trong dashboard  
**Hiện tại:** Có route `/dashboard/courses/[id]` nhưng cần kiểm tra nội dung

**Yêu cầu:**
- Hiển thị đầy đủ thông tin gói học
- Tài liệu liên quan
- Lịch học của gói
- Tiến độ học tập
- Nút "Chi tiết gói học" từ dashboard

**File cần kiểm tra/cập nhật:**
```
Projects/public-frontend/src/app/dashboard/courses/[id]/page.tsx
```

---

### 4.13. Trang Tin Tức/Sự Kiện Riêng

**Hiện tại:** `/blog` với tab  
**Wireframe:** Có trang "Tin tức chung" và "Sự kiện" riêng

**Yêu cầu:**
- Có thể giữ tab hoặc tách thành 2 trang riêng
- Filter theo category
- Pagination
- Featured posts

**File cần kiểm tra:**
```
Projects/public-frontend/src/app/blog/page.tsx
```

---

## 5. CHI TIẾT TỪNG CHỨC NĂNG

### 5.1. Register Page - Chi Tiết

**Components cần:**
- Form validation (email format, phone format, password strength)
- Password match validation
- Error handling
- Success message
- Redirect to login after success

**API endpoints cần:**
- `POST /api/auth/register`
- `POST /api/auth/verify-email` (nếu có email verification)

**Validation rules:**
- Email: valid format, unique
- Phone: valid format (VN), unique
- Password: min 8 chars, có chữ hoa, số, ký tự đặc biệt
- Password confirm: match với password

---

### 5.2. Policies Page - Chi Tiết

**Nội dung cần:**
1. **Bảo mật thông tin:**
   - Chính sách thu thập thông tin
   - Chính sách sử dụng thông tin
   - Chính sách bảo vệ thông tin

2. **Thanh toán:**
   - Phương thức thanh toán
   - Chính sách hoàn tiền
   - Chính sách đổi/trả

3. **Quy định học viên:**
   - Quy định tham gia khóa học
   - Quy định về điểm danh
   - Quy định về tài liệu

4. **Quy trình tiếp nhận giải quyết và khiếu nại:**
   - Cách thức khiếu nại
   - Thời gian xử lý
   - Liên hệ hỗ trợ

**Có thể dùng:**
- Posts với type='policy'
- Hoặc tạo bảng `policies` riêng

---

### 5.3. Dashboard Progress - Chi Tiết

**Hiển thị:**
- Progress overview (tổng quan)
- Progress by course (theo từng khóa học)
- Progress by module (theo từng module)
- Completed sessions (buổi học đã hoàn thành)
- Upcoming sessions (buổi học sắp tới)
- Progress charts/graphs

**Components cần:**
- ProgressBar component
- CourseProgressCard component
- SessionList component
- Chart component (nếu cần)

**API endpoints cần:**
- `GET /api/dashboard/progress`
- `GET /api/dashboard/progress/:courseId`

---

### 5.4. Dashboard Payment - Chi Tiết

**Hiển thị:**
- Payment history table
- Order list
- Payment status badges
- Invoice/Receipt download
- Payment methods used

**Components cần:**
- PaymentHistoryTable component
- OrderCard component
- InvoiceModal component
- PaymentStatusBadge component

**API endpoints cần:**
- `GET /api/dashboard/payments`
- `GET /api/dashboard/orders`
- `GET /api/dashboard/invoice/:orderId`

---

### 5.5. Dashboard Notifications - Chi Tiết

**Hiển thị:**
- Notification list (mới nhất trước)
- Unread count badge
- Mark as read/unread
- Filter by type
- Delete notification
- Link to related content

**Components cần:**
- NotificationList component
- NotificationItem component
- NotificationFilter component
- NotificationBadge component

**API endpoints cần:**
- `GET /api/dashboard/notifications`
- `PUT /api/dashboard/notifications/:id/read`
- `DELETE /api/dashboard/notifications/:id`

---

### 5.6. Dashboard Support - Chi Tiết

**Hiển thị:**
- Support ticket form
- Ticket history
- Ticket status
- Messages/chat history
- Attachments

**Components cần:**
- SupportTicketForm component
- TicketList component
- TicketDetail component
- MessageThread component

**API endpoints cần:**
- `POST /api/support/tickets`
- `GET /api/support/tickets`
- `GET /api/support/tickets/:id`
- `POST /api/support/tickets/:id/messages`

---

### 5.7. Consultation Form - Chi Tiết

**Form fields:**
- Họ và tên* (text input)
- Email* (email input)
- Số điện thoại* (phone input)
- Địa chỉ* (text input)
- Khóa học* (select dropdown)
- Hình thức học* (select: online/offline)
- Lời nhắn* (textarea)

**Validation:**
- Tất cả fields required
- Email format
- Phone format (VN)

**Components cần:**
- ConsultationForm component (reusable)
- Có thể dùng ở: homepage, course pages, contact page

**API endpoints cần:**
- `POST /api/contact/consultation`

---

## 6. KẾ HOẠCH TRIỂN KHAI

### 6.1. Phase 1: Ưu Tiên Cao (Tuần 1-2)

1. ✅ **Register Page**
   - Tạo file `src/app/register/page.tsx`
   - Form validation
   - API integration
   - Testing

2. ✅ **Policies Page**
   - Tạo file `src/app/policies/page.tsx`
   - Content từ CMS hoặc static
   - SEO optimization

3. ✅ **Consultation Form Component**
   - Tạo component reusable
   - Integrate vào các trang cần thiết
   - API integration

4. ✅ **Dashboard Progress**
   - Implement progress display
   - API integration
   - Charts/graphs (optional)

5. ✅ **Dashboard Payment**
   - Payment history table
   - Order list
   - Invoice download

6. ✅ **Dashboard Notifications**
   - Notification list
   - Mark as read
   - Real-time updates (optional)

7. ✅ **Dashboard Support**
   - Support ticket form
   - Ticket history
   - Basic messaging

---

### 6.2. Phase 2: Cải Thiện (Tuần 3-4)

1. ✅ **Countdown Timer**
   - Component countdown
   - Integrate vào homepage

2. ✅ **Expert Reviews**
   - Reviews section
   - Carousel/slider

3. ✅ **Session Registration**
   - Modal/form đăng ký
   - Validation
   - API integration

4. ✅ **Course Filter**
   - Advanced filters
   - Sort options

5. ✅ **Search Functionality**
   - Search box với autocomplete
   - Search results page

---

### 6.3. Phase 3: Nice To Have (Tuần 5+)

1. ✅ **Email/Phone Verification**
   - OTP flow
   - Verification pages

2. ✅ **Forgot Password**
   - Reset password flow
   - Email sending

3. ✅ **Change Password**
   - Form trong dashboard
   - Validation

4. ✅ **Payment Gateway**
   - VNPay integration
   - MoMo integration
   - Webhook handling

5. ✅ **Avatar Upload**
   - File upload
   - Validation
   - Image processing

6. ✅ **Materials Integration**
   - API integration
   - Download functionality

---

## 7. CHECKLIST TRIỂN KHAI

### 7.1. Frontend Files Cần Tạo

- [ ] `src/app/register/page.tsx`
- [ ] `src/app/policies/page.tsx`
- [ ] `src/app/verify-email/page.tsx`
- [ ] `src/app/verify-phone/page.tsx`
- [ ] `src/app/forgot-password/page.tsx`
- [ ] `src/app/reset-password/[token]/page.tsx`
- [ ] `src/app/payment/callback/page.tsx`
- [ ] `src/components/shared/consultation-form.tsx`
- [ ] `src/components/shared/countdown-timer.tsx`
- [ ] `src/components/shared/expert-reviews.tsx`
- [ ] `src/components/auth/otp-verification.tsx`
- [ ] `src/components/schedule/session-registration-modal.tsx`
- [ ] `src/components/dashboard/progress-chart.tsx`
- [ ] `src/components/dashboard/payment-history-table.tsx`
- [ ] `src/components/dashboard/notification-list.tsx`
- [ ] `src/components/dashboard/support-ticket-form.tsx`
- [ ] `src/lib/payment/vnpay.ts`
- [ ] `src/lib/payment/momo.ts`

### 7.2. Backend API Endpoints Cần Tạo

- [ ] `POST /api/auth/register`
- [ ] `POST /api/auth/verify-email`
- [ ] `POST /api/auth/verify-phone`
- [ ] `POST /api/auth/forgot-password`
- [ ] `POST /api/auth/reset-password`
- [ ] `GET /api/dashboard/progress`
- [ ] `GET /api/dashboard/payments`
- [ ] `GET /api/dashboard/orders`
- [ ] `GET /api/dashboard/notifications`
- [ ] `PUT /api/dashboard/notifications/:id/read`
- [ ] `POST /api/support/tickets`
- [ ] `GET /api/support/tickets`
- [ ] `POST /api/contact/consultation`
- [ ] `POST /api/sessions/:id/register`
- [ ] `POST /api/payment/vnpay/create`
- [ ] `POST /api/payment/vnpay/callback`

### 7.3. Database Migrations Cần Tạo

- [ ] Verify `users` table có đủ fields
- [ ] Verify `notifications` table
- [ ] Verify `orders`, `order_items`, `payments` tables
- [ ] Verify `progress` table
- [ ] Verify `session_registrations` table
- [ ] Verify `materials` table
- [ ] Verify `contact_forms` table có đủ fields
- [ ] Tạo bảng `support_tickets` (nếu cần)
- [ ] Tạo bảng `expert_reviews` (nếu cần)
- [ ] Tạo bảng `policies` (nếu cần)

---

## 8. GHI CHÚ

### 8.1. Lưu Ý Khi Triển Khai

1. **Validation:** Tất cả forms cần validation đầy đủ
2. **Error Handling:** Xử lý lỗi rõ ràng, user-friendly
3. **Loading States:** Hiển thị loading khi fetch data
4. **Responsive:** Đảm bảo mobile-friendly
5. **SEO:** Meta tags, structured data cho các trang public
6. **Security:** XSS protection, CSRF protection, input sanitization
7. **Accessibility:** ARIA labels, keyboard navigation

### 8.2. Testing Checklist

- [ ] Unit tests cho components
- [ ] Integration tests cho API
- [ ] E2E tests cho user flows
- [ ] Mobile responsiveness testing
- [ ] Cross-browser testing
- [ ] Performance testing
- [ ] Security testing

---

## 9. TÀI LIỆU LIÊN QUAN

- [DATABASE_DESIGN_IPD8_OVERVIEW.md](./DATABASE_DESIGN_IPD8_OVERVIEW.md) - Database schema
- [IPD8_Wireframe Update.pdf](../Projects/public-frontend/IPD8_Wireframe%20Update.pdf) - Wireframe gốc
- Frontend codebase: `Projects/public-frontend/src/`

---

**Tài liệu này sẽ được cập nhật khi có thay đổi trong wireframe hoặc requirements.**

