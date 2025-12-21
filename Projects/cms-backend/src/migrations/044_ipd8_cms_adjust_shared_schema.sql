-- IPD8 CMS Adjustments for Shared Database (ipd8_db_staging)
-- Mục tiêu:
-- - Đồng bộ schema giữa CMS Backend và Public Backend khi dùng chung database
-- - Thêm các cột CMS-specific còn thiếu trên bảng posts
-- - Bổ sung các cột cho topics/tags theo model CMS
-- - Đảm bảo bảng activity_logs tồn tại cho dashboard hoạt động gần đây

BEGIN;

-- ============================================
-- 1. POSTS: Bổ sung các cột CMS-specific
-- ============================================

-- Bảng posts hiện tại được tạo bởi Public Backend (000_create_base_tables.sql)
-- Schema base: id, type, category, author_id, expert_id, title, slug, content, excerpt,
--              thumbnail_url, event_date, event_location, view_count, is_featured,
--              seo_title, seo_description, status, created_at, updated_at
--
-- CMS Backend cần thêm:
-- - cover_asset_id (liên kết assets)
-- - seo (JSONB - giữ metadata đầy đủ)
-- - header_code (TEXT)
-- - published_at (TIMESTAMP)
-- - read_time (VARCHAR)

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS cover_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS seo JSONB,
  ADD COLUMN IF NOT EXISTS header_code TEXT,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS read_time VARCHAR(50);

-- Index cho các cột mới (chỉ tạo nếu chưa có)
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);

-- ============================================
-- 2. TOPICS: Bổ sung cột theo CMS model
-- ============================================

-- Bảng topics hiện tại (Public Backend 004_create_cms_tables.sql):
-- id, name, slug, description, created_at, updated_at
--
-- CMS Backend cần thêm:
-- - color (VARCHAR(7))
-- - icon (VARCHAR(50))
-- - is_active (BOOLEAN)
-- - sort_order (INTEGER)

ALTER TABLE topics
  ADD COLUMN IF NOT EXISTS color VARCHAR(7),
  ADD COLUMN IF NOT EXISTS icon VARCHAR(50),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Index cho sort_order (phục vụ ORDER BY sort_order ASC, name ASC)
CREATE INDEX IF NOT EXISTS idx_topics_sort_order ON topics(sort_order);

-- ============================================
-- 3. TAGS: Bổ sung cột theo CMS model
-- ============================================

-- Bảng tags hiện tại (Public Backend 004_create_cms_tables.sql):
-- id, name, slug, created_at, updated_at
--
-- CMS Backend cần thêm:
-- - description (TEXT)
-- - color (VARCHAR(7))
-- - is_active (BOOLEAN)
-- - post_count (INTEGER)

ALTER TABLE tags
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS color VARCHAR(7),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_tags_is_active ON tags(is_active);
CREATE INDEX IF NOT EXISTS idx_tags_post_count ON tags(post_count);

-- ============================================
-- 4. ACTIVITY_LOGS: Bảng log hoạt động CMS
-- ============================================

-- Nếu bảng activity_logs chưa tồn tại (staging mới), tạo theo migration 042_activity_logs.sql

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,        -- 'create', 'update', 'delete', 'publish', 'login', etc.
    entity_type VARCHAR(50) NOT NULL,    -- 'post', 'product', 'user', 'order', etc.
    entity_id UUID,                      -- ID của entity bị ảnh hưởng
    entity_name VARCHAR(255),            -- Tên/tiêu đề entity để hiển thị
    description TEXT,                    -- Mô tả human-readable
    metadata JSONB,                      -- Dữ liệu thêm (old/new values, v.v.)
    ip_address VARCHAR(45),              -- IPv4/IPv6
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_recent ON activity_logs(created_at DESC, user_id);

COMMIT;











