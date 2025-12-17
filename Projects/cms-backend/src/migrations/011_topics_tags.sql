-- Migration: Topics and Tags
-- Description: Create tables for topics and tags management

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (to ensure clean migration)
DROP TABLE IF EXISTS post_topics CASCADE;
DROP TABLE IF EXISTS post_tags CASCADE;
DROP TABLE IF EXISTS topics CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- Topics table
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7), -- Hex color code, e.g., #FF5733
  icon VARCHAR(50), -- Icon name or class
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7), -- Hex color code, e.g., #3B82F6
  is_active BOOLEAN DEFAULT true,
  post_count INTEGER DEFAULT 0, -- Denormalized count for performance
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post-Topic relationship (many-to-many)
CREATE TABLE post_topics (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, topic_id)
);

-- Post-Tag relationship (many-to-many)
CREATE TABLE post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, tag_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_topics_slug ON topics(slug);
CREATE INDEX IF NOT EXISTS idx_topics_is_active ON topics(is_active);
CREATE INDEX IF NOT EXISTS idx_topics_sort_order ON topics(sort_order);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_is_active ON tags(is_active);
CREATE INDEX IF NOT EXISTS idx_tags_post_count ON tags(post_count);

CREATE INDEX IF NOT EXISTS idx_post_topics_post_id ON post_topics(post_id);
CREATE INDEX IF NOT EXISTS idx_post_topics_topic_id ON post_topics(topic_id);

CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);

-- Sample data for topics
INSERT INTO topics (name, slug, description, color, icon, sort_order) VALUES
  ('Technology', 'technology', 'Tech news, reviews, and tutorials', '#3B82F6', 'Cpu', 0),
  ('Business', 'business', 'Business strategies and insights', '#10B981', 'Briefcase', 1),
  ('Lifestyle', 'lifestyle', 'Health, travel, and personal growth', '#F59E0B', 'Heart', 2),
  ('Entertainment', 'entertainment', 'Movies, music, and pop culture', '#EF4444', 'Film', 3),
  ('Education', 'education', 'Learning resources and tutorials', '#8B5CF6', 'GraduationCap', 4)
ON CONFLICT (slug) DO NOTHING;

-- Sample data for tags
INSERT INTO tags (name, slug, description, color, post_count) VALUES
  ('JavaScript', 'javascript', 'JavaScript programming language', '#F7DF1E', 0),
  ('React', 'react', 'React.js library', '#61DAFB', 0),
  ('Next.js', 'nextjs', 'Next.js framework', '#000000', 0),
  ('TypeScript', 'typescript', 'TypeScript language', '#3178C6', 0),
  ('Node.js', 'nodejs', 'Node.js runtime', '#339933', 0),
  ('Tutorial', 'tutorial', 'Step-by-step guides', '#10B981', 0),
  ('News', 'news', 'Latest updates and announcements', '#EF4444', 0),
  ('Opinion', 'opinion', 'Personal thoughts and perspectives', '#F59E0B', 0),
  ('Review', 'review', 'Product and service reviews', '#8B5CF6', 0),
  ('Best Practices', 'best-practices', 'Industry standards and tips', '#3B82F6', 0)
ON CONFLICT (slug) DO NOTHING;

-- Trigger to update updated_at timestamp for topics
CREATE OR REPLACE FUNCTION update_topics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER topics_updated_at_trigger
BEFORE UPDATE ON topics
FOR EACH ROW
EXECUTE FUNCTION update_topics_updated_at();

-- Trigger to update updated_at timestamp for tags
CREATE OR REPLACE FUNCTION update_tags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tags_updated_at_trigger
BEFORE UPDATE ON tags
FOR EACH ROW
EXECUTE FUNCTION update_tags_updated_at();

-- Trigger to update tag post_count when post_tags changes
CREATE OR REPLACE FUNCTION update_tag_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE tags SET post_count = post_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE tags SET post_count = post_count - 1 WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tag_post_count_trigger
AFTER INSERT OR DELETE ON post_tags
FOR EACH ROW
EXECUTE FUNCTION update_tag_post_count();

