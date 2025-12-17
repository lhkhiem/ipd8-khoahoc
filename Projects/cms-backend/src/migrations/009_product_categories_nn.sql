-- Add junction table for n-n relationship between products and categories
-- This allows a product to belong to multiple categories

-- Junction table for Product-Category many-to-many relationship
CREATE TABLE IF NOT EXISTS product_product_categories (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, category_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_product_categories_product ON product_product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_product_categories_category ON product_product_categories(category_id);

-- Note: We keep the category_id field in products table for backward compatibility
-- and for designating a "primary" category if needed

