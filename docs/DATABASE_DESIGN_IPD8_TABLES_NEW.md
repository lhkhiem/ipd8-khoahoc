# CHI TIẾT BẢNG TẠO MỚI - IPD8 DATABASE DESIGN

**Mục đích:** Chi tiết các bảng hoàn toàn mới cho IPD8 Learning Platform (BÁM SÁT 100% schema IPD8)

---

## 📋 MỤC LỤC

1. [Nhóm User & Instructor](#nhóm-user--instructor)
2. [Nhóm Course & Learning](#nhóm-course--learning)
3. [Nhóm Payment & Orders](#nhóm-payment--orders)
4. [Nhóm Content & Posts](#nhóm-content--posts)
5. [Nhóm System & Settings](#nhóm-system--settings)
6. [Nhóm CMS API & Webhooks](#nhóm-cms-api--webhooks)

---

## NHÓM USER & INSTRUCTOR

### 3.3.1. Bảng: `instructors`

**Mục đích:** Thông tin chi tiết giảng viên (BÁM SÁT IPD8)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `user_id` | UUID | FOREIGN KEY → users.id, UNIQUE, NOT NULL | ID người dùng (link với users) |
| `title` | VARCHAR(100) | NOT NULL | Danh xưng: 'TS.', 'BS.', 'ThS.', 'CN.' |
| `credentials` | TEXT | NOT NULL | Học vị, chứng chỉ |
| `bio` | TEXT | NULL | Tiểu sử giảng viên |
| `specialties` | JSON/TEXT | NULL | Chuyên môn (array): ['Yoga', 'Pilates', 'Massage'] |
| `achievements` | JSON/TEXT | NULL | Thành tựu (array): ['Giải nhất...', 'Chứng chỉ...'] |
| `rating` | DECIMAL(3,2) | DEFAULT 0.00 | Đánh giá trung bình (0.00 - 5.00) |
| `total_courses` | INTEGER | DEFAULT 0 | Tổng số khóa học đã dạy |
| `is_featured` | BOOLEAN | DEFAULT false | Giảng viên nổi bật |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_instructors_user_id` trên `user_id`
- `idx_instructors_is_featured` trên `is_featured`
- `idx_instructors_rating` trên `rating DESC`

---

## NHÓM COURSE & LEARNING

### 3.3.2. Bảng: `courses`

**Mục đích:** Thông tin khóa học (BÁM SÁT IPD8)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `slug` | VARCHAR(255) | UNIQUE, NOT NULL | URL slug: 'yoga-cho-me-bau' |
| `title` | VARCHAR(255) | NOT NULL | Tiêu đề khóa học |
| `target_audience` | VARCHAR(100) | NOT NULL | Đối tượng: 'me-bau', '0-12-thang', '1-3-tuoi' |
| `description` | TEXT | NOT NULL | Mô tả chi tiết |
| `benefits_mom` | TEXT | NULL | Lợi ích cho mẹ |
| `benefits_baby` | TEXT | NULL | Lợi ích cho bé |
| `price` | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Giá khóa học (VND) |
| `price_type` | ENUM('one-off','subscription') | NOT NULL, DEFAULT 'one-off' | Loại giá: 'one-off' (một lần), 'subscription' (theo tháng) |
| `duration_minutes` | INTEGER | NOT NULL | Thời lượng khóa học (phút) |
| `mode` | ENUM('group','one-on-one') | NOT NULL, DEFAULT 'group' | Hình thức: 'group' (nhóm), 'one-on-one' (cá nhân) |
| `status` | ENUM('draft','published') | NOT NULL, DEFAULT 'draft' | Trạng thái: 'draft', 'published' |
| `featured` | BOOLEAN | DEFAULT false | Khóa học nổi bật |
| `thumbnail_url` | VARCHAR(500) | NULL | URL ảnh đại diện |
| `video_url` | VARCHAR(500) | NULL | URL video giới thiệu |
| `instructor_id` | UUID | FOREIGN KEY → instructors.id | ID giảng viên chính |
| `seo_title` | VARCHAR(255) | NULL | SEO title |
| `seo_description` | TEXT | NULL | SEO description |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_courses_slug` trên `slug`
- `idx_courses_status` trên `status`
- `idx_courses_featured` trên `featured`
- `idx_courses_target_audience` trên `target_audience`
- `idx_courses_instructor_id` trên `instructor_id`

---

### 3.3.3. Bảng: `course_modules`

**Mục đích:** Các module/bài học trong khóa học (BÁM SÁT IPD8)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `course_id` | UUID | FOREIGN KEY → courses.id, NOT NULL | ID khóa học |
| `order` | INTEGER | NOT NULL | Thứ tự module (1, 2, 3...) |
| `title` | VARCHAR(255) | NOT NULL | Tiêu đề module |
| `description` | TEXT | NULL | Mô tả module |
| `duration_minutes` | INTEGER | NULL | Thời lượng module (phút) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_course_modules_course_id` trên `course_id`
- `idx_course_modules_order` trên `(course_id, order)` (composite)

---

### 3.3.4. Bảng: `course_sessions`

**Mục đích:** Lịch học cụ thể của khóa học (BÁM SÁT IPD8)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `course_id` | UUID | FOREIGN KEY → courses.id, NOT NULL | ID khóa học |
| `instructor_id` | UUID | FOREIGN KEY → instructors.id | ID giảng viên |
| `order` | INTEGER | NULL | Thứ tự trong khóa học |
| `title` | VARCHAR(255) | NOT NULL | Tiêu đề buổi học |
| `description` | TEXT | NULL | Mô tả buổi học |
| `start_time` | TIMESTAMP | NOT NULL | Thời gian bắt đầu |
| `end_time` | TIMESTAMP | NOT NULL | Thời gian kết thúc |
| `location` | VARCHAR(255) | NULL | Địa điểm (cho offline) |
| `capacity` | INTEGER | NOT NULL, DEFAULT 10 | Sức chứa tối đa |
| `enrolled_count` | INTEGER | DEFAULT 0 | Số lượng đã đăng ký |
| `status` | ENUM('scheduled','full','cancelled','done') | NOT NULL, DEFAULT 'scheduled' | Trạng thái: 'scheduled', 'full', 'cancelled', 'done' |
| `meeting_link` | VARCHAR(500) | NULL | Link meeting (Google Meet, Zoom) |
| `meeting_type` | ENUM('google-meet','zoom','offline') | NULL | Loại meeting: 'google-meet', 'zoom', 'offline' |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_course_sessions_course_id` trên `course_id`
- `idx_course_sessions_instructor_id` trên `instructor_id`
- `idx_course_sessions_start_time` trên `start_time`
- `idx_course_sessions_status` trên `status`

---

### 3.3.5. Bảng: `enrollments`

**Mục đích:** Đăng ký khóa học của học viên (BÁM SÁT IPD8)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `user_id` | UUID | FOREIGN KEY → users.id, NOT NULL | ID học viên |
| `course_id` | UUID | FOREIGN KEY → courses.id, NOT NULL | ID khóa học |
| `type` | ENUM('trial','standard','combo','3m','6m','12m','24m') | NOT NULL | Loại gói: 'trial', 'standard', 'combo', '3m', '6m', '12m', '24m' |
| `status` | ENUM('pending','active','cancelled','completed') | NOT NULL, DEFAULT 'pending' | Trạng thái: 'pending', 'active', 'cancelled', 'completed' |
| `start_date` | DATE | NULL | Ngày bắt đầu |
| `end_date` | DATE | NULL | Ngày kết thúc |
| `progress_percent` | DECIMAL(5,2) | DEFAULT 0.00 | Tiến độ học tập (%) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_enrollments_user_id` trên `user_id`
- `idx_enrollments_course_id` trên `course_id`
- `idx_enrollments_status` trên `status`
- `idx_enrollments_dates` trên `(start_date, end_date)`
- UNIQUE trên `(user_id, course_id)` (một user chỉ đăng ký một lần mỗi khóa học)

---

### 3.3.6. Bảng: `progress`

**Mục đích:** Tiến độ học tập của học viên (BÁM SÁT IPD8)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `enrollment_id` | UUID | FOREIGN KEY → enrollments.id, NOT NULL | ID đăng ký |
| `module_id` | UUID | FOREIGN KEY → course_modules.id | ID module (nếu theo dõi theo module) |
| `session_id` | UUID | FOREIGN KEY → course_sessions.id | ID session (nếu theo dõi theo session) |
| `progress_percent` | DECIMAL(5,2) | NOT NULL, DEFAULT 0.00 | Tiến độ (%) |
| `feedback` | TEXT | NULL | Phản hồi từ giảng viên |
| `completed_at` | TIMESTAMP | NULL | Ngày hoàn thành |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_progress_enrollment_id` trên `enrollment_id`
- `idx_progress_module_id` trên `module_id`
- `idx_progress_session_id` trên `session_id`

---

### 3.3.7. Bảng: `materials`

**Mục đích:** Tài liệu học tập (BÁM SÁT IPD8)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `course_id` | UUID | FOREIGN KEY → courses.id, NOT NULL | ID khóa học |
| `title` | VARCHAR(255) | NOT NULL | Tên tài liệu |
| `file_key` | VARCHAR(500) | NOT NULL | Key file trên storage (S3 key) |
| `file_url` | VARCHAR(500) | NOT NULL | URL file để download |
| `mime_type` | VARCHAR(100) | NOT NULL | Loại file: 'application/pdf', 'image/jpeg' |
| `size` | BIGINT | NOT NULL | Kích thước file (bytes) |
| `visibility` | ENUM('public','private','enrolled') | NOT NULL, DEFAULT 'enrolled' | Quyền truy cập: 'public', 'private', 'enrolled' |
| `provider` | VARCHAR(50) | NOT NULL | Storage provider: 's3', 'local', 'cloudinary' |
| `download_count` | INTEGER | DEFAULT 0 | Số lượt tải |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_materials_course_id` trên `course_id`
- `idx_materials_visibility` trên `visibility`

---

### 3.3.8. Bảng: `session_registrations`

**Mục đích:** Đăng ký tham gia buổi học cụ thể (BÁM SÁT IPD8)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `user_id` | UUID | FOREIGN KEY → users.id, NOT NULL | ID học viên |
| `session_id` | UUID | FOREIGN KEY → course_sessions.id, NOT NULL | ID buổi học |
| `enrollment_id` | UUID | FOREIGN KEY → enrollments.id | ID đăng ký khóa học (nếu có) |
| `status` | ENUM('pending','confirmed','cancelled','attended') | NOT NULL, DEFAULT 'pending' | Trạng thái: 'pending', 'confirmed', 'cancelled', 'attended' |
| `notes` | TEXT | NULL | Ghi chú |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_session_registrations_user_id` trên `user_id`
- `idx_session_registrations_session_id` trên `session_id`
- `idx_session_registrations_status` trên `status`
- UNIQUE trên `(user_id, session_id)` (một user chỉ đăng ký một lần mỗi session)

---

## NHÓM PAYMENT & ORDERS

### 3.3.9. Bảng: `orders` (IPD8 - Payment Orders)

**Mục đích:** Đơn hàng thanh toán khóa học (BÁM SÁT IPD8)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `user_id` | UUID | FOREIGN KEY → users.id, NOT NULL | ID người dùng |
| `order_number` | VARCHAR(50) | UNIQUE, NOT NULL | Mã đơn hàng: 'ORD-20250101-001' |
| `amount` | DECIMAL(12,2) | NOT NULL | Tổng tiền (VND) |
| `currency` | VARCHAR(3) | NOT NULL, DEFAULT 'VND' | Đơn vị tiền: 'VND', 'USD' |
| `status` | ENUM('created','paid','failed','refunded') | NOT NULL, DEFAULT 'created' | Trạng thái: 'created', 'paid', 'failed', 'refunded' |
| `gateway` | VARCHAR(50) | NOT NULL, DEFAULT 'zalopay' | Cổng thanh toán: 'zalopay', 'vnpay', 'momo' |
| `description` | TEXT | NULL | Mô tả đơn hàng |
| `metadata` | JSON | NULL | Dữ liệu bổ sung (JSON) |
| `paid_at` | TIMESTAMP | NULL | Ngày thanh toán |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_orders_user_id` trên `user_id`
- `idx_orders_order_number` trên `order_number`
- `idx_orders_status` trên `status`
- `idx_orders_created_at` trên `created_at DESC`

---

### 3.3.10. Bảng: `order_items`

**Mục đích:** Chi tiết đơn hàng (các khóa học trong đơn) (BÁM SÁT IPD8)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `order_id` | UUID | FOREIGN KEY → orders.id, NOT NULL | ID đơn hàng |
| `course_id` | UUID | FOREIGN KEY → courses.id, NOT NULL | ID khóa học |
| `price` | DECIMAL(12,2) | NOT NULL | Giá tại thời điểm mua |
| `quantity` | INTEGER | NOT NULL, DEFAULT 1 | Số lượng (thường là 1) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |

**Indexes:**
- `idx_order_items_order_id` trên `order_id`
- `idx_order_items_course_id` trên `course_id`

---

### 3.3.11. Bảng: `payments`

**Mục đích:** Giao dịch thanh toán (BÁM SÁT IPD8)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `order_id` | UUID | FOREIGN KEY → orders.id, NOT NULL | ID đơn hàng |
| `gateway_txn_id` | VARCHAR(255) | NULL | ID giao dịch từ gateway |
| `status` | VARCHAR(50) | NOT NULL | Trạng thái: 'pending', 'success', 'failed' |
| `amount` | DECIMAL(12,2) | NOT NULL | Số tiền |
| `paid_at` | TIMESTAMP | NULL | Ngày thanh toán |
| `raw_response` | JSON | NULL | Response từ gateway (JSON) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_payments_order_id` trên `order_id`
- `idx_payments_gateway_txn_id` trên `gateway_txn_id`
- `idx_payments_status` trên `status`

---

## NHÓM CONTENT & POSTS

### 3.3.12. Bảng: `post_tags` (Tạo mới - BÁM SÁT IPD8)

**Mục đích:** Tags của bài viết (theo schema IPD8: dùng `tag_name`, không phải `tag_id`)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `post_id` | UUID | FOREIGN KEY → posts.id, NOT NULL | ID bài viết |
| `tag_name` | VARCHAR(100) | NOT NULL | Tên tag (không phải FK đến tags table) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |

**Indexes:**
- `idx_post_tags_post_id` trên `post_id`
- `idx_post_tags_tag_name` trên `tag_name`
- UNIQUE trên `(post_id, tag_name)`

**Lưu ý quan trọng:**
- IPD8 schema dùng `tag_name` (VARCHAR) trực tiếp, không có FK đến bảng `tags`
- CMS cũ có bảng `post_tags` với `post_id` + `tag_id` (FK) → cần tạo bảng mới theo IPD8
- Có thể giữ cả 2 bảng: `post_tags` (IPD8) và `post_tags_old` (CMS cũ) để migrate data

---

## NHÓM SYSTEM & SETTINGS

### 3.3.13. Bảng: `notifications`

**Mục đích:** Thông báo cho người dùng (BÁM SÁT IPD8)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `user_id` | UUID | FOREIGN KEY → users.id, NOT NULL | ID người dùng |
| `title` | VARCHAR(255) | NOT NULL | Tiêu đề thông báo |
| `body` | TEXT | NOT NULL | Nội dung thông báo |
| `type` | VARCHAR(50) | NULL | Loại: 'enrollment', 'payment', 'session', 'system' |
| `link` | VARCHAR(500) | NULL | Link liên kết |
| `read_at` | TIMESTAMP | NULL | Ngày đọc |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |

**Indexes:**
- `idx_notifications_user_id` trên `user_id`
- `idx_notifications_read_at` trên `read_at`
- `idx_notifications_created_at` trên `created_at DESC`

---

## NHÓM CMS API & WEBHOOKS

### 3.3.14. Bảng: `api_keys`

**Mục đích:** API keys cho CMS authentication

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `key_name` | VARCHAR(100) | NOT NULL | Tên key: 'admin-default', 'frontend-api' |
| `api_key` | VARCHAR(64) | UNIQUE, NOT NULL | API key (public): 'cms_abc123...' |
| `api_secret` | VARCHAR(64) | NOT NULL | API secret (hashed) |
| `permissions` | JSONB | NOT NULL, DEFAULT '[]' | Quyền: ['read', 'write', 'admin'] |
| `rate_limit` | INTEGER | DEFAULT 1000 | Giới hạn request/giờ |
| `ip_whitelist` | TEXT[] | NULL | Danh sách IP được phép (array) |
| `expires_at` | TIMESTAMP | NULL | Ngày hết hạn |
| `last_used_at` | TIMESTAMP | NULL | Lần sử dụng cuối |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `is_active` | BOOLEAN | DEFAULT true | Trạng thái hoạt động |

**Indexes:**
- `idx_api_keys_key` trên `api_key` WHERE `is_active = true`
- `idx_api_keys_is_active` trên `is_active`

---

### 3.3.15. Bảng: `webhooks`

**Mục đích:** Cấu hình webhook cho real-time sync

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `url` | VARCHAR(500) | NOT NULL | URL webhook endpoint |
| `secret` | VARCHAR(64) | NOT NULL | Secret để sign payload |
| `events` | TEXT[] | NOT NULL | Danh sách events: ['content.created', 'course.updated'] |
| `is_active` | BOOLEAN | DEFAULT true | Trạng thái hoạt động |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_webhooks_is_active` trên `is_active`

---

### 3.3.16. Bảng: `webhook_logs`

**Mục đích:** Log webhook requests

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | BIGSERIAL | PRIMARY KEY | ID duy nhất |
| `webhook_id` | UUID | FOREIGN KEY → webhooks.id | ID webhook |
| `event` | VARCHAR(100) | NOT NULL | Tên event: 'content.created' |
| `status` | VARCHAR(20) | NOT NULL | Trạng thái: 'pending', 'success', 'failed' |
| `status_code` | INTEGER | NULL | HTTP status code |
| `error_message` | TEXT | NULL | Thông báo lỗi (nếu có) |
| `sent_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày gửi |
| `response_time_ms` | INTEGER | NULL | Thời gian response (ms) |

**Indexes:**
- `idx_webhook_logs_webhook_id` trên `webhook_id`
- `idx_webhook_logs_sent_at` trên `sent_at DESC`

---

### 3.3.17. Bảng: `api_request_logs`

**Mục đích:** Log API requests (audit trail)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | BIGSERIAL | PRIMARY KEY | ID duy nhất |
| `api_key_id` | UUID | FOREIGN KEY → api_keys.id | ID API key |
| `endpoint` | VARCHAR(255) | NOT NULL | Endpoint: '/api/v1/courses' |
| `method` | VARCHAR(10) | NOT NULL | HTTP method: 'GET', 'POST', 'PUT', 'DELETE' |
| `status_code` | INTEGER | NULL | HTTP status code |
| `ip_address` | INET | NULL | Địa chỉ IP |
| `user_agent` | TEXT | NULL | User agent string |
| `request_body` | JSONB | NULL | Request body (JSON) |
| `response_time_ms` | INTEGER | NULL | Thời gian response (ms) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |

**Indexes:**
- `idx_api_request_logs_api_key_id` trên `api_key_id`
- `idx_api_request_logs_created_at` trên `created_at DESC`
- `idx_api_request_logs_endpoint` trên `endpoint`

---

## TÓM TẮT

Tất cả các bảng trên đều **tạo mới** cho IPD8, bám sát 100% schema trong `DATABASE_SCHEMA.md`.

**Xem thêm:**
- [Tổng quan](./DATABASE_DESIGN_IPD8_OVERVIEW.md)
- [Bảng giữ nguyên](./DATABASE_DESIGN_IPD8_TABLES_KEEP.md)
- [Bảng tái cấu trúc](./DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md)
- [Migration plan](./DATABASE_DESIGN_IPD8_MIGRATION.md)



