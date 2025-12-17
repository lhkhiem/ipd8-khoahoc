-- Homepage Value Props Migration
-- Supports dynamic management of homepage "value proposition" tiles

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS value_props (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Display content
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  icon_key VARCHAR(100),
  icon_color VARCHAR(50),
  icon_background VARCHAR(50),

  -- Ordering & visibility
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_value_props_active
  ON value_props (is_active, sort_order);

COMMENT ON TABLE value_props IS 'Homepage value proposition tiles (e.g., Free Shipping, Reduced Shipping).';
COMMENT ON COLUMN value_props.icon_key IS 'Icon identifier referenced on the frontend (e.g., shipping, discount, shield).';
COMMENT ON COLUMN value_props.subtitle IS 'Secondary text shown beneath the title (e.g., On orders $749+).';



