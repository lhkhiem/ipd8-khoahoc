-- Shopping Cart Migration
-- CLIENT MODEL: Cart and cart items for both guest and authenticated users
-- Supports session-based and user-based carts

-- Ensure uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cart Items table (simplified - no separate cart table)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User or session identification
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id VARCHAR(255), -- For guest carts
  
  -- Product reference
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Item details
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  snapshot_price DECIMAL(10, 2), -- Price at time of addition
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure either user_id or session_id is present
  CONSTRAINT check_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_product ON cart_items(user_id, product_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cart_items_session_product ON cart_items(session_id, product_id) WHERE session_id IS NOT NULL;

-- Add comments
COMMENT ON TABLE cart_items IS 'Shopping cart items for guests and authenticated users';
COMMENT ON COLUMN cart_items.snapshot_price IS 'Price snapshot to handle price changes';
COMMENT ON COLUMN cart_items.session_id IS 'Session ID for guest carts';

