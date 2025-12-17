-- Cleanup invalid category relationships
-- Remove records where product_id is NULL (orphan records)

-- Delete invalid relationships
DELETE FROM product_product_categories
WHERE product_id IS NULL;

-- Also delete relationships where product no longer exists
DELETE FROM product_product_categories ppc
WHERE NOT EXISTS (
  SELECT 1 FROM products p WHERE p.id = ppc.product_id
);

-- Also delete relationships where category no longer exists
DELETE FROM product_product_categories ppc
WHERE NOT EXISTS (
  SELECT 1 FROM product_categories pc WHERE pc.id = ppc.category_id
);

-- Show summary
SELECT 
  'Valid relationships' as type,
  COUNT(*) as count
FROM product_product_categories ppc
INNER JOIN products p ON ppc.product_id = p.id
INNER JOIN product_categories pc ON ppc.category_id = pc.id

UNION ALL

SELECT 
  'Invalid relationships (product_id NULL)' as type,
  COUNT(*) as count
FROM product_product_categories
WHERE product_id IS NULL

UNION ALL

SELECT 
  'Invalid relationships (product not exists)' as type,
  COUNT(*) as count
FROM product_product_categories ppc
WHERE NOT EXISTS (
  SELECT 1 FROM products p WHERE p.id = ppc.product_id
)

UNION ALL

SELECT 
  'Invalid relationships (category not exists)' as type,
  COUNT(*) as count
FROM product_product_categories ppc
WHERE NOT EXISTS (
  SELECT 1 FROM product_categories pc WHERE pc.id = ppc.category_id
);







