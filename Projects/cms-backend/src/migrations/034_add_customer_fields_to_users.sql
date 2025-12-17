-- Add customer profile fields to users table
-- Support for customer account management

-- Add first_name and last_name for customer profiles
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Add phone for customer contact
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add avatar for customer profile picture
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar VARCHAR(500);

-- Create index for phone lookup (optional, useful for customer service)
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;

-- Add comments
COMMENT ON COLUMN users.first_name IS 'Customer first name';
COMMENT ON COLUMN users.last_name IS 'Customer last name';
COMMENT ON COLUMN users.phone IS 'Customer phone number';
COMMENT ON COLUMN users.avatar IS 'Customer profile picture URL';

