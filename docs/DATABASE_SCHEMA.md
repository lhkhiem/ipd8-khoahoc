# THIẾT KẾ DATABASE SCHEMA - IPD8

## 1. Bảng: `users`
**Mục đích:** Lưu thông tin người dùng hệ thống

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID/STRING | PRIMARY KEY | ID duy nhất |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email đăng nhập |
| password_hash | VARCHAR(255) | NOT NULL | Mật khẩu đã hash |
| name | VARCHAR(255) | NOT NULL | Họ và tên |
| phone | VARCHAR(20) | NULL | Số điện thoại |
| address | TEXT | NULL | Địa chỉ |
| gender | ENUM('male','female','other') | NULL | Giới tính |
| dob | DATE | NULL | Ngày sinh |
| avatar_url | VARCHAR(500) | NULL | URL ảnh đại diện |
| role | ENUM('guest','student','instructor','admin') | NOT NULL, DEFAULT 'guest' | Vai trò |
| email_verified | BOOLEAN | DEFAULT false | Email đã xác thực |
| phone_verified | BOOLEAN | DEFAULT false | SĐT đã xác thực |
| is_active | BOOLEAN | DEFAULT true | Trạng thái hoạt động |
| last_login_at | TIMESTAMP | NULL | Lần đăng nhập cuối |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `idx_users_email` trên `email`
- `idx_users_role` trên `role`
- `idx_users_created_at` trên `created_at`

---

## 2. Bảng: `instructors`
**Mục đích:** Thông tin chi tiết giảng viên

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID/STRING | PRIMARY KEY | ID duy nhất |
| user_id | UUID/STRING | FOREIGN KEY → users.id, UNIQUE | ID người dùng |
| title | VARCHAR(100) | NOT NULL | Danh xưng (TS., BS., ThS.) |
| credentials | TEXT | NOT NULL | Học vị, chứng chỉ |
| bio | TEXT | NULL | Tiểu sử |
| specialties | JSON/TEXT | NULL | Chuyên môn (array) |
| achievements | JSON/TEXT | NULL | Thành tựu (array) |
| rating | DECIMAL(3,2) | DEFAULT 0.00 | Đánh giá trung bình |
| total_courses | INT | DEFAULT 0 | Tổng số khóa học |
| is_featured | BOOLEAN | DEFAULT false | Nổi bật |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `idx_instructors_user_id` trên `user_id`
- `idx_instructors_is_featured` trên `is_featured`

---

## 3. Bảng: `courses`
**Mục đích:** Thông tin khóa học

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID/STRING | PRIMARY KEY | ID duy nhất |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL slug |
| title | VARCHAR(255) | NOT NULL | Tiêu đề |
| target_audience | VARCHAR(100) | NOT NULL | Đối tượng (me-bau, 0-12-thang, ...) |
| description | TEXT | NOT NULL | Mô tả |
| benefits_mom | TEXT | NULL | Lợi ích cho mẹ |
| benefits_baby | TEXT | NULL | Lợi ích cho bé |
| price | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Giá |
| price_type | ENUM('one-off','subscription') | NOT NULL, DEFAULT 'one-off' | Loại giá |
| duration_minutes | INT | NOT NULL | Thời lượng (phút) |
| mode | ENUM('group','one-on-one') | NOT NULL, DEFAULT 'group' | Hình thức học |
| status | ENUM('draft','published') | NOT NULL, DEFAULT 'draft' | Trạng thái |
| featured | BOOLEAN | DEFAULT false | Nổi bật |
| thumbnail_url | VARCHAR(500) | NULL | Ảnh đại diện |
| video_url | VARCHAR(500) | NULL | Video giới thiệu |
| instructor_id | UUID/STRING | FOREIGN KEY → instructors.id | Giảng viên chính |
| seo_title | VARCHAR(255) | NULL | SEO title |
| seo_description | TEXT | NULL | SEO description |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `idx_courses_slug` trên `slug`
- `idx_courses_status` trên `status`
- `idx_courses_featured` trên `featured`
- `idx_courses_target_audience` trên `target_audience`
- `idx_courses_instructor_id` trên `instructor_id`

