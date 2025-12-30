-- ============================================
-- MIGRATION: IPD8 Database Schema - Refactor Existing Tables
-- Tái cấu trúc bảng cũ để phù hợp với IPD8 schema
-- ============================================

BEGIN;

-- ============================================
-- 1. Tái cấu trúc bảng: users
-- Thêm các cột mới cho IPD8
-- ============================================
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Update role column type (if it's ENUM, convert to VARCHAR)
-- Note: If role is already VARCHAR, this will do nothing
DO $$
BEGIN
    -- Check if role column exists and is ENUM type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'role'
        AND data_type = 'USER-DEFINED'
    ) THEN
        -- Convert ENUM to VARCHAR
        ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50);
    END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at) WHERE last_login_at IS NOT NULL;

-- ============================================
-- 2. Tái cấu trúc bảng: posts
-- Thêm các cột mới, đổi content từ JSONB → TEXT
-- ============================================
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'article' CHECK (type IN ('article', 'event')),
ADD COLUMN IF NOT EXISTS expert_id UUID REFERENCES instructors(id),
ADD COLUMN IF NOT EXISTS event_date DATE,
ADD COLUMN IF NOT EXISTS event_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- Convert content from JSONB to TEXT (if needed)
-- Note: This will preserve data by converting JSONB to text representation
DO $$
BEGIN
    -- Check if content column exists and is JSONB
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'content'
        AND data_type = 'jsonb'
    ) THEN
        -- Convert JSONB to TEXT
        -- This preserves the JSON structure as text
        ALTER TABLE posts 
        ALTER COLUMN content TYPE TEXT USING content::text;
        
        RAISE NOTICE '✓ Converted posts.content from JSONB to TEXT';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'content'
        AND data_type = 'text'
    ) THEN
        RAISE NOTICE '✓ posts.content is already TEXT';
    END IF;
END $$;

-- Extract SEO from JSONB seo column (if exists) to seo_title and seo_description
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'posts' 
        AND column_name = 'seo'
        AND data_type = 'jsonb'
    ) THEN
        -- Extract seo_title and seo_description from JSONB seo
        UPDATE posts 
        SET seo_title = COALESCE(seo_title, (seo->>'title')::VARCHAR(255)),
            seo_description = COALESCE(seo_description, (seo->>'description')::TEXT)
        WHERE seo IS NOT NULL 
        AND (seo_title IS NULL OR seo_description IS NULL);
        
        RAISE NOTICE '✓ Extracted SEO data from JSONB to separate columns';
    END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_expert_id ON posts(expert_id) WHERE expert_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_is_featured ON posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_posts_event_date ON posts(event_date) WHERE event_date IS NOT NULL;

-- ============================================
-- 3. Đổi tên bảng: contact_messages → contact_forms
-- ============================================
DO $$
BEGIN
    -- Check if contact_messages exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'contact_messages'
    ) THEN
        -- Rename table
        ALTER TABLE contact_messages RENAME TO contact_forms;
        RAISE NOTICE '✓ Renamed contact_messages to contact_forms';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'contact_forms'
    ) THEN
        RAISE NOTICE '✓ contact_forms already exists';
    END IF;
END $$;

-- Add new columns to contact_forms (if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'contact_forms'
    ) THEN
        ALTER TABLE contact_forms
        ADD COLUMN IF NOT EXISTS course_interest VARCHAR(255),
        ADD COLUMN IF NOT EXISTS study_mode VARCHAR(50),
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'resolved', 'closed')),
        ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES users(id),
        ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP;
        
        CREATE INDEX IF NOT EXISTS idx_contact_forms_status ON contact_forms(status);
        CREATE INDEX IF NOT EXISTS idx_contact_forms_resolved_by ON contact_forms(resolved_by) WHERE resolved_by IS NOT NULL;
        
        RAISE NOTICE '✓ Added new columns to contact_forms';
    END IF;
END $$;

COMMIT;

-- ============================================
-- Verification: Kiểm tra các thay đổi
-- ============================================
DO $$
DECLARE
    user_new_columns TEXT[];
    posts_new_columns TEXT[];
BEGIN
    -- Check users table new columns
    SELECT array_agg(column_name) INTO user_new_columns
    FROM information_schema.columns
    WHERE table_name = 'users'
    AND column_name IN ('phone', 'address', 'gender', 'dob', 'avatar_url', 'email_verified', 'phone_verified', 'last_login_at');
    
    IF array_length(user_new_columns, 1) >= 7 THEN
        RAISE NOTICE '✓ Users table: % new columns added', array_length(user_new_columns, 1);
    ELSE
        RAISE WARNING '⚠️  Users table: Only % new columns found (expected 7)', array_length(user_new_columns, 1);
    END IF;
    
    -- Check posts table new columns
    SELECT array_agg(column_name) INTO posts_new_columns
    FROM information_schema.columns
    WHERE table_name = 'posts'
    AND column_name IN ('type', 'expert_id', 'event_date', 'event_location', 'view_count', 'is_featured', 'seo_title', 'seo_description');
    
    IF array_length(posts_new_columns, 1) >= 8 THEN
        RAISE NOTICE '✓ Posts table: % new columns added', array_length(posts_new_columns, 1);
    ELSE
        RAISE WARNING '⚠️  Posts table: Only % new columns found (expected 8)', array_length(posts_new_columns, 1);
    END IF;
    
    -- Check contact_forms table
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'contact_forms'
    ) THEN
        RAISE NOTICE '✓ contact_forms table exists';
    ELSE
        RAISE WARNING '⚠️  contact_forms table does not exist';
    END IF;
END $$;























