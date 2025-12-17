-- Migration: Remove group_id from products table
-- Products no longer use groups, only direct many-to-many relationships with categories

BEGIN;

-- Step 1: Drop foreign key constraint
ALTER TABLE products 
  DROP CONSTRAINT IF EXISTS products_group_id_fkey;

-- Step 2: Make group_id nullable (remove NOT NULL constraint)
ALTER TABLE products 
  ALTER COLUMN group_id DROP NOT NULL;

-- Step 3: Set all existing group_id to NULL
UPDATE products 
SET group_id = NULL 
WHERE group_id IS NOT NULL;

-- Step 4: Drop the group_id column
ALTER TABLE products 
  DROP COLUMN IF EXISTS group_id;

-- Step 5: Drop product_groups table if it exists (no longer needed)
DROP TABLE IF EXISTS product_groups CASCADE;

COMMIT;







