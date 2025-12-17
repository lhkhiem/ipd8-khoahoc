# MIGRATION PLAN - IPD8 DATABASE DESIGN

**Mục đích:** Kế hoạch migration database từ CMS cũ sang IPD8 schema mới

---

## 📋 MỤC LỤC

1. [Tổng Quan Migration](#1-tổng-quan-migration)
2. [Thứ Tự Migration](#2-thứ-tự-migration)
3. [Script Migration Chi Tiết](#3-script-migration-chi-tiết)
4. [Rollback Plan](#4-rollback-plan)
5. [Checklist](#5-checklist)

---

## 1. TỔNG QUAN MIGRATION

### 1.1. Mục Tiêu

- ✅ Tái cấu trúc các bảng CMS cũ để phù hợp IPD8
- ✅ Tạo mới các bảng IPD8 core
- ✅ Giữ nguyên các bảng CMS có thể dùng được
- ✅ Xóa bỏ các bảng e-commerce không dùng
- ✅ Không mất dữ liệu hiện có (chỉ xóa bảng e-commerce)
- ✅ Bám sát 100% schema IPD8

### 1.2. Nguyên Tắc

1. **Backup trước khi migration** - Luôn backup database trước
2. **Migration theo từng bước** - Không làm tất cả cùng lúc
3. **Test trên staging** - Test kỹ trước khi chạy production
4. **Transaction safe** - Dùng transaction để rollback nếu lỗi
5. **Verify sau migration** - Kiểm tra data integrity sau mỗi bước

---

## 2. THỨ TỰ MIGRATION

### 2.1. Bước 1: Backup Database

```bash
# Backup toàn bộ database
pg_dump -U postgres -d ipd8_db > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# Backup chỉ schema (không có data)
pg_dump -U postgres -d ipd8_db --schema-only > backup_schema_$(date +%Y%m%d_%H%M%S).sql

# Backup chỉ data (không có schema)
pg_dump -U postgres -d ipd8_db --data-only > backup_data_$(date +%Y%m%d_%H%M%S).sql
```

### 2.2. Bước 2: Tạo Bảng Mới (IPD8 Core)

**Thứ tự tạo bảng (theo dependency):**

1. `instructors` (phụ thuộc: `users`)
2. `courses` (phụ thuộc: `instructors`)
3. `course_modules` (phụ thuộc: `courses`)
4. `course_sessions` (phụ thuộc: `courses`, `instructors`)
5. `enrollments` (phụ thuộc: `users`, `courses`)
6. `progress` (phụ thuộc: `enrollments`, `course_modules`, `course_sessions`)
7. `materials` (phụ thuộc: `courses`)
8. `orders` (phụ thuộc: `users`)
9. `order_items` (phụ thuộc: `orders`, `courses`)
10. `payments` (phụ thuộc: `orders`)
11. `post_tags` (phụ thuộc: `posts`)
12. `notifications` (phụ thuộc: `users`)
13. `session_registrations` (phụ thuộc: `users`, `course_sessions`, `enrollments`)
14. `api_keys` - Không phụ thuộc
15. `webhooks` - Không phụ thuộc
16. `webhook_logs` (phụ thuộc: `webhooks`)
17. `api_request_logs` (phụ thuộc: `api_keys`)

### 2.3. Bước 3: Tái Cấu Trúc Bảng Cũ

1. `users` - Thêm cột mới
2. `posts` - Thêm cột mới, đổi `content` từ JSONB → TEXT
3. `contact_messages` → `contact_forms` - Đổi tên, thêm cột

### 2.4. Bước 4: Giữ Nguyên Bảng CMS

- Không cần migration, dùng trực tiếp

### 2.5. Bước 5: Xóa Bảng E-commerce Không Dùng

**Thứ tự xóa bảng (theo dependency - xóa bảng con trước):**

1. `review_reactions` (phụ thuộc: `product_reviews`)
2. `product_reviews` (phụ thuộc: `products`)
3. `product_variant_option_values` (phụ thuộc: `product_variants`, `product_options`, `product_option_values`)
4. `product_variant_attributes` (phụ thuộc: `product_variants`)
5. `product_option_values` (phụ thuộc: `product_options`)
6. `product_options` (phụ thuộc: `products`)
7. `product_variants` (phụ thuộc: `products`)
8. `stock_movements` (phụ thuộc: `products`, `product_variants`)
9. `stock_settings` (phụ thuộc: `products`, `product_variants`)
10. `product_images` (phụ thuộc: `products`, `assets`)
11. `product_attributes` (phụ thuộc: `products`)
12. `cart_items` (phụ thuộc: `products`)
13. `wishlist_items` (phụ thuộc: `products`)
14. `order_items` (e-commerce) (phụ thuộc: `orders` e-commerce, `products`)
15. `orders` (e-commerce) (phụ thuộc: `users`)
16. `addresses` (phụ thuộc: `users`)
17. `products` (phụ thuộc: `product_categories`, `brands`, `assets`)
18. `product_categories` (phụ thuộc: `product_categories` - self reference)
19. `brands` (phụ thuộc: `assets`)

### 2.6. Bước 6: Tạo Indexes & Constraints

- Tạo tất cả indexes
- Tạo foreign keys
- Tạo unique constraints

---

## 3. SCRIPT MIGRATION CHI TIẾT

### 3.1. Script Tạo Bảng Mới

```sql
-- ============================================
-- MIGRATION: IPD8 Database Schema
-- BÁM SÁT 100% schema IPD8
-- ============================================

BEGIN;

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. Bảng: instructors
-- ============================================
CREATE TABLE IF NOT EXISTS instructors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    credentials TEXT NOT NULL,
    bio TEXT,
    specialties JSONB,
    achievements JSONB,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_courses INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_instructors_user_id ON instructors(user_id);
CREATE INDEX IF NOT EXISTS idx_instructors_is_featured ON instructors(is_featured);
CREATE INDEX IF NOT EXISTS idx_instructors_rating ON instructors(rating DESC);

-- ============================================
-- 2. Bảng: courses
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    target_audience VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    benefits_mom TEXT,
    benefits_baby TEXT,
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    price_type VARCHAR(20) NOT NULL DEFAULT 'one-off' CHECK (price_type IN ('one-off', 'subscription')),
    duration_minutes INTEGER NOT NULL,
    mode VARCHAR(20) NOT NULL DEFAULT 'group' CHECK (mode IN ('group', 'one-on-one')),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    featured BOOLEAN DEFAULT false,
    thumbnail_url VARCHAR(500),
    video_url VARCHAR(500),
    instructor_id UUID REFERENCES instructors(id),
    seo_title VARCHAR(255),
    seo_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured);
CREATE INDEX IF NOT EXISTS idx_courses_target_audience ON courses(target_audience);
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);

-- ============================================
-- 3. Bảng: course_modules
-- ============================================
CREATE TABLE IF NOT EXISTS course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_order ON course_modules(course_id, "order");

-- ============================================
-- 4. Bảng: course_sessions
-- ============================================
CREATE TABLE IF NOT EXISTS course_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES instructors(id),
    "order" INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    capacity INTEGER NOT NULL DEFAULT 10,
    enrolled_count INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'full', 'cancelled', 'done')),
    meeting_link VARCHAR(500),
    meeting_type VARCHAR(20) CHECK (meeting_type IN ('google-meet', 'zoom', 'offline')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_course_sessions_course_id ON course_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_course_sessions_instructor_id ON course_sessions(instructor_id);
CREATE INDEX IF NOT EXISTS idx_course_sessions_start_time ON course_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_course_sessions_status ON course_sessions(status);

-- ============================================
-- 5. Bảng: enrollments
-- ============================================
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('trial', 'standard', 'combo', '3m', '6m', '12m', '24m')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'completed')),
    start_date DATE,
    end_date DATE,
    progress_percent DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_dates ON enrollments(start_date, end_date);

-- ============================================
-- 6. Bảng: progress
-- ============================================
CREATE TABLE IF NOT EXISTS progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    module_id UUID REFERENCES course_modules(id) ON DELETE SET NULL,
    session_id UUID REFERENCES course_sessions(id) ON DELETE SET NULL,
    progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    feedback TEXT,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_progress_enrollment_id ON progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_progress_module_id ON progress(module_id);
CREATE INDEX IF NOT EXISTS idx_progress_session_id ON progress(session_id);

-- ============================================
-- 7. Bảng: materials
-- ============================================
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_key VARCHAR(500) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    visibility VARCHAR(20) NOT NULL DEFAULT 'enrolled' CHECK (visibility IN ('public', 'private', 'enrolled')),
    provider VARCHAR(50) NOT NULL,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_materials_course_id ON materials(course_id);
CREATE INDEX IF NOT EXISTS idx_materials_visibility ON materials(visibility);

-- ============================================
-- 8. Bảng: orders (IPD8)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'VND',
    status VARCHAR(20) NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
    gateway VARCHAR(50) NOT NULL DEFAULT 'zalopay',
    description TEXT,
    metadata JSONB,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- 9. Bảng: order_items
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    price DECIMAL(12,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_course_id ON order_items(course_id);

-- ============================================
-- 10. Bảng: payments
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    gateway_txn_id VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    paid_at TIMESTAMP,
    raw_response JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_txn_id ON payments(gateway_txn_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ============================================
-- 11. Bảng: post_tags (IPD8 - tag_name)
-- ============================================
CREATE TABLE IF NOT EXISTS post_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, tag_name)
);

CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_name ON post_tags(tag_name);

-- ============================================
-- 12. Bảng: notifications
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50),
    link VARCHAR(500),
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- 13. Bảng: session_registrations
-- ============================================
CREATE TABLE IF NOT EXISTS session_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES course_sessions(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES enrollments(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'attended')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, session_id)
);

CREATE INDEX IF NOT EXISTS idx_session_registrations_user_id ON session_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_session_registrations_session_id ON session_registrations(session_id);
CREATE INDEX IF NOT EXISTS idx_session_registrations_status ON session_registrations(status);

-- ============================================
-- 14. Bảng: api_keys
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    api_secret VARCHAR(64) NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]',
    rate_limit INTEGER DEFAULT 1000,
    ip_whitelist TEXT[],
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(api_key) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- ============================================
-- 15. Bảng: webhooks
-- ============================================
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url VARCHAR(500) NOT NULL,
    secret VARCHAR(64) NOT NULL,
    events TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhooks_is_active ON webhooks(is_active);

-- ============================================
-- 16. Bảng: webhook_logs
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_logs (
    id BIGSERIAL PRIMARY KEY,
    webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
    event VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
    status_code INTEGER,
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_time_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_sent_at ON webhook_logs(sent_at DESC);

-- ============================================
-- 17. Bảng: api_request_logs
-- ============================================
CREATE TABLE IF NOT EXISTS api_request_logs (
    id BIGSERIAL PRIMARY KEY,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    ip_address INET,
    user_agent TEXT,
    request_body JSONB,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_request_logs_api_key_id ON api_request_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_created_at ON api_request_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_endpoint ON api_request_logs(endpoint);

COMMIT;
```

### 3.2. Script Xóa Bảng E-commerce

```sql
-- ============================================
-- MIGRATION: Xóa bảng E-commerce không dùng
-- Thứ tự xóa: Bảng con trước, bảng cha sau
-- ============================================

BEGIN;

-- ============================================
-- 1. Xóa bảng con (có foreign key)
-- ============================================

-- Review reactions (phụ thuộc product_reviews)
DROP TABLE IF EXISTS review_reactions CASCADE;

-- Product reviews (phụ thuộc products)
DROP TABLE IF EXISTS product_reviews CASCADE;

-- Product variant option values (phụ thuộc product_variants, product_options)
DROP TABLE IF EXISTS product_variant_option_values CASCADE;

-- Product variant attributes (phụ thuộc product_variants)
DROP TABLE IF EXISTS product_variant_attributes CASCADE;

-- Product option values (phụ thuộc product_options)
DROP TABLE IF EXISTS product_option_values CASCADE;

-- Product options (phụ thuộc products)
DROP TABLE IF EXISTS product_options CASCADE;

-- Product variants (phụ thuộc products)
DROP TABLE IF EXISTS product_variants CASCADE;

-- Stock movements (phụ thuộc products, product_variants)
DROP TABLE IF EXISTS stock_movements CASCADE;

-- Stock settings (phụ thuộc products, product_variants)
DROP TABLE IF EXISTS stock_settings CASCADE;

-- Product images (phụ thuộc products, assets)
DROP TABLE IF EXISTS product_images CASCADE;

-- Product attributes (phụ thuộc products)
DROP TABLE IF EXISTS product_attributes CASCADE;

-- Cart items (phụ thuộc products)
DROP TABLE IF EXISTS cart_items CASCADE;

-- Wishlist items (phụ thuộc products)
DROP TABLE IF EXISTS wishlist_items CASCADE;

-- Order items (e-commerce) (phụ thuộc orders e-commerce, products)
DROP TABLE IF EXISTS order_items CASCADE;

-- ============================================
-- 2. Xóa bảng orders (e-commerce)
-- Lưu ý: IPD8 có bảng orders riêng, cần kiểm tra tên bảng
-- ============================================
-- Kiểm tra xem có bảng orders e-commerce không (có thể đã đổi tên)
-- Nếu có, xóa bảng orders e-commerce (khác với orders IPD8)
DO $$
BEGIN
    -- Kiểm tra xem có bảng orders e-commerce với cấu trúc e-commerce không
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'orders' 
        AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = 'shipping_address'
        )
    ) THEN
        -- Đổi tên bảng orders e-commerce trước khi xóa (để tránh conflict)
        ALTER TABLE orders RENAME TO orders_ecommerce_old;
        DROP TABLE IF EXISTS orders_ecommerce_old CASCADE;
    END IF;
END $$;

-- ============================================
-- 3. Xóa bảng addresses (customer addresses)
-- ============================================
DROP TABLE IF EXISTS addresses CASCADE;

-- ============================================
-- 4. Xóa bảng products và các bảng liên quan
-- ============================================

-- Products (phụ thuộc product_categories, brands, assets)
DROP TABLE IF EXISTS products CASCADE;

-- Product categories (có self-reference)
DROP TABLE IF EXISTS product_categories CASCADE;

-- Brands (phụ thuộc assets)
DROP TABLE IF EXISTS brands CASCADE;

-- ============================================
-- 5. Xóa các bảng product groups nếu có
-- ============================================
DROP TABLE IF EXISTS product_groups CASCADE;
DROP TABLE IF EXISTS product_group_images CASCADE;
DROP TABLE IF EXISTS product_group_attributes CASCADE;

COMMIT;

-- ============================================
-- Verification: Kiểm tra các bảng đã xóa
-- ============================================
DO $$
DECLARE
    remaining_tables TEXT[];
BEGIN
    SELECT array_agg(table_name) INTO remaining_tables
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
        'products', 'product_categories', 'brands', 'product_images',
        'product_attributes', 'product_variants', 'product_options',
        'cart_items', 'wishlist_items', 'product_reviews', 'stock_movements',
        'stock_settings', 'addresses'
    );
    
    IF remaining_tables IS NOT NULL AND array_length(remaining_tables, 1) > 0 THEN
        RAISE NOTICE 'Cảnh báo: Các bảng sau vẫn còn tồn tại: %', array_to_string(remaining_tables, ', ');
    ELSE
        RAISE NOTICE 'Thành công: Tất cả bảng e-commerce đã được xóa';
    END IF;
END $$;
```

**Lưu ý quan trọng:**
- ⚠️ **Kiểm tra bảng `orders`**: IPD8 có bảng `orders` riêng. Script trên sẽ kiểm tra và chỉ xóa bảng `orders` e-commerce (có `shipping_address`). Nếu tên bảng khác, cần điều chỉnh.
- ⚠️ **Backup trước khi xóa**: Đảm bảo đã backup database trước khi chạy script xóa.
- ⚠️ **CASCADE**: Dùng `CASCADE` để tự động xóa các foreign key constraints.

---

### 3.3. Script Tái Cấu Trúc Bảng Cũ

```sql
-- ============================================
-- MIGRATION: Tái cấu trúc bảng cũ
-- ============================================

BEGIN;

-- ============================================
-- 1. Tái cấu trúc bảng: users
-- ============================================
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

-- Cập nhật role enum
ALTER TABLE users
ALTER COLUMN role TYPE VARCHAR(50);

-- Tạo indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- ============================================
-- 2. Tái cấu trúc bảng: posts
-- ============================================
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
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' AND column_name = 'content' AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE posts
        ALTER COLUMN content TYPE TEXT USING content::text;
    END IF;
END $$;

-- Tạo indexes
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_expert_id ON posts(expert_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_featured ON posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);

-- ============================================
-- 3. Đổi tên và tái cấu trúc: contact_messages → contact_forms
-- ============================================
-- Đổi tên bảng (nếu tồn tại)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_messages') THEN
        ALTER TABLE contact_messages RENAME TO contact_forms;
    END IF;
END $$;

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

COMMIT;
```

---

## 4. ROLLBACK PLAN

### 4.1. Khi Nào Cần Rollback

- ❌ Lỗi nghiêm trọng trong quá trình migration
- ❌ Mất dữ liệu
- ❌ Performance degradation > 50%
- ❌ Security vulnerabilities

### 4.2. Cách Rollback

```sql
-- 1. Restore từ backup
psql -U postgres -d ipd8_db < backup_before_migration_YYYYMMDD_HHMMSS.sql

-- 2. Hoặc rollback từng bước
BEGIN;

-- Xóa bảng mới (nếu cần)
DROP TABLE IF EXISTS api_request_logs;
DROP TABLE IF EXISTS webhook_logs;
DROP TABLE IF EXISTS webhooks;
-- ... (xóa các bảng khác theo thứ tự ngược lại)

-- Revert các thay đổi bảng cũ
ALTER TABLE users
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS address,
-- ... (xóa các cột đã thêm)

COMMIT;
```

---

## 5. CHECKLIST

### 5.1. Pre-Migration

- [ ] Backup database toàn bộ
- [ ] Backup schema only
- [ ] Backup data only
- [ ] Test migration trên staging
- [ ] Review migration scripts
- [ ] Thông báo team về maintenance window

### 5.2. Migration Steps

- [ ] Bước 1: Backup database
- [ ] Bước 2: Xóa bảng e-commerce không dùng (20 bảng)
- [ ] Bước 3: Tạo bảng mới (17 bảng)
- [ ] Bước 4: Tái cấu trúc bảng cũ (3 bảng)
- [ ] Bước 5: Tạo indexes & constraints
- [ ] Bước 6: Verify data integrity

### 5.3. Post-Migration

- [ ] Verify tất cả bảng đã tạo
- [ ] Verify indexes đã tạo
- [ ] Verify foreign keys
- [ ] Test queries cơ bản
- [ ] Test API endpoints
- [ ] Monitor performance
- [ ] Update application code nếu cần

### 5.4. Verification Queries

```sql
-- Kiểm tra số lượng bảng
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public';

-- Kiểm tra bảng mới đã tạo
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('instructors', 'courses', 'enrollments', 'orders', 'payments');

-- Kiểm tra indexes
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%';

-- Kiểm tra foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

---

## TÓM TẮT

Migration plan này đảm bảo:
- ✅ An toàn - Backup trước, transaction safe
- ✅ Có thể rollback - Có plan rollback rõ ràng
- ✅ Bám sát IPD8 - 100% khớp với schema
- ✅ Xóa bảng không dùng - Loại bỏ 20 bảng e-commerce
- ✅ Không mất data quan trọng - Chỉ xóa bảng e-commerce, giữ lại data CMS và IPD8

**Xem thêm:**
- [Tổng quan](./DATABASE_DESIGN_IPD8_OVERVIEW.md)
- [Bảng giữ nguyên](./DATABASE_DESIGN_IPD8_TABLES_KEEP.md)
- [Bảng tái cấu trúc](./DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md)
- [Bảng tạo mới](./DATABASE_DESIGN_IPD8_TABLES_NEW.md)

