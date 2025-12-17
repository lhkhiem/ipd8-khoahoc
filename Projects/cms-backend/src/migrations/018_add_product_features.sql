-- Add Product Features Migration
-- CLIENT MODEL: Add featured flag and best seller tracking to products

-- Ensure uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add featured flag to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT FALSE;

-- Add featured flag to categories (for CategoryGrid)
ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add featured flag to brands
ALTER TABLE brands ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured, status) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_is_best_seller ON products(is_best_seller, status) WHERE is_best_seller = TRUE;
CREATE INDEX IF NOT EXISTS idx_categories_is_featured ON product_categories(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_brands_is_featured ON brands(is_featured) WHERE is_featured = TRUE;

-- Add comments
COMMENT ON COLUMN products.is_featured IS 'Featured products for homepage display';
COMMENT ON COLUMN products.is_best_seller IS 'Best selling products';
COMMENT ON COLUMN product_categories.is_featured IS 'Featured categories for homepage';
COMMENT ON COLUMN brands.is_featured IS 'Featured brands for homepage';



