-- Migration 031: Add slug column to education_resources table
-- This allows SEO-friendly URLs for education resources

-- Add slug column
ALTER TABLE education_resources 
ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Generate slugs from existing titles (simple slug generation)
-- This will create slugs like: "lash-brow-tinting-training-certificate"
UPDATE education_resources
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
)
WHERE slug IS NULL OR slug = '';

-- Make slug unique and not null
ALTER TABLE education_resources
ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_education_resources_slug ON education_resources(slug);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_education_resources_slug_active ON education_resources(slug, is_active);

COMMENT ON COLUMN education_resources.slug IS 'SEO-friendly URL slug for education resources';




