-- Activity Logs table
-- Tracks user actions, content changes, and system events

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'publish', 'login', etc.
    entity_type VARCHAR(50) NOT NULL, -- 'post', 'product', 'user', 'order', etc.
    entity_id UUID, -- ID of the affected entity
    entity_name VARCHAR(255), -- Name/title of the affected entity for display
    description TEXT, -- Human-readable description of the action
    metadata JSONB, -- Additional data (old values, new values, etc.)
    ip_address VARCHAR(45), -- IPv4 or IPv6
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- Index for recent activities query
CREATE INDEX IF NOT EXISTS idx_activity_logs_recent ON activity_logs(created_at DESC, user_id);

