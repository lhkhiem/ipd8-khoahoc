CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create product_groups table to hold shared product data
CREATE TABLE IF NOT EXISTS product_groups (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  content JSONB,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  is_best_seller BOOLEAN DEFAULT FALSE,
  thumbnail_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  published_at TIMESTAMP,
  seo JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_groups_slug ON product_groups(slug);
CREATE INDEX IF NOT EXISTS idx_product_groups_status ON product_groups(status);

-- 2. Ensure products table can act as the concrete variant/sku entity
ALTER TABLE products ADD COLUMN IF NOT EXISTS group_id UUID;
ALTER TABLE products ADD COLUMN IF NOT EXISTS title_override VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS specs JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_position INTEGER DEFAULT 0;
ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_group_id_fkey,
  ADD CONSTRAINT products_group_id_fkey
    FOREIGN KEY (group_id) REFERENCES product_groups(id) ON DELETE CASCADE;

-- 3. Seed product_groups from legacy product rows (only once)
INSERT INTO product_groups (
  id, name, slug, description, content, category_id, brand_id,
  status, is_featured, is_best_seller, thumbnail_id, published_at,
  seo, created_at, updated_at
)
SELECT
  p.id, p.name, p.slug, p.description, p.content, p.category_id, p.brand_id,
  p.status, COALESCE(p.is_featured, FALSE), COALESCE(p.is_best_seller, FALSE),
  p.thumbnail_id, p.published_at, p.seo, p.created_at, p.updated_at
FROM products p
ON CONFLICT (id) DO NOTHING;

-- 4. Link existing products to their group (use legacy id when missing)
UPDATE products
SET group_id = COALESCE(group_id, id);

-- 5. Move shared attributes/images tables to the group scope
ALTER TABLE product_attributes RENAME TO product_group_attributes;
ALTER INDEX IF EXISTS idx_product_attributes_product_id RENAME TO idx_product_group_attributes_group_id;
ALTER TABLE product_group_attributes RENAME COLUMN product_id TO group_id;
ALTER TABLE product_group_attributes
  DROP CONSTRAINT IF EXISTS product_attributes_product_id_fkey,
  ADD CONSTRAINT product_group_attributes_group_id_fkey
    FOREIGN KEY (group_id) REFERENCES product_groups(id) ON DELETE CASCADE;

ALTER TABLE product_images RENAME TO product_group_images;
ALTER INDEX IF EXISTS idx_product_images_product_id RENAME TO idx_product_group_images_group_id;
ALTER TABLE product_group_images RENAME COLUMN product_id TO group_id;
ALTER TABLE product_group_images
  DROP CONSTRAINT IF EXISTS product_images_product_id_fkey,
  ADD CONSTRAINT product_group_images_group_id_fkey
    FOREIGN KEY (group_id) REFERENCES product_groups(id) ON DELETE CASCADE;

-- 6a. Junction table between products and categories now references groups
ALTER INDEX IF EXISTS idx_product_product_categories_product RENAME TO idx_product_group_categories_group;
ALTER TABLE product_product_categories RENAME COLUMN product_id TO group_id;
ALTER TABLE product_product_categories
  DROP CONSTRAINT IF EXISTS product_product_categories_product_id_fkey,
  ADD CONSTRAINT product_group_categories_group_id_fkey
    FOREIGN KEY (group_id) REFERENCES product_groups(id) ON DELETE CASCADE;
ALTER TABLE product_product_categories
  DROP CONSTRAINT IF EXISTS product_product_categories_pkey,
  ADD PRIMARY KEY (group_id, category_id);

-- 6. Product options now belong to the group instead of the legacy product row
ALTER TABLE product_options RENAME COLUMN product_id TO group_id;
ALTER TABLE product_options
  DROP CONSTRAINT IF EXISTS product_options_product_id_fkey,
  ADD CONSTRAINT product_options_group_id_fkey
    FOREIGN KEY (group_id) REFERENCES product_groups(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_product_options_group_id ON product_options(group_id);

-- 7. Variant option mappings now point to the concrete product (SKU) rows
ALTER TABLE product_variant_option_values RENAME TO product_option_assignments;
ALTER TABLE product_option_assignments RENAME COLUMN variant_id TO product_id;
ALTER TABLE product_option_assignments
  DROP CONSTRAINT IF EXISTS product_variant_option_values_variant_id_fkey,
  ADD CONSTRAINT product_option_assignments_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE product_option_assignments
  DROP CONSTRAINT IF EXISTS product_variant_option_values_option_id_fkey,
  ADD CONSTRAINT product_option_assignments_option_id_fkey
    FOREIGN KEY (option_id) REFERENCES product_options(id) ON DELETE CASCADE;
ALTER TABLE product_option_assignments
  DROP CONSTRAINT IF EXISTS product_variant_option_values_option_value_id_fkey,
  ADD CONSTRAINT product_option_assignments_option_value_id_fkey
    FOREIGN KEY (option_value_id) REFERENCES product_option_values(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_option_assignments_unique
  ON product_option_assignments(product_id, option_id);

-- 8. Variant attributes now reference concrete product rows
ALTER TABLE product_variant_attributes RENAME COLUMN variant_id TO product_id;
ALTER INDEX IF EXISTS idx_variant_attributes_variant RENAME TO idx_variant_attributes_product;
ALTER TABLE product_variant_attributes
  DROP CONSTRAINT IF EXISTS product_variant_attributes_variant_id_fkey;
ALTER TABLE product_variant_attributes
  ADD CONSTRAINT product_variant_attributes_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_product_variant_attributes_product_id
  ON product_variant_attributes(product_id);

-- 9. Ensure legacy slugs remain unique for variant rows (reserve canonical slug for group)
UPDATE products
SET slug = slug || '-default'
WHERE slug IS NOT NULL
  AND slug <> ''
  AND slug NOT LIKE '%-default';

UPDATE products
SET name = name || ' (Default)'
WHERE name IS NOT NULL
  AND group_id = id
  AND name NOT LIKE '%(Default)%';

-- 10. Migrate legacy product_variants into the products table (each SKU becomes its own product row)
INSERT INTO products (
  id, name, slug, description, content, category_id, brand_id,
  sku, price, compare_price, cost_price, stock, status,
  thumbnail_id, published_at, seo,
  created_at, updated_at, group_id,
  title_override, short_description, long_description, specs, variant_position
)
SELECT
  pv.id,
  COALESCE(pv.title_override, pg.name || ' Variant'),
  pg.slug || '-' || LEFT(pv.id::text, 8),
  NULL,
  NULL,
  pg.category_id,
  pg.brand_id,
  pv.sku,
  pv.price,
  pv.compare_price,
  NULL,
  pv.stock,
  pv.status,
  pv.thumbnail_asset_id,
  pg.published_at,
  pg.seo,
  pv.created_at,
  pv.updated_at,
  pv.product_id,
  pv.title_override,
  pv.short_description,
  pv.long_description,
  pv.specs,
  ROW_NUMBER() OVER (PARTITION BY pv.product_id ORDER BY pv.created_at)
FROM product_variants pv
JOIN product_groups pg ON pg.id = pv.product_id
ON CONFLICT (id) DO NOTHING;

-- 11. Drop legacy product_variants table (data has been migrated)
DROP TABLE IF EXISTS product_variants CASCADE;

-- 12. Final integrity adjustments
ALTER TABLE products ALTER COLUMN group_id SET NOT NULL;

-- keep consistent timestamps
UPDATE product_groups
SET updated_at = GREATEST(updated_at, NOW());