---

## 4. Bảng: `course_modules`
**Mục đích:** Các module/bài học trong khóa học

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID/STRING | PRIMARY KEY | ID duy nhất |
| course_id | UUID/STRING | FOREIGN KEY → courses.id, NOT NULL | ID khóa học |
| order | INT | NOT NULL | Thứ tự |
| title | VARCHAR(255) | NOT NULL | Tiêu đề module |
| description | TEXT | NULL | Mô tả |
| duration_minutes | INT | NULL | Thời lượng (phút) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `idx_course_modules_course_id` trên `course_id`
- `idx_course_modules_order` trên `(course_id, order)`

---

## 5. Bảng: `course_sessions`
**Mục đích:** Lịch học cụ thể của khóa học

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID/STRING | PRIMARY KEY | ID duy nhất |
| course_id | UUID/STRING | FOREIGN KEY → courses.id, NOT NULL | ID khóa học |
| instructor_id | UUID/STRING | FOREIGN KEY → instructors.id, NULL | Giảng viên |
| order | INT | NULL | Thứ tự trong khóa học |
| title | VARCHAR(255) | NOT NULL | Tiêu đề buổi học |
| description | TEXT | NULL | Mô tả |
| start_time | TIMESTAMP | NOT NULL | Thời gian bắt đầu |
| end_time | TIMESTAMP | NOT NULL | Thời gian kết thúc |
| location | VARCHAR(255) | NULL | Địa điểm |
| capacity | INT | NOT NULL, DEFAULT 10 | Sức chứa |
| enrolled_count | INT | DEFAULT 0 | Số lượng đã đăng ký |
| status | ENUM('scheduled','full','cancelled','done') | NOT NULL, DEFAULT 'scheduled' | Trạng thái |
| meeting_link | VARCHAR(500) | NULL | Link meeting (online) |
| meeting_type | ENUM('google-meet','zoom','offline') | NULL | Loại meeting |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `idx_course_sessions_course_id` trên `course_id`
- `idx_course_sessions_instructor_id` trên `instructor_id`
- `idx_course_sessions_start_time` trên `start_time`
- `idx_course_sessions_status` trên `status`

---

## 6. Bảng: `enrollments`
**Mục đích:** Đăng ký khóa học của học viên

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID/STRING | PRIMARY KEY | ID duy nhất |
| user_id | UUID/STRING | FOREIGN KEY → users.id, NOT NULL | ID học viên |
| course_id | UUID/STRING | FOREIGN KEY → courses.id, NOT NULL | ID khóa học |
| type | ENUM('trial','standard','combo','3m','6m','12m','24m') | NOT NULL | Loại gói |
| status | ENUM('pending','active','cancelled','completed') | NOT NULL, DEFAULT 'pending' | Trạng thái |
| start_date | DATE | NULL | Ngày bắt đầu |
| end_date | DATE | NULL | Ngày kết thúc |
| progress_percent | DECIMAL(5,2) | DEFAULT 0.00 | Tiến độ (%) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `idx_enrollments_user_id` trên `user_id`
- `idx_enrollments_course_id` trên `course_id`
- `idx_enrollments_status` trên `status`
- `idx_enrollments_dates` trên `(start_date, end_date)`

---

## 7. Bảng: `progress`
**Mục đích:** Tiến độ học tập của học viên

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID/STRING | PRIMARY KEY | ID duy nhất |
| enrollment_id | UUID/STRING | FOREIGN KEY → enrollments.id, NOT NULL | ID đăng ký |
| module_id | UUID/STRING | FOREIGN KEY → course_modules.id, NULL | ID module |
| session_id | UUID/STRING | FOREIGN KEY → course_sessions.id, NULL | ID session |
| progress_percent | DECIMAL(5,2) | NOT NULL, DEFAULT 0.00 | Tiến độ (%) |
| feedback | TEXT | NULL | Phản hồi |
| completed_at | TIMESTAMP | NULL | Ngày hoàn thành |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `idx_progress_enrollment_id` trên `enrollment_id`
- `idx_progress_module_id` trên `module_id`
- `idx_progress_session_id` trên `session_id`

