-- Customer Addresses Migration
-- Separate addresses table for customer account management

-- Ensure uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Address details
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company VARCHAR(255),
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'United States',
  phone VARCHAR(20),
  
  -- Address type and default
  is_default BOOLEAN DEFAULT FALSE,
  type VARCHAR(20) DEFAULT 'both' CHECK (type IN ('shipping', 'billing', 'both')),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(is_default);
CREATE INDEX IF NOT EXISTS idx_addresses_type ON addresses(type);

-- Add comments
COMMENT ON TABLE addresses IS 'Customer shipping and billing addresses';
COMMENT ON COLUMN addresses.type IS 'Address type: shipping, billing, or both';
COMMENT ON COLUMN addresses.is_default IS 'Whether this is the default address for its type';

