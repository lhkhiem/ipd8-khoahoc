-- Simple settings key-value storage with JSONB values
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace VARCHAR(100) NOT NULL, -- e.g., 'general', 'appearance', 'security', 'advanced', 'seo'
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure unique namespace
CREATE UNIQUE INDEX IF NOT EXISTS uq_settings_namespace ON settings(namespace);