---

## 8. Bảng: `materials`
**Mục đích:** Tài liệu học tập

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID/STRING | PRIMARY KEY | ID duy nhất |
| course_id | UUID/STRING | FOREIGN KEY → courses.id, NOT NULL | ID khóa học |
| title | VARCHAR(255) | NOT NULL | Tên tài liệu |
| file_key | VARCHAR(500) | NOT NULL | Key file trên storage |
| file_url | VARCHAR(500) | NOT NULL | URL file |
| mime_type | VARCHAR(100) | NOT NULL | Loại file |
| size | BIGINT | NOT NULL | Kích thước (bytes) |
| visibility | ENUM('public','private','enrolled') | NOT NULL, DEFAULT 'enrolled' | Quyền truy cập |
| provider | VARCHAR(50) | NOT NULL | Storage provider (s3, local, ...) |
| download_count | INT | DEFAULT 0 | Số lượt tải |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `idx_materials_course_id` trên `course_id`
- `idx_materials_visibility` trên `visibility`

---

## 9. Bảng: `orders`
**Mục đích:** Đơn hàng thanh toán

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID/STRING | PRIMARY KEY | ID duy nhất |
| user_id | UUID/STRING | FOREIGN KEY → users.id, NOT NULL | ID người dùng |
| order_number | VARCHAR(50) | UNIQUE, NOT NULL | Mã đơn hàng |
| amount | DECIMAL(12,2) | NOT NULL | Tổng tiền |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'VND' | Đơn vị tiền |
| status | ENUM('created','paid','failed','refunded') | NOT NULL, DEFAULT 'created' | Trạng thái |
| gateway | VARCHAR(50) | NOT NULL, DEFAULT 'zalopay' | Cổng thanh toán |
| description | TEXT | NULL | Mô tả |
| metadata | JSON | NULL | Dữ liệu bổ sung |
| paid_at | TIMESTAMP | NULL | Ngày thanh toán |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `idx_orders_user_id` trên `user_id`
- `idx_orders_order_number` trên `order_number`
- `idx_orders_status` trên `status`
- `idx_orders_created_at` trên `created_at`

---

## 10. Bảng: `order_items`
**Mục đích:** Chi tiết đơn hàng

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID/STRING | PRIMARY KEY | ID duy nhất |
| order_id | UUID/STRING | FOREIGN KEY → orders.id, NOT NULL | ID đơn hàng |
| course_id | UUID/STRING | FOREIGN KEY → courses.id, NOT NULL | ID khóa học |
| price | DECIMAL(12,2) | NOT NULL | Giá |
| quantity | INT | NOT NULL, DEFAULT 1 | Số lượng |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày tạo |

**Indexes:**
- `idx_order_items_order_id` trên `order_id`
- `idx_order_items_course_id` trên `course_id`

---

## 11. Bảng: `payments`
**Mục đích:** Giao dịch thanh toán

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID/STRING | PRIMARY KEY | ID duy nhất |
| order_id | UUID/STRING | FOREIGN KEY → orders.id, NOT NULL | ID đơn hàng |
| gateway_txn_id | VARCHAR(255) | NULL | ID giao dịch gateway |
| status | VARCHAR(50) | NOT NULL | Trạng thái |
| amount | DECIMAL(12,2) | NOT NULL | Số tiền |
| paid_at | TIMESTAMP | NULL | Ngày thanh toán |
| raw_response | JSON | NULL | Response từ gateway |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `idx_payments_order_id` trên `order_id`
- `idx_payments_gateway_txn_id` trên `gateway_txn_id`
- `idx_payments_status` trên `status`

---

