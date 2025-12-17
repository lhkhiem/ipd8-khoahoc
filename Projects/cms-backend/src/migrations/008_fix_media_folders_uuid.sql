-- Migration 008: Fix media_folders to use UUID and update assets foreign key
-- Drop the old foreign key constraint from assets
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_folder_id_fkey;

-- Drop the old tables
DROP TABLE IF EXISTS media_folders CASCADE;
DROP TABLE IF EXISTS asset_folders CASCADE;

-- Create media_folders with UUID
CREATE TABLE media_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_folders_parent ON media_folders(parent_id);

-- Update assets table to reference media_folders instead of asset_folders
ALTER TABLE assets ADD CONSTRAINT assets_folder_id_fkey 
  FOREIGN KEY (folder_id) REFERENCES media_folders(id) ON DELETE SET NULL;

