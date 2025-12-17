-- Asset folders table for organizing media
CREATE TABLE IF NOT EXISTS asset_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES asset_folders(id) ON DELETE SET NULL,
    path TEXT, -- cached path like "/brand/logos"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add folder_id column to assets to link to folders
ALTER TABLE assets ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES asset_folders(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_asset_folders_parent_id ON asset_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_assets_folder_id ON assets(folder_id);
