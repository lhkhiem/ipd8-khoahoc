-- Migration: Sliders table for hero/banner slider management
-- This table stores slider items with images, text, and links

CREATE TABLE IF NOT EXISTS sliders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  button_text VARCHAR(100),
  button_link VARCHAR(500),
  image_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  image_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sliders_order ON sliders(order_index);
CREATE INDEX IF NOT EXISTS idx_sliders_active ON sliders(is_active);
CREATE INDEX IF NOT EXISTS idx_sliders_image_id ON sliders(image_id);

-- Comments
COMMENT ON TABLE sliders IS 'Stores slider/banner items for hero sections';
COMMENT ON COLUMN sliders.order_index IS 'Order of display, lower numbers appear first';
COMMENT ON COLUMN sliders.is_active IS 'Whether this slider item is active and should be displayed';

