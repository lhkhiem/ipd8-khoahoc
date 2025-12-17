-- Migration: Contact Messages
-- Store and manage contact form submissions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contact Messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contact information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  
  -- Message content
  subject VARCHAR(255) NOT NULL, -- product, order, support, spa-development, partnership, other
  message TEXT NOT NULL,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'new', -- new, read, replied, archived
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Response tracking
  replied_at TIMESTAMP,
  replied_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reply_message TEXT,
  
  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_subject ON contact_messages(subject);
CREATE INDEX IF NOT EXISTS idx_contact_messages_assigned_to ON contact_messages(assigned_to) WHERE assigned_to IS NOT NULL;

-- Add comments
COMMENT ON TABLE contact_messages IS 'Stores contact form submissions from website';
COMMENT ON COLUMN contact_messages.status IS 'Message status: new, read, replied, archived';
COMMENT ON COLUMN contact_messages.subject IS 'Inquiry subject type: product, order, support, spa-development, partnership, other';







