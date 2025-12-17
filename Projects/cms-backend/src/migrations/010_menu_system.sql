-- Menu System Migration
-- Supports multiple menu locations and nested menu items with drag-drop ordering

-- Ensure uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create menu_locations table (header, footer, sidebar, etc.)
CREATE TABLE IF NOT EXISTS menu_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create menu_items table (nested structure with parent-child)
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_location_id UUID NOT NULL REFERENCES menu_locations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  
  -- Display info
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500),
  icon VARCHAR(100),
  
  -- Link type and reference
  type VARCHAR(50) NOT NULL DEFAULT 'custom', -- 'custom', 'category', 'product', 'post', 'page'
  entity_id UUID, -- Reference to category/product/post if applicable
  
  -- Link attributes
  target VARCHAR(20) DEFAULT '_self', -- '_self', '_blank'
  rel VARCHAR(100), -- 'nofollow', 'noopener', etc.
  css_classes TEXT,
  
  -- Ordering and display
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_menu_items_location ON menu_items(menu_location_id);
CREATE INDEX idx_menu_items_parent ON menu_items(parent_id);
CREATE INDEX idx_menu_items_sort ON menu_items(menu_location_id, sort_order);
CREATE INDEX idx_menu_items_type ON menu_items(type);

-- Insert default menu locations
INSERT INTO menu_locations (name, slug, description, is_active) VALUES
  ('Header Menu', 'header', 'Main navigation menu displayed in the header', true),
  ('Footer Menu', 'footer', 'Links displayed in the footer', true),
  ('Top Bar Menu', 'top-bar', 'Quick links in the top bar', true),
  ('Mobile Menu', 'mobile', 'Mobile navigation menu', true)
ON CONFLICT (slug) DO NOTHING;

-- Sample menu items for header (you can delete these later)
DO $$
DECLARE
  header_id UUID;
  products_parent_id UUID;
  electronics_id UUID;
  clothing_id UUID;
BEGIN
  -- Get header menu location ID
  SELECT id INTO header_id FROM menu_locations WHERE slug = 'header' LIMIT 1;
  
  IF header_id IS NOT NULL THEN
    -- Level 1: Home
    INSERT INTO menu_items (menu_location_id, title, url, type, sort_order)
    VALUES (header_id, 'Home', '/', 'custom', 0);
    
    -- Level 1: Products (parent)
    INSERT INTO menu_items (menu_location_id, title, url, type, sort_order)
    VALUES (header_id, 'Products', '/products', 'custom', 1)
    RETURNING id INTO products_parent_id;
    
    -- Level 2: Electronics (child of Products)
    INSERT INTO menu_items (menu_location_id, parent_id, title, url, type, sort_order)
    VALUES (header_id, products_parent_id, 'Electronics', '/products/electronics', 'category', 0)
    RETURNING id INTO electronics_id;
    
    -- Level 3: Electronics submenu (children of Electronics)
    INSERT INTO menu_items (menu_location_id, parent_id, title, url, type, sort_order)
    VALUES 
      (header_id, electronics_id, 'Phones', '/products/electronics/phones', 'category', 0),
      (header_id, electronics_id, 'Laptops', '/products/electronics/laptops', 'category', 1),
      (header_id, electronics_id, 'Tablets', '/products/electronics/tablets', 'category', 2),
      (header_id, electronics_id, 'Accessories', '/products/electronics/accessories', 'category', 3);
    
    -- Level 2: Clothing (child of Products)
    INSERT INTO menu_items (menu_location_id, parent_id, title, url, type, sort_order)
    VALUES (header_id, products_parent_id, 'Clothing', '/products/clothing', 'category', 1)
    RETURNING id INTO clothing_id;
    
    -- Level 3: Clothing submenu (children of Clothing)
    INSERT INTO menu_items (menu_location_id, parent_id, title, url, type, sort_order)
    VALUES 
      (header_id, clothing_id, 'Men', '/products/clothing/men', 'category', 0),
      (header_id, clothing_id, 'Women', '/products/clothing/women', 'category', 1),
      (header_id, clothing_id, 'Kids', '/products/clothing/kids', 'category', 2);
    
    -- Level 2: Home & Garden (child of Products)
    INSERT INTO menu_items (menu_location_id, parent_id, title, url, type, sort_order)
    VALUES (header_id, products_parent_id, 'Home & Garden', '/products/home-garden', 'category', 2);
    
    -- Level 2: Sale (child of Products)
    INSERT INTO menu_items (menu_location_id, parent_id, title, url, type, sort_order)
    VALUES (header_id, products_parent_id, 'Sale', '/products/sale', 'custom', 3);
    
    -- Level 1: Blog
    INSERT INTO menu_items (menu_location_id, title, url, type, sort_order)
    VALUES (header_id, 'Blog', '/blog', 'custom', 2);
    
    -- Level 1: About
    INSERT INTO menu_items (menu_location_id, title, url, type, sort_order)
    VALUES (header_id, 'About', '/about', 'custom', 3);
    
    -- Level 1: Contact
    INSERT INTO menu_items (menu_location_id, title, url, type, sort_order)
    VALUES (header_id, 'Contact', '/contact', 'custom', 4);
  END IF;
END $$;

-- Add comment
COMMENT ON TABLE menu_locations IS 'Stores different menu locations (header, footer, etc.)';
COMMENT ON TABLE menu_items IS 'Stores hierarchical menu items with drag-drop ordering support';

