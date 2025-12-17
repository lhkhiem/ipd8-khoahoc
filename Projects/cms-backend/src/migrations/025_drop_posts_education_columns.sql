-- Drop legacy education-related columns from posts now handled by education_resources

ALTER TABLE posts DROP COLUMN IF EXISTS duration;
ALTER TABLE posts DROP COLUMN IF EXISTS ceus;
ALTER TABLE posts DROP COLUMN IF EXISTS level;



