-- Migration: Create product_images and product_attributes tables if they don't exist
-- This migration creates direct product-image and product-attribute relationships
-- without using product_groups

BEGIN;

-- Step 1: Create product_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  asset_id UUID NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) 
    REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT product_images_asset_id_fkey FOREIGN KEY (asset_id) 
    REFERENCES assets(id) ON DELETE CASCADE,
  CONSTRAINT product_images_product_asset_unique UNIQUE (product_id, asset_id)
);

-- Step 2: Create index for product_id
CREATE INDEX IF NOT EXISTS idx_product_images_product_id 
ON product_images(product_id);

-- Step 3: Create index for sort_order
CREATE INDEX IF NOT EXISTS idx_product_images_sort_order 
ON product_images(product_id, sort_order);

-- Step 4: Migrate data from product_group_images to product_images
-- For each product, copy images from its group
INSERT INTO product_images (product_id, asset_id, sort_order, created_at)
SELECT DISTINCT
  p.id as product_id,
  pgi.asset_id,
  pgi.sort_order,
  COALESCE(pgi.created_at, NOW())
FROM products p
INNER JOIN product_group_images pgi ON p.group_id = pgi.group_id
WHERE p.id IS NOT NULL
  AND pgi.asset_id IS NOT NULL
  AND NOT EXISTS (
    -- Avoid duplicates
    SELECT 1 FROM product_images existing
    WHERE existing.product_id = p.id
      AND existing.asset_id = pgi.asset_id
  )
ON CONFLICT (product_id, asset_id) DO NOTHING;

-- Step 5: Create product_attributes table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT product_attributes_product_id_fkey FOREIGN KEY (product_id) 
    REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT product_attributes_product_name_unique UNIQUE (product_id, name)
);

-- Step 6: Create index for product_id
CREATE INDEX IF NOT EXISTS idx_product_attributes_product_id 
ON product_attributes(product_id);

-- Step 7: Create index for name
CREATE INDEX IF NOT EXISTS idx_product_attributes_name 
ON product_attributes(name);

-- Step 8: Migrate data from product_group_attributes to product_attributes
-- For each product, copy attributes from its group
INSERT INTO product_attributes (product_id, name, value, created_at)
SELECT DISTINCT
  p.id as product_id,
  pga.name,
  pga.value,
  COALESCE(pga.created_at, NOW())
FROM products p
INNER JOIN product_group_attributes pga ON p.group_id = pga.group_id
WHERE p.id IS NOT NULL
  AND pga.name IS NOT NULL
  AND NOT EXISTS (
    -- Avoid duplicates
    SELECT 1 FROM product_attributes existing
    WHERE existing.product_id = p.id
      AND existing.name = pga.name
  )
ON CONFLICT (product_id, name) DO NOTHING;

COMMIT;

