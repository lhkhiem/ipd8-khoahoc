-- Add ZaloPay fields to orders table
-- Migration: 036_add_zalopay_fields_to_orders.sql

-- Add ZaloPay transaction fields
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS zp_app_trans_id VARCHAR(64) UNIQUE,  -- yymmdd_orderId format from ZaloPay
  ADD COLUMN IF NOT EXISTS zp_trans_token TEXT,                 -- zp_trans_token from create order response
  ADD COLUMN IF NOT EXISTS zp_order_url TEXT,                   -- order_url to redirect user
  ADD COLUMN IF NOT EXISTS zp_trans_id BIGINT;                  -- zp_trans_id from callback/query

-- Create index for ZaloPay app_trans_id lookups
CREATE INDEX IF NOT EXISTS idx_orders_zp_app_trans_id ON orders(zp_app_trans_id);

-- Add comment
COMMENT ON COLUMN orders.zp_app_trans_id IS 'ZaloPay transaction ID in format yymmdd_orderId';
COMMENT ON COLUMN orders.zp_trans_token IS 'ZaloPay transaction token from create order';
COMMENT ON COLUMN orders.zp_order_url IS 'ZaloPay order URL to redirect user for payment';
COMMENT ON COLUMN orders.zp_trans_id IS 'ZaloPay transaction ID from callback/query';





