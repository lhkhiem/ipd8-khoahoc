# THIẾT KẾ DATABASE SCHEMA - IPD8 LEARNING PLATFORM
## Tổng quan và Phân loại Bảng

**Ngày tạo:** 2025-01-XX  
**Phiên bản:** 2.0 (Bám sát 100% schema IPD8)  
**Mục đích:** Tài liệu tổng quan thiết kế database cho hệ thống IPD8 Learning Platform

---

## 📋 MỤC LỤC

1. [Tổng Quan](#1-tổng-quan)
2. [Phân Loại Bảng](#2-phân-loại-bảng)
3. [Danh Sách Bảng Theo Nhóm](#3-danh-sách-bảng-theo-nhóm)
4. [Tài Liệu Liên Quan](#4-tài-liệu-liên-quan)

---

## 1. TỔNG QUAN

### 1.1. Thống Kê

| Loại | Số Lượng | Mô Tả |
|------|----------|-------|
| **Bảng giữ nguyên** | 12 | Media, Menu, Settings (CMS & IPD8), Analytics, FAQ |
| **Bảng tái cấu trúc** | 6 | Users, Posts, Topics, Tags, Contact, Newsletter |
| **Bảng tạo mới (IPD8)** | 17 | Courses, Instructors, Enrollments, Orders, Payments, v.v. |
| **Bảng xóa bỏ** | 20 | E-commerce (Products, Cart, Wishlist, Inventory) - không dùng cho IPD8 |
| **TỔNG CỘNG** | **35** | Bảng cuối cùng sau khi xóa bỏ (12 + 6 + 17) |

### 1.2. Quy Ước

- ✅ **Giữ nguyên**: Dùng trực tiếp, không thay đổi
- 🔄 **Tái cấu trúc**: Thêm/sửa cột để phù hợp IPD8
- ➕ **Tạo mới**: Bảng hoàn toàn mới cho IPD8
- ❌ **Xóa bỏ**: Bảng e-commerce không dùng cho IPD8, sẽ xóa trong migration

### 1.3. Nguyên Tắc Thiết Kế

1. **Bám sát 100% schema IPD8** - Tất cả bảng và trường đều khớp với `DATABASE_SCHEMA.md`
2. **Tái sử dụng tối đa** - Giữ nguyên các bảng CMS có thể dùng được
3. **Migration an toàn** - Không mất dữ liệu, chỉ thêm/sửa cột
4. **Tách biệt rõ ràng** - Bảng CMS và IPD8 có thể phân biệt được

---

## 2. PHÂN LOẠI BẢNG

### 2.1. Bảng Giữ Nguyên (12 bảng)

| STT | Tên Bảng | Mục Đích | File Chi Tiết |
|-----|----------|----------|---------------|
| 1 | `assets` | Lưu trữ file media (ảnh, video, PDF) | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_KEEP.md#311-bảng-assets) |
| 2 | `asset_folders` | Tổ chức thư mục assets | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_KEEP.md#312-bảng-asset_folders) |
| 3 | `media_folders` | Thư mục uploads | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_KEEP.md#313-bảng-media_folders) |
| 4 | `menu_locations` | Vị trí menu (header, footer) | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_KEEP.md#314-bảng-menu_locations) |
| 5 | `menu_items` | Các item trong menu | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_KEEP.md#315-bảng-menu_items) |
| 6 | `page_metadata` | SEO metadata cho trang | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_KEEP.md#316-bảng-page_metadata) |
| 7 | `tracking_scripts` | Script tracking (GA, Meta Pixel) | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_KEEP.md#317-bảng-tracking_scripts) |
| 8 | `settings` (CMS & IPD8) | Cài đặt hệ thống (dùng chung cho CMS và IPD8) | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_KEEP.md#318-bảng-settings-cms--ipd8-dùng-chung) |
| 9 | `faq_categories` | Danh mục FAQ | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_KEEP.md#319-bảng-faq_categories) |
| 10 | `faq_questions` | Câu hỏi FAQ | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_KEEP.md#3110-bảng-faq_questions) |
| 11 | `analytics_events` | Sự kiện analytics | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_KEEP.md#3111-bảng-analytics_events) |
| 12 | `analytics_daily_summary` | Tổng hợp analytics theo ngày | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_KEEP.md#3112-bảng-analytics_daily_summary) |

**Lưu ý:** Bảng `settings` dùng chung cho cả CMS và IPD8, sử dụng cấu trúc `namespace` + `value` (JSONB) để lưu trữ các cài đặt theo nhóm. Namespace CMS: 'general', 'appearance', 'email', 'security', 'seo', v.v. Namespace IPD8: 'ipd8', 'courses', 'payments', 'instructors', v.v.

### 2.2. Bảng Tái Cấu Trúc (6 bảng)

| STT | Tên Bảng | Thay Đổi | File Chi Tiết |
|-----|----------|----------|---------------|
| 1 | `users` | Thêm: phone, address, gender, dob, avatar_url, role (enum), email_verified, phone_verified, last_login_at | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md#321-bảng-users-tái-cấu-trúc) |
| 2 | `posts` | Thêm: type, expert_id, event_date, event_location, view_count, is_featured, seo_title, seo_description. Đổi `content` từ JSONB → TEXT | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md#322-bảng-posts-tái-cấu-trúc) |
| 3 | `topics` | Giữ nguyên, có thể thêm: icon, color | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md#323-bảng-topics) |
| 4 | `tags` | Giữ nguyên | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md#324-bảng-tags) |
| 5 | `contact_messages` → `contact_forms` | Đổi tên, thêm: course_interest, study_mode, status, resolved_by, resolved_at | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md#325-bảng-contact_forms) |
| 6 | `newsletter_subscriptions` | Giữ nguyên | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md#326-bảng-newsletter_subscriptions) |

### 2.3. Bảng Tạo Mới (17 bảng - IPD8 Core)

| STT | Tên Bảng | Mục Đích | File Chi Tiết |
|-----|----------|----------|---------------|
| 1 | `instructors` | Thông tin giảng viên | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_NEW.md#331-bảng-instructors) |
| 2 | `courses` | Khóa học | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_NEW.md#332-bảng-courses) |
| 3 | `course_modules` | Module trong khóa học | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_NEW.md#333-bảng-course_modules) |
| 4 | `course_sessions` | Buổi học cụ thể | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_NEW.md#334-bảng-course_sessions) |
| 5 | `enrollments` | Đăng ký khóa học | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_NEW.md#335-bảng-enrollments) |
| 6 | `progress` | Tiến độ học tập | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_NEW.md#336-bảng-progress) |
| 7 | `materials` | Tài liệu học tập | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_NEW.md#337-bảng-materials) |
| 8 | `orders` | Đơn hàng (IPD8) | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_NEW.md#338-bảng-orders) |
| 9 | `order_items` | Chi tiết đơn hàng | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_NEW.md#339-bảng-order_items) |
| 10 | `payments` | Giao dịch thanh toán | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_NEW.md#3310-bảng-payments) |
| 11 | `post_tags` | Tags của bài viết | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_NEW.md#3311-bảng-post_tags) |
| 12 | `notifications` | Thông báo người dùng | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_NEW.md#3312-bảng-notifications) |
| 13 | `session_registrations` | Đăng ký buổi học | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_NEW.md#3313-bảng-session_registrations) |
| 14 | `api_keys` | API authentication | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_NEW.md#3314-bảng-api_keys) |
| 15 | `webhooks` | Webhook configuration | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_NEW.md#3315-bảng-webhooks) |
| 16 | `webhook_logs` | Log webhook | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_NEW.md#3316-bảng-webhook_logs) |
| 17 | `api_request_logs` | Log API requests | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_NEW.md#3317-bảng-api_request_logs) |

### 2.4. Bảng Xóa Bỏ (20 bảng - E-commerce không dùng)

| STT | Tên Bảng | Mục Đích | File Chi Tiết |
|-----|----------|----------|---------------|
| 1 | `products` | Sản phẩm e-commerce | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#211-bảng-products) |
| 2 | `product_categories` | Danh mục sản phẩm | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#212-bảng-product_categories) |
| 3 | `brands` | Thương hiệu | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#213-bảng-brands) |
| 4 | `product_images` | Ảnh sản phẩm | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#214-bảng-product_images) |
| 5 | `product_attributes` | Thuộc tính sản phẩm | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#215-bảng-product_attributes) |
| 6 | `product_variants` | Biến thể sản phẩm | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#216-bảng-product_variants) |
| 7 | `product_options` | Tùy chọn sản phẩm | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#217-bảng-product_options) |
| 8 | `product_option_values` | Giá trị tùy chọn | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#218-bảng-product_option_values) |
| 9 | `product_variant_option_values` | Mapping variant-option | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#219-bảng-product_variant_option_values) |
| 10 | `product_variant_attributes` | Thuộc tính variant | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#2110-bảng-product_variant_attributes) |
| 11 | `cart_items` | Giỏ hàng | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#221-bảng-cart_items) |
| 12 | `wishlist_items` | Danh sách yêu thích | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#222-bảng-wishlist_items) |
| 13 | `product_reviews` | Đánh giá sản phẩm | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#241-bảng-product_reviews) |
| 14 | `review_reactions` | Phản ứng đánh giá | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#242-bảng-review_reactions) |
| 15 | `stock_movements` | Lịch sử stock | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#231-bảng-stock_movements) |
| 16 | `stock_settings` | Cài đặt stock | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#232-bảng-stock_settings) |
| 17 | `addresses` | Địa chỉ khách hàng | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#233-bảng-addresses) |
| 18 | `orders` (e-commerce) | Đơn hàng e-commerce | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#223-bảng-orders-e-commerce) |
| 19 | `order_items` (e-commerce) | Chi tiết đơn e-commerce | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#224-bảng-order_items-e-commerce) |
| 20 | `product_groups` (nếu có) | Nhóm sản phẩm | [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md#251-bảng-product_groups) |

**Lưu ý:** Tất cả các bảng trên sẽ được **xóa bỏ** trong migration vì không dùng cho IPD8 Learning Platform. Xem [Chi tiết](./DATABASE_DESIGN_IPD8_TABLES_DROP.md) và [Migration Plan](./DATABASE_DESIGN_IPD8_MIGRATION.md#32-script-xóa-bảng-e-commerce) để biết script xóa.

---

## 3. DANH SÁCH BẢNG THEO NHÓM

### 3.1. Nhóm User & Authentication

- `users` (tái cấu trúc)
- `instructors` (tạo mới)
- `api_keys` (tạo mới)

### 3.2. Nhóm Course & Learning

- `courses` (tạo mới)
- `course_modules` (tạo mới)
- `course_sessions` (tạo mới)
- `enrollments` (tạo mới)
- `progress` (tạo mới)
- `materials` (tạo mới)
- `session_registrations` (tạo mới)

### 3.3. Nhóm Payment & Orders

- `orders` (tạo mới - IPD8)
- `order_items` (tạo mới)
- `payments` (tạo mới)

### 3.4. Nhóm Content & Posts

- `posts` (tái cấu trúc)
- `topics` (tái cấu trúc)
- `tags` (tái cấu trúc)
- `post_tags` (tạo mới - theo schema IPD8)

### 3.5. Nhóm System & Settings

- `settings` (CMS & IPD8 - giữ nguyên, dùng chung)
- `notifications` (tạo mới)
- `contact_forms` (tái cấu trúc)
- `newsletter_subscriptions` (tái cấu trúc)

### 3.6. Nhóm Media & Assets

- `assets` (giữ nguyên)
- `asset_folders` (giữ nguyên)
- `media_folders` (giữ nguyên)

### 3.7. Nhóm Menu & Navigation

- `menu_locations` (giữ nguyên)
- `menu_items` (giữ nguyên)
- `page_metadata` (giữ nguyên)

### 3.8. Nhóm Analytics & Tracking

- `analytics_events` (giữ nguyên)
- `analytics_daily_summary` (giữ nguyên)
- `tracking_scripts` (giữ nguyên)

### 3.9. Nhóm FAQ

- `faq_categories` (giữ nguyên)
- `faq_questions` (giữ nguyên)

### 3.10. Nhóm CMS API & Webhooks

- `api_keys` (tạo mới)
- `webhooks` (tạo mới)
- `webhook_logs` (tạo mới)
- `api_request_logs` (tạo mới)

---

## 4. TÀI LIỆU LIÊN QUAN

### 4.1. File Chi Tiết

- **[DATABASE_DESIGN_IPD8_TABLES_KEEP.md](./DATABASE_DESIGN_IPD8_TABLES_KEEP.md)** - Chi tiết bảng giữ nguyên
- **[DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md](./DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md)** - Chi tiết bảng tái cấu trúc
- **[DATABASE_DESIGN_IPD8_TABLES_NEW.md](./DATABASE_DESIGN_IPD8_TABLES_NEW.md)** - Chi tiết bảng tạo mới
- **[DATABASE_DESIGN_IPD8_TABLES_DROP.md](./DATABASE_DESIGN_IPD8_TABLES_DROP.md)** - Chi tiết bảng xóa bỏ
- **[DATABASE_DESIGN_IPD8_MIGRATION.md](./DATABASE_DESIGN_IPD8_MIGRATION.md)** - Kế hoạch migration

### 4.2. Tài Liệu Gốc

- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Schema gốc của IPD8
- **[giai-phap-chuc-nang-cms-ipd8.md](./giai-phap-chuc-nang-cms-ipd8.md)** - Giải pháp CMS IPD8

---

## 5. TÓM TẮT

### 5.1. Tổng Kết

- **Tổng số bảng ban đầu:** 51 bảng (từ CMS cũ)
- **Bảng giữ nguyên:** 12 bảng (Media, Menu, Settings CMS & IPD8, Analytics, FAQ)
- **Bảng tái cấu trúc:** 6 bảng (Users, Posts, Topics, Tags, Contact, Newsletter)
- **Bảng tạo mới:** 17 bảng (Courses, Instructors, Enrollments, Orders, Payments, v.v.)
- **Bảng xóa bỏ:** 20 bảng (E-commerce - không dùng cho IPD8)
- **Tổng số bảng cuối cùng:** 35 bảng (12 + 6 + 17)

### 5.2. Điểm Quan Trọng

1. ✅ **Bám sát 100% schema IPD8** - Tất cả bảng và trường đều khớp với `DATABASE_SCHEMA.md`
2. ✅ **Bảng `post_tags`**: Dùng `tag_name` (VARCHAR), không phải `tag_id` (FK)
3. ✅ **Bảng `posts`**: `content` là TEXT, không phải JSONB
4. ✅ **Bảng `settings`**: Dùng chung cho cả CMS và IPD8, sử dụng cấu trúc `namespace` + `value` (JSONB) để tổ chức settings theo nhóm
5. ✅ **Migration an toàn** - Không mất dữ liệu, chỉ thêm/sửa cột

---

**Tài liệu này cung cấp tổng quan về database design. Xem các file chi tiết để biết thêm thông tin về từng bảng.**

