# CHI TIẾT BẢNG GIỮ NGUYÊN - IPD8 DATABASE DESIGN

**Mục đích:** Chi tiết các bảng giữ nguyên từ CMS cũ, không cần thay đổi

---

## 📋 MỤC LỤC

1. [Bảng Assets & Media](#31-bảng-assets--media)
2. [Bảng Menu & Navigation](#32-bảng-menu--navigation)
3. [Bảng Settings & Tracking](#33-bảng-settings--tracking)
4. [Bảng FAQ](#34-bảng-faq)
5. [Bảng Analytics](#35-bảng-analytics)

---

## 3.1. BẢNG ASSETS & MEDIA

### 3.1.1. Bảng: `assets`

**Mục đích:** Lưu trữ thông tin file media (ảnh, video, PDF, documents)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất của asset |
| `type` | VARCHAR(50) | NOT NULL | Loại file: 'image', 'video', 'document', 'pdf' |
| `provider` | VARCHAR(50) | DEFAULT 's3' | Storage provider: 's3', 'local', 'cloudinary' |
| `url` | VARCHAR(1024) | NOT NULL | URL đầy đủ của file |
| `cdn_url` | VARCHAR(1024) | NULL | URL CDN (nếu có) |
| `width` | INTEGER | NULL | Chiều rộng (cho ảnh/video) |
| `height` | INTEGER | NULL | Chiều cao (cho ảnh/video) |
| `format` | VARCHAR(50) | NULL | Định dạng file: 'jpg', 'png', 'mp4', 'pdf' |
| `sizes` | JSONB | NULL | Các kích thước khác nhau (responsive images) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |

**Indexes:**
- `idx_assets_type` trên `type`
- `idx_assets_provider` trên `provider`
- `idx_assets_created_at` trên `created_at`

---

### 3.1.2. Bảng: `asset_folders`

**Mục đích:** Tổ chức assets vào thư mục

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `name` | VARCHAR(255) | NOT NULL | Tên thư mục |
| `parent_id` | UUID | FOREIGN KEY → asset_folders.id | Thư mục cha (nested folders) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_asset_folders_parent` trên `parent_id`

---

### 3.1.3. Bảng: `media_folders`

**Mục đích:** Thư mục cho file uploads

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | SERIAL | PRIMARY KEY | ID duy nhất |
| `name` | VARCHAR(255) | NOT NULL | Tên thư mục |
| `parent_id` | INTEGER | FOREIGN KEY → media_folders.id | Thư mục cha |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_media_folders_parent` trên `parent_id`

---

## 3.2. BẢNG MENU & NAVIGATION

### 3.2.1. Bảng: `menu_locations`

**Mục đích:** Vị trí menu trên website (header, footer, sidebar)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `name` | VARCHAR(100) | NOT NULL | Tên vị trí: 'Header Menu', 'Footer Menu' |
| `slug` | VARCHAR(100) | UNIQUE, NOT NULL | Slug: 'header', 'footer', 'mobile' |
| `description` | TEXT | NULL | Mô tả vị trí |
| `is_active` | BOOLEAN | DEFAULT true | Trạng thái hoạt động |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_menu_locations_slug` trên `slug`

---

### 3.2.2. Bảng: `menu_items`

**Mục đích:** Các item trong menu (hierarchical structure)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `menu_location_id` | UUID | FOREIGN KEY → menu_locations.id, NOT NULL | ID vị trí menu |
| `parent_id` | UUID | FOREIGN KEY → menu_items.id | Item cha (nested menu) |
| `title` | VARCHAR(255) | NOT NULL | Tiêu đề hiển thị |
| `url` | VARCHAR(500) | NULL | URL link |
| `icon` | VARCHAR(100) | NULL | Icon class hoặc URL |
| `type` | VARCHAR(50) | DEFAULT 'custom' | Loại: 'custom', 'category', 'product', 'post', 'page' |
| `entity_id` | UUID | NULL | ID entity nếu type không phải 'custom' |
| `target` | VARCHAR(20) | DEFAULT '_self' | Target: '_self', '_blank' |
| `rel` | VARCHAR(100) | NULL | Rel attribute: 'nofollow', 'noopener' |
| `css_classes` | TEXT | NULL | CSS classes |
| `sort_order` | INTEGER | DEFAULT 0 | Thứ tự sắp xếp |
| `is_active` | BOOLEAN | DEFAULT true | Trạng thái hoạt động |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_menu_items_location` trên `menu_location_id`
- `idx_menu_items_parent` trên `parent_id`
- `idx_menu_items_sort` trên `(menu_location_id, sort_order)`

---

### 3.2.3. Bảng: `page_metadata`

**Mục đích:** SEO metadata cho các trang

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `page_path` | VARCHAR(500) | UNIQUE, NOT NULL | Đường dẫn trang: '/courses', '/about' |
| `title` | VARCHAR(255) | NULL | SEO title |
| `description` | TEXT | NULL | SEO description |
| `keywords` | TEXT | NULL | SEO keywords |
| `og_image` | VARCHAR(500) | NULL | Open Graph image URL |
| `og_title` | VARCHAR(255) | NULL | Open Graph title |
| `og_description` | TEXT | NULL | Open Graph description |
| `canonical_url` | VARCHAR(500) | NULL | Canonical URL |
| `robots` | VARCHAR(100) | NULL | Robots meta: 'noindex, nofollow' |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_page_metadata_path` trên `page_path`

---

## 3.3. BẢNG SETTINGS & TRACKING

### 3.3.1. Bảng: `settings` (CMS & IPD8 - Dùng chung)

**Mục đích:** Cài đặt hệ thống cho cả CMS và IPD8 (key-value storage với namespace)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `namespace` | VARCHAR(100) | UNIQUE, NOT NULL | Namespace: 'general', 'appearance', 'security', 'seo', 'ipd8', 'courses', 'payments' |
| `value` | JSONB | NOT NULL, DEFAULT '{}' | Giá trị cài đặt (JSON object) |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `uq_settings_namespace` trên `namespace` (UNIQUE)

**Lưu ý:** 
- Bảng `settings` này dùng chung cho cả CMS và IPD8, sử dụng cấu trúc `namespace` + `value` (JSONB) để lưu trữ các cài đặt theo nhóm.
- **Namespace CMS:** 'general', 'appearance', 'email', 'security', 'seo', 'notifications', 'advanced', 'homepage_metrics'
- **Namespace IPD8:** 'ipd8', 'courses', 'payments', 'instructors', 'enrollments' (có thể thêm tùy nhu cầu)
- Mỗi namespace chứa một JSON object với nhiều settings liên quan, giúp tổ chức và quản lý dễ dàng hơn so với key-value đơn lẻ.

---

### 3.3.2. Bảng: `tracking_scripts`

**Mục đích:** Script tracking (Google Analytics, Meta Pixel, v.v.)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `name` | VARCHAR(255) | NOT NULL | Tên script: 'Google Analytics', 'Meta Pixel' |
| `location` | VARCHAR(50) | NOT NULL | Vị trí: 'head', 'body', 'footer' |
| `script_code` | TEXT | NOT NULL | Code script (HTML/JavaScript) |
| `is_active` | BOOLEAN | DEFAULT true | Trạng thái hoạt động |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_tracking_scripts_location` trên `location`
- `idx_tracking_scripts_active` trên `is_active`

---

## 3.4. BẢNG FAQ

### 3.4.1. Bảng: `faq_categories`

**Mục đích:** Danh mục FAQ

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `name` | VARCHAR(255) | NOT NULL | Tên danh mục |
| `slug` | VARCHAR(255) | UNIQUE, NOT NULL | URL slug |
| `sort_order` | INTEGER | DEFAULT 0 | Thứ tự hiển thị |
| `is_active` | BOOLEAN | DEFAULT true | Trạng thái hoạt động |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_faq_categories_slug` trên `slug`
- `idx_faq_categories_sort_order` trên `sort_order`

---

### 3.4.2. Bảng: `faq_questions`

**Mục đích:** Câu hỏi và câu trả lời FAQ

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `category_id` | UUID | FOREIGN KEY → faq_categories.id, NOT NULL | ID danh mục |
| `question` | TEXT | NOT NULL | Câu hỏi |
| `answer` | TEXT | NOT NULL | Câu trả lời |
| `sort_order` | INTEGER | DEFAULT 0 | Thứ tự hiển thị trong danh mục |
| `is_active` | BOOLEAN | DEFAULT true | Trạng thái hoạt động |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_faq_questions_category_id` trên `category_id`
- `idx_faq_questions_sort_order` trên `sort_order`

---

## 3.5. BẢNG ANALYTICS

### 3.5.1. Bảng: `analytics_events`

**Mục đích:** Lưu trữ sự kiện analytics (pageview, custom events)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `event_type` | VARCHAR(50) | NOT NULL, DEFAULT 'pageview' | Loại sự kiện: 'pageview', 'event', 'session_start', 'session_end' |
| `page_url` | TEXT | NOT NULL | URL trang |
| `page_title` | VARCHAR(500) | NULL | Tiêu đề trang |
| `page_path` | VARCHAR(500) | NULL | Đường dẫn trang |
| `referrer` | TEXT | NULL | Referrer URL |
| `visitor_id` | VARCHAR(100) | NOT NULL | ID visitor (từ cookie) |
| `session_id` | VARCHAR(100) | NOT NULL | ID session |
| `user_agent` | TEXT | NULL | User agent string |
| `browser` | VARCHAR(100) | NULL | Tên browser |
| `browser_version` | VARCHAR(50) | NULL | Phiên bản browser |
| `os` | VARCHAR(100) | NULL | Hệ điều hành |
| `os_version` | VARCHAR(50) | NULL | Phiên bản OS |
| `device_type` | VARCHAR(20) | NULL | Loại thiết bị: 'desktop', 'mobile', 'tablet' |
| `ip_address` | VARCHAR(45) | NULL | Địa chỉ IP (IPv4/IPv6) |
| `country_code` | VARCHAR(2) | NULL | Mã quốc gia: 'VN', 'US' |
| `country_name` | VARCHAR(100) | NULL | Tên quốc gia |
| `city` | VARCHAR(100) | NULL | Thành phố |
| `screen_width` | INTEGER | NULL | Chiều rộng màn hình |
| `screen_height` | INTEGER | NULL | Chiều cao màn hình |
| `viewport_width` | INTEGER | NULL | Chiều rộng viewport |
| `viewport_height` | INTEGER | NULL | Chiều cao viewport |
| `utm_source` | VARCHAR(100) | NULL | UTM source |
| `utm_medium` | VARCHAR(100) | NULL | UTM medium |
| `utm_campaign` | VARCHAR(200) | NULL | UTM campaign |
| `utm_term` | VARCHAR(200) | NULL | UTM term |
| `utm_content` | VARCHAR(200) | NULL | UTM content |
| `traffic_source` | VARCHAR(50) | NULL | Nguồn traffic: 'direct', 'organic', 'referral', 'social' |
| `time_on_page` | INTEGER | NULL | Thời gian trên trang (giây) |
| `is_bounce` | BOOLEAN | DEFAULT false | Có phải bounce không |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |

**Indexes:**
- `idx_analytics_events_visitor_id` trên `visitor_id`
- `idx_analytics_events_session_id` trên `session_id`
- `idx_analytics_events_created_at` trên `created_at DESC`
- `idx_analytics_events_page_path` trên `page_path`
- `idx_analytics_events_event_type` trên `event_type`

---

### 3.5.2. Bảng: `analytics_daily_summary`

**Mục đích:** Tổng hợp analytics theo ngày (để query nhanh hơn)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `date` | DATE | UNIQUE, NOT NULL | Ngày tổng hợp |
| `total_pageviews` | INTEGER | DEFAULT 0 | Tổng số pageviews |
| `unique_visitors` | INTEGER | DEFAULT 0 | Số visitor duy nhất |
| `total_sessions` | INTEGER | DEFAULT 0 | Tổng số sessions |
| `avg_session_duration` | INTEGER | DEFAULT 0 | Thời gian session trung bình (giây) |
| `avg_pages_per_session` | DECIMAL(10,2) | DEFAULT 0 | Số trang trung bình mỗi session |
| `bounce_rate` | DECIMAL(5,2) | DEFAULT 0 | Tỷ lệ bounce (%) |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_analytics_daily_summary_date` trên `date DESC`

---

## TÓM TẮT

Tất cả các bảng trên đều **giữ nguyên** từ CMS cũ, không cần migration. Chỉ cần đảm bảo các bảng này tồn tại trong database và có thể sử dụng trực tiếp.

**Xem thêm:**
- [Tổng quan](./DATABASE_DESIGN_IPD8_OVERVIEW.md)
- [Bảng tái cấu trúc](./DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md)
- [Bảng tạo mới](./DATABASE_DESIGN_IPD8_TABLES_NEW.md)
- [Migration plan](./DATABASE_DESIGN_IPD8_MIGRATION.md)