## 12. Bảng: `posts`
**Mục đích:** Bài viết (News, Events, Blog, FAQ, Policy)

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID/STRING | PRIMARY KEY | ID duy nhất |
| slug | VARCHAR(255) | UNIQUE, NOT NULL | URL slug |
| title | VARCHAR(255) | NOT NULL | Tiêu đề |
| content | TEXT | NOT NULL | Nội dung |
| excerpt | TEXT | NULL | Tóm tắt |
| thumbnail_url | VARCHAR(500) | NULL | Ảnh đại diện |
| type | ENUM('NEWS','EVENT','BLOG','FAQ','POLICY') | NOT NULL | Loại bài viết |
| category | VARCHAR(100) | NULL | Danh mục |
| author_id | UUID/STRING | FOREIGN KEY → users.id, NULL | Tác giả |
| expert_id | UUID/STRING | FOREIGN KEY → instructors.id, NULL | Chuyên gia (cho BLOG) |
| event_date | DATE | NULL | Ngày sự kiện (cho EVENT) |
| event_location | VARCHAR(255) | NULL | Địa điểm (cho EVENT) |
| published_at | TIMESTAMP | NULL | Ngày xuất bản |
| view_count | INT | DEFAULT 0 | Số lượt xem |
| is_featured | BOOLEAN | DEFAULT false | Nổi bật |
| seo_title | VARCHAR(255) | NULL | SEO title |
| seo_description | TEXT | NULL | SEO description |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `idx_posts_slug` trên `slug`
- `idx_posts_type` trên `type`
- `idx_posts_published_at` trên `published_at`
- `idx_posts_author_id` trên `author_id`
- `idx_posts_expert_id` trên `expert_id`

---

## 13. Bảng: `post_tags`
**Mục đích:** Tags của bài viết (Many-to-Many)

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID/STRING | PRIMARY KEY | ID duy nhất |
| post_id | UUID/STRING | FOREIGN KEY → posts.id, NOT NULL | ID bài viết |
| tag_name | VARCHAR(100) | NOT NULL | Tên tag |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày tạo |

**Indexes:**
- `idx_post_tags_post_id` trên `post_id`
- `idx_post_tags_tag_name` trên `tag_name`
- UNIQUE trên `(post_id, tag_name)`

---

## 14. Bảng: `notifications`
**Mục đích:** Thông báo cho người dùng

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID/STRING | PRIMARY KEY | ID duy nhất |
| user_id | UUID/STRING | FOREIGN KEY → users.id, NOT NULL | ID người dùng |
| title | VARCHAR(255) | NOT NULL | Tiêu đề |
| body | TEXT | NOT NULL | Nội dung |
| type | VARCHAR(50) | NULL | Loại thông báo |
| link | VARCHAR(500) | NULL | Link liên kết |
| read_at | TIMESTAMP | NULL | Ngày đọc |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày tạo |

**Indexes:**
- `idx_notifications_user_id` trên `user_id`
- `idx_notifications_read_at` trên `read_at`
- `idx_notifications_created_at` trên `created_at`

---

## 15. Bảng: `contact_forms`
**Mục đích:** Form liên hệ từ website

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID/STRING | PRIMARY KEY | ID duy nhất |
| name | VARCHAR(255) | NOT NULL | Họ tên |
| email | VARCHAR(255) | NOT NULL | Email |
| phone | VARCHAR(20) | NOT NULL | Số điện thoại |
| address | TEXT | NULL | Địa chỉ |
| course_interest | VARCHAR(255) | NULL | Khóa học quan tâm |
| study_mode | VARCHAR(50) | NULL | Hình thức học |
| message | TEXT | NOT NULL | Nội dung |
| status | ENUM('new','processing','resolved','archived') | NOT NULL, DEFAULT 'new' | Trạng thái |
| resolved_by | UUID/STRING | FOREIGN KEY → users.id, NULL | Người xử lý |
| resolved_at | TIMESTAMP | NULL | Ngày xử lý |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `idx_contact_forms_status` trên `status`
- `idx_contact_forms_created_at` trên `created_at`

---

