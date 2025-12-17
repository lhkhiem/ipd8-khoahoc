-- Script to delete metadata for /products/dau-massage-banyco-copy-copy
-- Run with: psql -U your_user -d your_database -f src/scripts/deleteMetadata.sql

-- First, check if the metadata exists
SELECT id, path, title, auto_generated 
FROM page_metadata 
WHERE path = '/products/dau-massage-banyco-copy-copy';

-- Delete the metadata
DELETE FROM page_metadata 
WHERE path = '/products/dau-massage-banyco-copy-copy';

-- Verify deletion
SELECT COUNT(*) as remaining_count
FROM page_metadata 
WHERE path = '/products/dau-massage-banyco-copy-copy';







