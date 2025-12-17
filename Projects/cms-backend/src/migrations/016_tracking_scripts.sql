-- Tracking Scripts Migration
-- Quản lý tracking codes (Google Analytics, Facebook Pixel, etc.)

-- Ensure uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tracking Scripts table
CREATE TABLE IF NOT EXISTS tracking_scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,              -- Tên script (Google Analytics, Facebook Pixel, etc.)
  type VARCHAR(50) NOT NULL DEFAULT 'custom', -- 'analytics', 'pixel', 'custom', 'tag-manager'
  provider VARCHAR(100),                    -- 'google', 'facebook', 'microsoft', 'custom', etc.
  position VARCHAR(10) NOT NULL DEFAULT 'head', -- 'head' hoặc 'body'
  script_code TEXT NOT NULL,                -- Code HTML/JavaScript
  is_active BOOLEAN DEFAULT TRUE,           -- Enable/Disable
  load_strategy VARCHAR(20) DEFAULT 'sync', -- 'sync', 'async', 'defer'
  pages JSONB DEFAULT '["all"]'::jsonb,    -- ['all'] hoặc ['home', 'products', 'cart', 'checkout'] - Pages nào sẽ load
  priority INTEGER DEFAULT 0,               -- Thứ tự load (số nhỏ load trước)
  description TEXT,                         -- Mô tả script
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CHECK (position IN ('head', 'body')),
  CHECK (load_strategy IN ('sync', 'async', 'defer')),
  CHECK (type IN ('analytics', 'pixel', 'custom', 'tag-manager', 'heatmap', 'live-chat'))
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracking_scripts_active ON tracking_scripts(is_active);
CREATE INDEX IF NOT EXISTS idx_tracking_scripts_position ON tracking_scripts(position);
CREATE INDEX IF NOT EXISTS idx_tracking_scripts_pages ON tracking_scripts USING GIN(pages);
CREATE INDEX IF NOT EXISTS idx_tracking_scripts_priority ON tracking_scripts(priority);

-- Add comments
COMMENT ON TABLE tracking_scripts IS 'Quản lý tracking scripts (Google Analytics, Facebook Pixel, etc.)';
COMMENT ON COLUMN tracking_scripts.pages IS 'JSON array: ["all"] hoặc ["home", "products", "cart"]';
COMMENT ON COLUMN tracking_scripts.priority IS 'Số nhỏ load trước, mặc định 0';


