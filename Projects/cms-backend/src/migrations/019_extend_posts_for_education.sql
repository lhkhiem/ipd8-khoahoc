-- Extend Posts Table for Education Content
-- Add support for courses, blog posts, and educational content

-- Ensure uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add post type to distinguish content types
ALTER TABLE posts ADD COLUMN IF NOT EXISTS post_type VARCHAR(50) DEFAULT 'article';
-- Values: 'article' | 'course' | 'blog' | 'page'

-- Add course-specific fields
ALTER TABLE posts ADD COLUMN IF NOT EXISTS duration VARCHAR(50);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS ceus VARCHAR(50);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS level VARCHAR(50);

-- Add blog-specific fields
ALTER TABLE posts ADD COLUMN IF NOT EXISTS read_time VARCHAR(50);

-- Add featured flag
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_posts_post_type ON posts(post_type);
CREATE INDEX IF NOT EXISTS idx_posts_is_featured ON posts(is_featured, status) WHERE is_featured = TRUE AND status = 'published';

-- Add comments
COMMENT ON COLUMN posts.post_type IS 'Type of post: article, course, blog, page';
COMMENT ON COLUMN posts.duration IS 'Course duration (e.g., "2 hours")';
COMMENT ON COLUMN posts.ceus IS 'CEU credits (e.g., "2 CEUs")';
COMMENT ON COLUMN posts.level IS 'Course level (e.g., "Beginner", "Advanced")';
COMMENT ON COLUMN posts.read_time IS 'Estimated reading time (e.g., "5 min read")';
COMMENT ON COLUMN posts.is_featured IS 'Featured content flag';



