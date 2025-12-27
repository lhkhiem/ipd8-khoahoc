# DATABASE SCHEMA - IPD8 LEARNING PLATFORM

**Ngày cập nhật:** 2025-01-XX  
**Phiên bản:** 3.0  
**Tổng số bảng:** 37 bảng

---

## 📋 MỤC LỤC

1. [Tổng Quan](#1-tổng-quan)
2. [Danh Sách Bảng Đầy Đủ](#2-danh-sách-bảng-đầy-đủ)
3. [Phân Loại Bảng](#3-phân-loại-bảng)
4. [Bảng Mới Được Thêm](#4-bảng-mới-được-thêm)
5. [So Sánh Với Thiết Kế Ban Đầu](#5-so-sánh-với-thiết-kế-ban-đầu)

---

## 1. TỔNG QUAN

### 1.1. Thống Kê

| Loại | Số Lượng | Mô Tả |
|------|----------|-------|
| **Bảng giữ nguyên** | 12 | Media, Menu, Settings (CMS & IPD8), Analytics, FAQ |
| **Bảng tái cấu trúc** | 6 | Users, Posts, Topics, Tags, Contact, Newsletter |
| **Bảng tạo mới (IPD8)** | 17 | Courses, Instructors, Enrollments, Orders, Payments, v.v. |
| **Bảng bổ sung** | 2 | Activity Logs, Post Topics (junction table) |
| **TỔNG CỘNG** | **37** | Bảng cuối cùng trong database |

### 1.2. Lưu Ý Quan Trọng

- **Bảng `post_tags` (IPD8)**: Dùng `tag_name` (VARCHAR), không phải `tag_id` (FK)
- **Bảng `post_topics` (CMS)**: Junction table với `post_id` + `topic_id` (FK)
- **Bảng `activity_logs`**: Theo dõi user actions và system events cho CMS

---

## 2. DANH SÁCH BẢNG ĐẦY ĐỦ (37 bảng)

### 2.1. Nhóm User & Authentication (3 bảng)
1. `users` (tái cấu trúc)
2. `instructors` (tạo mới)
3. `api_keys` (tạo mới)

### 2.2. Nhóm Course & Learning (7 bảng)
4. `courses` (tạo mới)
5. `course_modules` (tạo mới)
6. `course_sessions` (tạo mới)
7. `enrollments` (tạo mới)
8. `progress` (tạo mới)
9. `materials` (tạo mới)
10. `session_registrations` (tạo mới)

### 2.3. Nhóm Payment & Orders (3 bảng)
11. `orders` (tạo mới - IPD8)
12. `order_items` (tạo mới)
13. `payments` (tạo mới)

### 2.4. Nhóm Content & Posts (5 bảng)
14. `posts` (tái cấu trúc)
15. `topics` (tái cấu trúc)
16. `tags` (tái cấu trúc)
17. `post_tags` (tạo mới - IPD8, dùng `tag_name`)
18. `post_topics` (bổ sung - CMS, junction table)

### 2.5. Nhóm System & Settings (4 bảng)
19. `settings` (CMS & IPD8 - giữ nguyên, dùng chung)
20. `notifications` (tạo mới)
21. `contact_forms` (tái cấu trúc)
22. `newsletter_subscriptions` (tái cấu trúc)

### 2.6. Nhóm Media & Assets (3 bảng)
23. `assets` (giữ nguyên)
24. `asset_folders` (giữ nguyên)
25. `media_folders` (giữ nguyên)

### 2.7. Nhóm Menu & Navigation (3 bảng)
26. `menu_locations` (giữ nguyên)
27. `menu_items` (giữ nguyên)
28. `page_metadata` (giữ nguyên)

### 2.8. Nhóm Analytics & Tracking (3 bảng)
29. `analytics_events` (giữ nguyên)
30. `analytics_daily_summary` (giữ nguyên)
31. `tracking_scripts` (giữ nguyên)

### 2.9. Nhóm FAQ (2 bảng)
32. `faq_categories` (giữ nguyên)
33. `faq_questions` (giữ nguyên)

### 2.10. Nhóm CMS API & Webhooks (4 bảng)
34. `webhooks` (tạo mới)
35. `webhook_logs` (tạo mới)
36. `api_request_logs` (tạo mới)
37. `activity_logs` (bổ sung - CMS)

---

## 3. PHÂN LOẠI BẢNG

### 3.1. Bảng Giữ Nguyên (12 bảng)

| STT | Tên Bảng | Mục Đích |
|-----|----------|----------|
| 1 | `assets` | Lưu trữ file media (ảnh, video, PDF) |
| 2 | `asset_folders` | Tổ chức thư mục assets |
| 3 | `media_folders` | Thư mục uploads |
| 4 | `menu_locations` | Vị trí menu (header, footer) |
| 5 | `menu_items` | Các item trong menu |
| 6 | `page_metadata` | SEO metadata cho trang |
| 7 | `tracking_scripts` | Script tracking (GA, Meta Pixel) |
| 8 | `settings` | Cài đặt hệ thống (dùng chung CMS & IPD8) |
| 9 | `faq_categories` | Danh mục FAQ |
| 10 | `faq_questions` | Câu hỏi FAQ |
| 11 | `analytics_events` | Sự kiện analytics |
| 12 | `analytics_daily_summary` | Tổng hợp analytics theo ngày |

### 3.2. Bảng Tái Cấu Trúc (6 bảng)

| STT | Tên Bảng | Thay Đổi |
|-----|----------|----------|
| 1 | `users` | Thêm: phone, address, gender, dob, avatar_url, role (enum), email_verified, phone_verified, last_login_at |
| 2 | `posts` | Thêm: type, expert_id, event_date, event_location, view_count, is_featured, seo_title, seo_description. Đổi `content` từ JSONB → TEXT |
| 3 | `topics` | Giữ nguyên, có thể thêm: icon, color |
| 4 | `tags` | Giữ nguyên |
| 5 | `contact_forms` | Đổi tên từ `contact_messages`, thêm: course_interest, study_mode, status, resolved_by, resolved_at |
| 6 | `newsletter_subscriptions` | Giữ nguyên |

### 3.3. Bảng Tạo Mới - IPD8 (17 bảng)

| STT | Tên Bảng | Mục Đích |
|-----|----------|----------|
| 1 | `instructors` | Thông tin giảng viên |
| 2 | `courses` | Khóa học |
| 3 | `course_modules` | Module trong khóa học |
| 4 | `course_sessions` | Buổi học cụ thể |
| 5 | `enrollments` | Đăng ký khóa học |
| 6 | `progress` | Tiến độ học tập |
| 7 | `materials` | Tài liệu học tập |
| 8 | `orders` | Đơn hàng (IPD8) |
| 9 | `order_items` | Chi tiết đơn hàng |
| 10 | `payments` | Giao dịch thanh toán |
| 11 | `post_tags` | Tags của bài viết (IPD8 - dùng `tag_name`) |
| 12 | `notifications` | Thông báo người dùng |
| 13 | `session_registrations` | Đăng ký buổi học |
| 14 | `api_keys` | API authentication |
| 15 | `webhooks` | Webhook configuration |
| 16 | `webhook_logs` | Log webhook |
| 17 | `api_request_logs` | Log API requests |

### 3.4. Bảng Bổ Sung (2 bảng)

| STT | Tên Bảng | Mục Đích | Nguồn |
|-----|----------|----------|-------|
| 1 | `activity_logs` | Theo dõi user actions và system events | CMS Backend |
| 2 | `post_topics` | Junction table cho posts và topics | CMS Backend |

---

## 4. BẢNG MỚI ĐƯỢC THÊM

### 4.1. Bảng: `activity_logs`

**Mục đích:** Theo dõi hành động người dùng, thay đổi nội dung và sự kiện hệ thống

**Cấu trúc:**
```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'publish', 'login', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'post', 'user', 'order', etc.
    entity_id UUID, -- ID of the affected entity
    entity_name VARCHAR(255), -- Name/title of the affected entity for display
    description TEXT, -- Human-readable description
    metadata JSONB, -- Additional data (old values, new values, etc.)
    ip_address VARCHAR(45), -- IPv4 or IPv6
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_activity_logs_user_id` trên `user_id`
- `idx_activity_logs_entity` trên `(entity_type, entity_id)`
- `idx_activity_logs_action` trên `action`
- `idx_activity_logs_created_at` trên `created_at DESC`
- `idx_activity_logs_recent` trên `(created_at DESC, user_id)`

**Nguồn:** Tạo trong CMS backend migration (`042_activity_logs.sql`, `044_ipd8_cms_adjust_shared_schema.sql`)

**Sử dụng:**
- Track user actions (create, update, delete)
- Audit trail cho CMS
- Hiển thị recent activities trên dashboard

---

### 4.2. Bảng: `post_topics`

**Mục đích:** Junction table cho mối quan hệ many-to-many giữa `posts` và `topics`

**Cấu trúc:**
```sql
CREATE TABLE post_topics (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, topic_id)
);
```

**Indexes:**
- `idx_post_topics_post_id` trên `post_id`
- `idx_post_topics_topic_id` trên `topic_id`

**Lưu ý:**
- Đây là bảng junction table của CMS, khác với `post_tags` (IPD8) dùng `tag_name` trực tiếp
- Một post có thể có nhiều topics, một topic có thể được gán cho nhiều posts
- Sử dụng composite primary key `(post_id, topic_id)` để đảm bảo uniqueness

**Nguồn:** Tạo trong CMS backend migration (`001_init_schema.sql`, `011_topics_tags.sql`)

**Sử dụng:**
- Gán topics cho posts trong CMS
- Query posts theo topic
- Filter và navigation theo topics

---

## 5. SO SÁNH VỚI THIẾT KẾ BAN ĐẦU

### 5.1. Thiết Kế Ban Đầu (35 bảng)

| Loại | Số Lượng |
|------|----------|
| Bảng giữ nguyên | 12 |
| Bảng tái cấu trúc | 6 |
| Bảng tạo mới (IPD8) | 17 |
| **Tổng** | **35** |

### 5.2. Thực Tế Hiện Tại (37 bảng)

| Loại | Số Lượng |
|------|----------|
| Bảng giữ nguyên | 12 |
| Bảng tái cấu trúc | 6 |
| Bảng tạo mới (IPD8) | 17 |
| Bảng bổ sung | 2 |
| **Tổng** | **37** |

### 5.3. Lý Do Thêm 2 Bảng

1. **`activity_logs`**: 
   - Cần thiết cho CMS để theo dõi user actions và audit trail
   - Hỗ trợ hiển thị recent activities trên dashboard
   - Quan trọng cho security và compliance

2. **`post_topics`**: 
   - Junction table cần thiết cho mối quan hệ many-to-many giữa posts và topics trong CMS
   - Cho phép một post có nhiều topics và một topic có nhiều posts
   - Hỗ trợ filtering và navigation theo topics

### 5.4. Phân Biệt `post_tags` và `post_topics`

| Bảng | Mục Đích | Cấu Trúc | Nguồn |
|-------|----------|----------|-------|
| `post_tags` (IPD8) | Tags của bài viết | `post_id` + `tag_name` (VARCHAR) | IPD8 Schema |
| `post_topics` (CMS) | Topics của bài viết | `post_id` + `topic_id` (FK) | CMS Backend |

**Lưu ý:** 
- `post_tags` dùng `tag_name` trực tiếp (không có FK đến bảng `tags`)
- `post_topics` dùng `topic_id` (FK đến bảng `topics`)

---

## 6. TÀI LIỆU LIÊN QUAN

### 6.1. Tài Liệu Thiết Kế

- [DATABASE_DESIGN_IPD8_OVERVIEW.md](./DATABASE_DESIGN_IPD8_OVERVIEW.md) - Tổng quan thiết kế
- [DATABASE_DESIGN_IPD8_TABLES_KEEP.md](./DATABASE_DESIGN_IPD8_TABLES_KEEP.md) - Chi tiết bảng giữ nguyên
- [DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md](./DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md) - Chi tiết bảng tái cấu trúc
- [DATABASE_DESIGN_IPD8_TABLES_NEW.md](./DATABASE_DESIGN_IPD8_TABLES_NEW.md) - Chi tiết bảng tạo mới
- [DATABASE_DESIGN_IPD8_MIGRATION.md](./DATABASE_DESIGN_IPD8_MIGRATION.md) - Kế hoạch migration

### 6.2. Migration Files

- `Projects/cms-backend/src/migrations/042_activity_logs.sql` - Tạo bảng activity_logs
- `Projects/cms-backend/src/migrations/044_ipd8_cms_adjust_shared_schema.sql` - Tạo lại activity_logs
- `Projects/cms-backend/src/migrations/001_init_schema.sql` - Tạo bảng post_topics
- `Projects/cms-backend/src/migrations/011_topics_tags.sql` - Tạo lại post_topics

---

## 7. TÓM TẮT

### 7.1. Tổng Kết

- **Tổng số bảng:** 37 bảng
- **Bảng giữ nguyên:** 12 bảng
- **Bảng tái cấu trúc:** 6 bảng
- **Bảng tạo mới (IPD8):** 17 bảng
- **Bảng bổ sung:** 2 bảng (`activity_logs`, `post_topics`)

### 7.2. Điểm Quan Trọng

1. ✅ **Bám sát 100% schema IPD8** - Tất cả bảng và trường đều khớp với thiết kế
2. ✅ **Bảng `post_tags`**: Dùng `tag_name` (VARCHAR), không phải `tag_id` (FK)
3. ✅ **Bảng `post_topics`**: Junction table với `post_id` + `topic_id` (FK)
4. ✅ **Bảng `activity_logs`**: Theo dõi user actions và system events
5. ✅ **Bảng `settings`**: Dùng chung cho cả CMS và IPD8, sử dụng cấu trúc `namespace` + `value` (JSONB)

---

**Tài liệu này cung cấp schema đầy đủ với 37 bảng trong database IPD8 Learning Platform.**













