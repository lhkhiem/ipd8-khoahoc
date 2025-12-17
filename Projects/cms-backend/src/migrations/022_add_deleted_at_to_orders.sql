-- Add deleted_at column to orders table for soft delete
-- This allows orders to be "hidden" instead of permanently deleted

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Create index for faster queries filtering out deleted orders
CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON orders(deleted_at) WHERE deleted_at IS NULL;

-- Add comment
COMMENT ON COLUMN orders.deleted_at IS 'Timestamp when order was soft deleted (hidden). NULL means order is active.';








