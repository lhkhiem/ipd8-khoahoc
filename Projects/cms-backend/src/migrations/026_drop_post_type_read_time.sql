-- Drop unused post_type and read_time columns from posts table

ALTER TABLE posts DROP COLUMN IF EXISTS post_type;
ALTER TABLE posts DROP COLUMN IF EXISTS read_time;

DROP INDEX IF EXISTS idx_posts_post_type;



