-- Extend product variants to support configurable options and per-variant attributes

-- Drop legacy variant options table if it exists
DROP TABLE IF EXISTS product_variant_options;

-- Extend product_variants with optional descriptive fields
ALTER TABLE product_variants
  ADD COLUMN IF NOT EXISTS title_override VARCHAR(255),
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS long_description TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS specs JSONB;

-- Option groups defined per product (e.g., RAM, Storage, Color)
CREATE TABLE IF NOT EXISTS product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_options_unique_name
  ON product_options(product_id, LOWER(name));

-- Values for each option (e.g., 8GB, 16GB, 512GB SSD, Blue)
CREATE TABLE IF NOT EXISTS product_option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
  value VARCHAR(255) NOT NULL,
  code VARCHAR(100),
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_option_values_unique
  ON product_option_values(option_id, LOWER(value));

-- Mapping between variants and the chosen option values (one per option)
CREATE TABLE IF NOT EXISTS product_variant_option_values (
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
  option_value_id UUID NOT NULL REFERENCES product_option_values(id) ON DELETE CASCADE,
  PRIMARY KEY (variant_id, option_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_variant_option_value_unique
  ON product_variant_option_values(variant_id, option_value_id);

-- Per-variant key/value attributes (specifications)
CREATE TABLE IF NOT EXISTS product_variant_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_variant_attributes_variant
  ON product_variant_attributes(variant_id);




