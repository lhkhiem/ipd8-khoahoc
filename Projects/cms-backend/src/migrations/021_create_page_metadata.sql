-- Create page_metadata table for managing SEO metadata for individual pages
CREATE TABLE IF NOT EXISTS page_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path VARCHAR(500) NOT NULL UNIQUE, -- e.g., '/about', '/products/product-slug', '/posts/post-slug'
    title VARCHAR(500),
    description TEXT,
    og_image VARCHAR(1000), -- URL or path to OG image
    keywords TEXT[], -- Array of keywords
    enabled BOOLEAN DEFAULT TRUE,
    auto_generated BOOLEAN DEFAULT FALSE, -- TRUE for auto-generated product/post metadata, FALSE for custom
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups by path
CREATE INDEX IF NOT EXISTS idx_page_metadata_path ON page_metadata(path);
CREATE INDEX IF NOT EXISTS idx_page_metadata_auto_generated ON page_metadata(auto_generated);

-- Add comment
COMMENT ON TABLE page_metadata IS 'Stores SEO metadata for individual pages (static pages, products, posts)';
COMMENT ON COLUMN page_metadata.path IS 'Unique path identifier for the page (e.g., /about, /products/slug)';
COMMENT ON COLUMN page_metadata.auto_generated IS 'TRUE for auto-generated metadata (products/posts), FALSE for custom metadata';








