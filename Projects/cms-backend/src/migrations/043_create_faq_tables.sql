-- FAQ Tables Migration
-- Create tables for FAQ Categories and Questions

-- Create FAQ Categories table
CREATE TABLE IF NOT EXISTS faq_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create FAQ Questions table
CREATE TABLE IF NOT EXISTS faq_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_faq_questions_category
    FOREIGN KEY (category_id)
    REFERENCES faq_categories(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_faq_categories_slug ON faq_categories(slug);
CREATE INDEX IF NOT EXISTS idx_faq_categories_sort_order ON faq_categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_faq_categories_is_active ON faq_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_faq_questions_category_id ON faq_questions(category_id);
CREATE INDEX IF NOT EXISTS idx_faq_questions_sort_order ON faq_questions(sort_order);
CREATE INDEX IF NOT EXISTS idx_faq_questions_is_active ON faq_questions(is_active);

-- Add comments
COMMENT ON TABLE faq_categories IS 'FAQ categories for organizing questions';
COMMENT ON COLUMN faq_categories.name IS 'Display name of the category';
COMMENT ON COLUMN faq_categories.slug IS 'URL-friendly identifier for the category';
COMMENT ON COLUMN faq_categories.sort_order IS 'Order in which categories are displayed';
COMMENT ON COLUMN faq_categories.is_active IS 'Whether the category is active and visible';

COMMENT ON TABLE faq_questions IS 'Individual FAQ questions and answers';
COMMENT ON COLUMN faq_questions.category_id IS 'Foreign key to faq_categories';
COMMENT ON COLUMN faq_questions.question IS 'The question text';
COMMENT ON COLUMN faq_questions.answer IS 'The answer text';
COMMENT ON COLUMN faq_questions.sort_order IS 'Order in which questions are displayed within a category';
COMMENT ON COLUMN faq_questions.is_active IS 'Whether the question is active and visible';




