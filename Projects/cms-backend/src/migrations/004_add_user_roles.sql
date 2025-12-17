-- Add role column to users for RBAC
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'admin';

-- Index for role lookup
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
