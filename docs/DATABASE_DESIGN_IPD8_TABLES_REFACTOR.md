# CHI TIẾT BẢNG TÁI CẤU TRÚC - IPD8 DATABASE DESIGN

**Mục đích:** Chi tiết các bảng cần tái cấu trúc (thêm/sửa cột) để phù hợp với schema IPD8

---

## 📋 MỤC LỤC

1. [Bảng Users](#321-bảng-users-tái-cấu-trúc)
2. [Bảng Posts](#322-bảng-posts-tái-cấu-trúc)
3. [Bảng Topics](#323-bảng-topics)
4. [Bảng Tags](#324-bảng-tags)
5. [Bảng Contact Forms](#325-bảng-contact_forms)
6. [Bảng Newsletter Subscriptions](#326-bảng-newsletter_subscriptions)

---

## 3.2.1. Bảng: `users` (Tái cấu trúc)

**Mục đích:** Lưu thông tin người dùng hệ thống (mở rộng từ CMS cũ)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả | Nguồn |
|---------|--------------|-----------|-------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất | CMS cũ |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email đăng nhập | CMS cũ |
| `password_hash` | VARCHAR(255) | NOT NULL | Mật khẩu đã hash (bcrypt) | CMS cũ |
| `name` | VARCHAR(255) | NOT NULL | Họ và tên | CMS cũ |
| `status` | VARCHAR(50) | DEFAULT 'active' | Trạng thái: 'active', 'inactive', 'suspended' | CMS cũ |
| `role` | ENUM('guest','student','instructor','admin') | NOT NULL, DEFAULT 'guest' | Vai trò (theo IPD8) | 🔄 SỬA từ CMS cũ |
| `phone` | VARCHAR(20) | NULL | Số điện thoại | ➕ MỚI |
| `address` | TEXT | NULL | Địa chỉ | ➕ MỚI |
| `gender` | ENUM('male','female','other') | NULL | Giới tính | ➕ MỚI |
| `dob` | DATE | NULL | Ngày sinh | ➕ MỚI |
| `avatar_url` | VARCHAR(500) | NULL | URL ảnh đại diện | ➕ MỚI |
| `email_verified` | BOOLEAN | DEFAULT false | Email đã xác thực | ➕ MỚI |
| `phone_verified` | BOOLEAN | DEFAULT false | SĐT đã xác thực | ➕ MỚI |
| `is_active` | BOOLEAN | DEFAULT true | Trạng thái hoạt động | ➕ MỚI |
| `last_login_at` | TIMESTAMP | NULL | Lần đăng nhập cuối | ➕ MỚI |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo | CMS cũ |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật | CMS cũ |

**Indexes:**
- `idx_users_email` trên `email`
- `idx_users_role` trên `role`
- `idx_users_created_at` trên `created_at`
- `idx_users_phone` trên `phone` (mới)
- `idx_users_email_verified` trên `email_verified` (mới)

**Migration SQL:**
```sql
-- Thêm các cột mới
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Cập nhật role enum (từ 'admin' → 'guest','student','instructor','admin')
ALTER TABLE users
ALTER COLUMN role TYPE VARCHAR(50);

-- Tạo indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
```

---

## 3.2.2. Bảng: `posts` (Tái cấu trúc - BÁM SÁT IPD8)

**Mục đích:** Bài viết/blog (mở rộng từ CMS cũ, khớp 100% schema IPD8)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả | Nguồn |
|---------|--------------|-----------|-------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất | CMS cũ |
| `slug` | VARCHAR(255) | UNIQUE, NOT NULL | URL slug | CMS cũ |
| `title` | VARCHAR(255) | NOT NULL | Tiêu đề bài viết | CMS cũ |
| `content` | TEXT | NOT NULL | Nội dung (TEXT, không phải JSONB) | 🔄 SỬA từ CMS cũ |
| `excerpt` | TEXT | NULL | Tóm tắt | CMS cũ |
| `thumbnail_url` | VARCHAR(500) | NULL | Ảnh đại diện | CMS cũ |
| `type` | ENUM('NEWS','EVENT','BLOG','FAQ','POLICY') | NOT NULL | Loại bài viết | ➕ MỚI |
| `category` | VARCHAR(100) | NULL | Danh mục | ➕ MỚI |
| `author_id` | UUID | FOREIGN KEY → users.id | ID tác giả | CMS cũ |
| `expert_id` | UUID | FOREIGN KEY → instructors.id | ID chuyên gia (cho BLOG) | ➕ MỚI |
| `event_date` | DATE | NULL | Ngày sự kiện (cho EVENT) | ➕ MỚI |
| `event_location` | VARCHAR(255) | NULL | Địa điểm (cho EVENT) | ➕ MỚI |
| `published_at` | TIMESTAMP | NULL | Ngày xuất bản | CMS cũ |
| `view_count` | INTEGER | DEFAULT 0 | Số lượt xem | ➕ MỚI |
| `is_featured` | BOOLEAN | DEFAULT false | Nổi bật | ➕ MỚI |
| `seo_title` | VARCHAR(255) | NULL | SEO title | ➕ MỚI |
| `seo_description` | TEXT | NULL | SEO description | ➕ MỚI |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo | CMS cũ |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật | CMS cũ |

**Lưu ý:** 
- CMS cũ có `content` là JSONB, IPD8 yêu cầu TEXT → cần migration
- CMS cũ có `cover_asset_id`, IPD8 dùng `thumbnail_url` → có thể giữ cả 2 hoặc migrate
- CMS cũ có `seo` (JSONB), IPD8 tách thành `seo_title` và `seo_description` → cần migration
- CMS cũ có `status`, IPD8 không có → có thể giữ lại hoặc xóa

**Indexes:**
- `idx_posts_slug` trên `slug`
- `idx_posts_type` trên `type` (mới)
- `idx_posts_published_at` trên `published_at`
- `idx_posts_author_id` trên `author_id`
- `idx_posts_expert_id` trên `expert_id` (mới)
- `idx_posts_is_featured` trên `is_featured` (mới)
- `idx_posts_view_count` trên `view_count DESC` (mới)

**Migration SQL:**
```sql
-- Thêm các cột mới
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'BLOG' CHECK (type IN ('NEWS', 'EVENT', 'BLOG', 'FAQ', 'POLICY')),
ADD COLUMN IF NOT EXISTS category VARCHAR(100),
ADD COLUMN IF NOT EXISTS expert_id UUID REFERENCES instructors(id),
ADD COLUMN IF NOT EXISTS event_date DATE,
ADD COLUMN IF NOT EXISTS event_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500);

-- Đổi content từ JSONB → TEXT (nếu cần)
-- Lưu ý: Cần convert JSONB content sang TEXT format
ALTER TABLE posts
ALTER COLUMN content TYPE TEXT USING content::text;

-- Tạo indexes
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_expert_id ON posts(expert_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_featured ON posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);
```

---

## 3.2.3. Bảng: `topics` (Giữ nguyên)

**Mục đích:** Chủ đề/Topic cho bài viết

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `name` | VARCHAR(255) | NOT NULL | Tên chủ đề |
| `slug` | VARCHAR(255) | UNIQUE, NOT NULL | URL slug |
| `description` | TEXT | NULL | Mô tả chủ đề |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_topics_slug` trên `slug`

**Lưu ý:** Bảng này giữ nguyên, không cần migration.

---

## 3.2.4. Bảng: `tags` (Giữ nguyên)

**Mục đích:** Tags cho bài viết (có thể dùng cho autocomplete, nhưng `post_tags` dùng `tag_name` trực tiếp)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `name` | VARCHAR(255) | NOT NULL | Tên tag |
| `slug` | VARCHAR(255) | UNIQUE, NOT NULL | URL slug |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật |

**Indexes:**
- `idx_tags_slug` trên `slug`

**Lưu ý:** Bảng này giữ nguyên. IPD8 có bảng `post_tags` riêng dùng `tag_name` trực tiếp (xem [DATABASE_DESIGN_IPD8_TABLES_NEW.md](./DATABASE_DESIGN_IPD8_TABLES_NEW.md#3311-bảng-post_tags)).

---

## 3.2.5. Bảng: `contact_forms` (Đổi tên từ `contact_messages`)

**Mục đích:** Form liên hệ từ website (BÁM SÁT IPD8)

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả | Nguồn |
|---------|--------------|-----------|-------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất | CMS cũ |
| `name` | VARCHAR(255) | NOT NULL | Họ tên | CMS cũ |
| `email` | VARCHAR(255) | NOT NULL | Email | CMS cũ |
| `phone` | VARCHAR(20) | NOT NULL | Số điện thoại | CMS cũ |
| `address` | TEXT | NULL | Địa chỉ | CMS cũ |
| `course_interest` | VARCHAR(255) | NULL | Khóa học quan tâm | ➕ MỚI |
| `study_mode` | VARCHAR(50) | NULL | Hình thức học | ➕ MỚI |
| `message` | TEXT | NOT NULL | Nội dung tin nhắn | CMS cũ |
| `status` | ENUM('new','processing','resolved','archived') | DEFAULT 'new' | Trạng thái xử lý | ➕ MỚI |
| `resolved_by` | UUID | FOREIGN KEY → users.id | Người xử lý | ➕ MỚI |
| `resolved_at` | TIMESTAMP | NULL | Ngày xử lý | ➕ MỚI |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày tạo | CMS cũ |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày cập nhật | CMS cũ |

**Indexes:**
- `idx_contact_forms_status` trên `status` (mới)
- `idx_contact_forms_created_at` trên `created_at`
- `idx_contact_forms_resolved_by` trên `resolved_by` (mới)

**Migration SQL:**
```sql
-- Đổi tên bảng (nếu cần)
ALTER TABLE contact_messages RENAME TO contact_forms;

-- Thêm các cột mới
ALTER TABLE contact_forms
ADD COLUMN IF NOT EXISTS course_interest VARCHAR(255),
ADD COLUMN IF NOT EXISTS study_mode VARCHAR(50),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'processing', 'resolved', 'archived')),
ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP;

-- Tạo indexes
CREATE INDEX IF NOT EXISTS idx_contact_forms_status ON contact_forms(status);
CREATE INDEX IF NOT EXISTS idx_contact_forms_resolved_by ON contact_forms(resolved_by);
```

---

## 3.2.6. Bảng: `newsletter_subscriptions` (Giữ nguyên)

**Mục đích:** Đăng ký nhận newsletter

| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
|---------|--------------|-----------|-------|
| `id` | UUID | PRIMARY KEY | ID duy nhất |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email đăng ký |
| `name` | VARCHAR(255) | NULL | Tên người đăng ký |
| `is_active` | BOOLEAN | DEFAULT true | Trạng thái đăng ký |
| `subscribed_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Ngày đăng ký |
| `unsubscribed_at` | TIMESTAMP | NULL | Ngày hủy đăng ký |

**Indexes:**
- `idx_newsletter_subscriptions_email` trên `email`

**Lưu ý:** Bảng này giữ nguyên, không cần migration.

---

## TÓM TẮT

### Bảng Cần Migration

1. ✅ **`users`** - Thêm 9 cột mới, sửa `role` enum
2. ✅ **`posts`** - Thêm 8 cột mới, đổi `content` từ JSONB → TEXT
3. ✅ **`contact_messages` → `contact_forms`** - Đổi tên, thêm 4 cột mới

### Bảng Giữ Nguyên (Không Cần Migration)

1. ✅ **`topics`** - Giữ nguyên
2. ✅ **`tags`** - Giữ nguyên
3. ✅ **`newsletter_subscriptions`** - Giữ nguyên

**Xem thêm:**
- [Tổng quan](./DATABASE_DESIGN_IPD8_OVERVIEW.md)
- [Bảng giữ nguyên](./DATABASE_DESIGN_IPD8_TABLES_KEEP.md)
- [Bảng tạo mới](./DATABASE_DESIGN_IPD8_TABLES_NEW.md)
- [Migration plan](./DATABASE_DESIGN_IPD8_MIGRATION.md)





