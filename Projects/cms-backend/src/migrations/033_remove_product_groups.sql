-- Migration: Remove product_groups, use product_id directly in product_product_categories
-- This migration converts the group-based structure to direct product-category relationships

BEGIN;

-- Step 1: Add product_id column to product_product_categories if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'product_product_categories' 
        AND column_name = 'product_id'
    ) THEN
        ALTER TABLE product_product_categories ADD COLUMN product_id UUID;
    END IF;
END $$;

-- Step 1.5: Drop primary key constraint if it exists (may include group_id)
DO $$
BEGIN
    -- Drop any primary key or unique constraint that includes group_id
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'product_product_categories' 
        AND constraint_type IN ('PRIMARY KEY', 'UNIQUE')
    ) THEN
        -- Try to find and drop the constraint
        EXECUTE (
            SELECT 'ALTER TABLE product_product_categories DROP CONSTRAINT IF EXISTS ' || constraint_name || ' CASCADE'
            FROM information_schema.table_constraints 
            WHERE table_schema = 'public' 
            AND table_name = 'product_product_categories' 
            AND constraint_type IN ('PRIMARY KEY', 'UNIQUE')
            LIMIT 1
        );
    END IF;
END $$;

-- Step 1.6: Make group_id nullable temporarily to allow migration
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'product_product_categories' 
        AND column_name = 'group_id'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE product_product_categories ALTER COLUMN group_id DROP NOT NULL;
    END IF;
END $$;

-- Step 2: Migrate data from group_id to product_id
-- For each group-category relationship, create product-category relationships for all products in that group
INSERT INTO product_product_categories (product_id, category_id, created_at)
SELECT DISTINCT
    p.id as product_id,
    ppc.category_id,
    COALESCE(ppc.created_at, NOW())
FROM products p
INNER JOIN product_product_categories ppc ON p.group_id = ppc.group_id
WHERE p.id IS NOT NULL
  AND ppc.category_id IS NOT NULL
  AND NOT EXISTS (
    -- Avoid duplicates
    SELECT 1 FROM product_product_categories existing
    WHERE existing.product_id = p.id
      AND existing.category_id = ppc.category_id
  );

-- Step 3: Remove the old group_id column from product_product_categories
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'product_product_categories' 
        AND column_name = 'group_id'
    ) THEN
        ALTER TABLE product_product_categories DROP COLUMN group_id;
    END IF;
END $$;

-- Step 4: Add foreign key constraint for product_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'product_product_categories_product_id_fkey'
    ) THEN
        ALTER TABLE product_product_categories
        ADD CONSTRAINT product_product_categories_product_id_fkey
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 5: Add index for product_id
CREATE INDEX IF NOT EXISTS idx_product_product_categories_product_id 
ON product_product_categories(product_id);

-- Step 6: Add unique constraint to prevent duplicate product-category relationships
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'product_product_categories_product_category_unique'
    ) THEN
        ALTER TABLE product_product_categories
        ADD CONSTRAINT product_product_categories_product_category_unique
        UNIQUE (product_id, category_id);
    END IF;
END $$;

COMMIT;