## 16. Bảng: `session_registrations`
**Mục đích:** Đăng ký tham gia buổi học cụ thể

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID/STRING | PRIMARY KEY | ID duy nhất |
| user_id | UUID/STRING | FOREIGN KEY → users.id, NOT NULL | ID học viên |
| session_id | UUID/STRING | FOREIGN KEY → course_sessions.id, NOT NULL | ID buổi học |
| enrollment_id | UUID/STRING | FOREIGN KEY → enrollments.id, NULL | ID đăng ký khóa học |
| status | ENUM('pending','confirmed','cancelled','attended') | NOT NULL, DEFAULT 'pending' | Trạng thái |
| notes | TEXT | NULL | Ghi chú |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày tạo |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `idx_session_registrations_user_id` trên `user_id`
- `idx_session_registrations_session_id` trên `session_id`
- `idx_session_registrations_status` trên `status`
- UNIQUE trên `(user_id, session_id)`

---

## 17. Bảng: `settings`
**Mục đích:** Cài đặt hệ thống cho cả CMS và IPD8 (dùng chung)

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|-----|--------------|-----------|-------|
| id | UUID/STRING | PRIMARY KEY | ID duy nhất |
| namespace | VARCHAR(100) | UNIQUE, NOT NULL | Namespace: 'general', 'appearance', 'security', 'seo', 'ipd8', 'courses', 'payments' |
| value | JSONB | NOT NULL, DEFAULT '{}' | Giá trị cài đặt (JSON object) |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Ngày cập nhật |

**Indexes:**
- `uq_settings_namespace` trên `namespace` (UNIQUE)

**Lưu ý:**
- Bảng `settings` này dùng chung cho cả CMS và IPD8, sử dụng cấu trúc `namespace` + `value` (JSONB) để lưu trữ các cài đặt theo nhóm.
- **Namespace CMS:** 'general', 'appearance', 'email', 'security', 'seo', 'notifications', 'advanced', 'homepage_metrics'
- **Namespace IPD8:** 'ipd8', 'courses', 'payments', 'instructors', 'enrollments' (có thể thêm tùy nhu cầu)
- Mỗi namespace chứa một JSON object với nhiều settings liên quan, giúp tổ chức và quản lý dễ dàng hơn so với key-value đơn lẻ.

---

## 3. QUAN HỆ GIỮA CÁC BẢNG (ER Diagram mô phỏng)

```
users (1) ──< (1) instructors
users (1) ──< (*) enrollments
users (1) ──< (*) orders
users (1) ──< (*) notifications
users (1) ──< (*) posts (author)
users (1) ──< (*) contact_forms (resolved_by)

instructors (1) ──< (*) courses
instructors (1) ──< (*) course_sessions
instructors (1) ──< (*) posts (expert)

courses (1) ──< (*) course_modules
courses (1) ──< (*) course_sessions
courses (1) ──< (*) enrollments
courses (1) ──< (*) materials
courses (1) ──< (*) order_items

course_sessions (1) ──< (*) session_registrations
course_modules (1) ──< (*) progress
course_sessions (1) ──< (*) progress

enrollments (1) ──< (*) progress
enrollments (1) ──< (*) session_registrations

orders (1) ──< (*) order_items
orders (1) ──< (*) payments

posts (1) ──< (*) post_tags
```

---

## 4. GHI CHÚ THIẾT KẾ

1. **ID Type:** Sử dụng UUID hoặc String ID tùy theo backend framework
2. **Timestamps:** Sử dụng TIMESTAMP với timezone
3. **JSON Fields:** Lưu metadata, specialties, achievements dạng JSON
4. **Indexes:** Tối ưu cho các truy vấn thường dùng
5. **Soft Delete:** Có thể thêm `deleted_at` nếu cần soft delete
6. **Audit Trail:** Có thể thêm `created_by`, `updated_by` để tracking
7. **Full-text Search:** Thêm index full-text cho `title`, `content` nếu cần
8. **File Storage:** Sử dụng S3 hoặc tương tự, lưu `file_key` và `file_url`
9. **Settings:** Bảng `settings` dùng chung cho cả CMS và IPD8, sử dụng `namespace` + `value` (JSONB) để tổ chức settings theo nhóm

---

## 5. MIGRATION NOTES

- Tạo các bảng theo thứ tự: users → instructors → courses → (các bảng phụ thuộc)
- Thêm indexes sau khi tạo bảng
- Sử dụng transactions cho các migration phức tạp
- Backup database trước khi chạy migration
