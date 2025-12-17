-- Reintroduce read_time column on posts table
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS read_time VARCHAR(50);

COMMENT ON COLUMN posts.read_time IS 'Estimated reading time (e.g., "5 min read")';

-- Optional index for quicker filtering/sorting by read_time
CREATE INDEX IF NOT EXISTS idx_posts_read_time ON posts (read_time);

