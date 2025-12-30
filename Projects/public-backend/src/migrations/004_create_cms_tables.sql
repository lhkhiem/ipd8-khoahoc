-- ============================================
-- MIGRATION: IPD8 Database Schema - Create CMS Tables
-- Tạo 15 bảng còn thiếu (12 bảng giữ nguyên + 3 bảng tái cấu trúc)
-- Bám sát 100% tài liệu DATABASE_DESIGN_IPD8_TABLES_KEEP.md và REFACTOR.md
-- ============================================

BEGIN;

-- Enable extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. BẢNG ASSETS & MEDIA (3 bảng)
-- ============================================

-- 1.1. Bảng: assets
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    provider VARCHAR(50) DEFAULT 's3',
    url VARCHAR(1024) NOT NULL,
    cdn_url VARCHAR(1024),
    width INTEGER,
    height INTEGER,
    format VARCHAR(50),
    sizes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_provider ON assets(provider);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at);

-- 1.2. Bảng: asset_folders
CREATE TABLE IF NOT EXISTS asset_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES asset_folders(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_asset_folders_parent ON asset_folders(parent_id);

-- 1.3. Bảng: media_folders
CREATE TABLE IF NOT EXISTS media_folders (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id INTEGER REFERENCES media_folders(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_folders_parent ON media_folders(parent_id);

-- ============================================
-- 2. BẢNG MENU & NAVIGATION (3 bảng)
-- ============================================

-- 2.1. Bảng: menu_locations
CREATE TABLE IF NOT EXISTS menu_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_menu_locations_slug ON menu_locations(slug);

-- 2.2. Bảng: menu_items
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_location_id UUID NOT NULL REFERENCES menu_locations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500),
    icon VARCHAR(100),
    type VARCHAR(50) DEFAULT 'custom',
    entity_id UUID,
    target VARCHAR(20) DEFAULT '_self',
    rel VARCHAR(100),
    css_classes TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_menu_items_location ON menu_items(menu_location_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent ON menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort ON menu_items(menu_location_id, sort_order);

-- 2.3. Bảng: page_metadata
CREATE TABLE IF NOT EXISTS page_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path VARCHAR(500) UNIQUE NOT NULL,
    title VARCHAR(255),
    description TEXT,
    keywords TEXT,
    og_image VARCHAR(500),
    og_title VARCHAR(255),
    og_description TEXT,
    canonical_url VARCHAR(500),
    robots VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_page_metadata_path ON page_metadata(page_path);

-- ============================================
-- 3. BẢNG SETTINGS & TRACKING (2 bảng)
-- ============================================

-- 3.1. Bảng: settings (CMS & IPD8 dùng chung)
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_settings_namespace ON settings(namespace);

-- 3.2. Bảng: tracking_scripts
CREATE TABLE IF NOT EXISTS tracking_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(50) NOT NULL,
    script_code TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tracking_scripts_location ON tracking_scripts(location);
CREATE INDEX IF NOT EXISTS idx_tracking_scripts_active ON tracking_scripts(is_active);

-- ============================================
-- 4. BẢNG FAQ (2 bảng)
-- ============================================

-- 4.1. Bảng: faq_categories
CREATE TABLE IF NOT EXISTS faq_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_faq_categories_slug ON faq_categories(slug);
CREATE INDEX IF NOT EXISTS idx_faq_categories_sort_order ON faq_categories(sort_order);

-- 4.2. Bảng: faq_questions
CREATE TABLE IF NOT EXISTS faq_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES faq_categories(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_faq_questions_category_id ON faq_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_faq_questions_sort_order ON faq_questions(sort_order);

-- ============================================
-- 5. BẢNG ANALYTICS (2 bảng)
-- ============================================

-- 5.1. Bảng: analytics_events
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL DEFAULT 'pageview',
    page_url TEXT NOT NULL,
    page_title VARCHAR(500),
    page_path VARCHAR(500),
    referrer TEXT,
    visitor_id VARCHAR(100) NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    user_agent TEXT,
    browser VARCHAR(100),
    browser_version VARCHAR(50),
    os VARCHAR(100),
    os_version VARCHAR(50),
    device_type VARCHAR(20),
    ip_address VARCHAR(45),
    country_code VARCHAR(2),
    country_name VARCHAR(100),
    city VARCHAR(100),
    screen_width INTEGER,
    screen_height INTEGER,
    viewport_width INTEGER,
    viewport_height INTEGER,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(200),
    utm_term VARCHAR(200),
    utm_content VARCHAR(200),
    traffic_source VARCHAR(50),
    time_on_page INTEGER,
    is_bounce BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_id ON analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_path ON analytics_events(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);

-- 5.2. Bảng: analytics_daily_summary
CREATE TABLE IF NOT EXISTS analytics_daily_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE UNIQUE NOT NULL,
    total_pageviews INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0,
    avg_pages_per_session DECIMAL(10,2) DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_summary_date ON analytics_daily_summary(date DESC);

-- ============================================
-- 6. BẢNG TÁI CẤU TRÚC (3 bảng - Giữ nguyên structure)
-- ============================================

-- 6.1. Bảng: topics
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_topics_slug ON topics(slug);

-- 6.2. Bảng: tags
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- 6.3. Bảng: newsletter_subscriptions
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);

COMMIT;






















