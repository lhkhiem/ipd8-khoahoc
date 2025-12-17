-- Migration: Consultation Submissions
-- Store and manage spa equipment setup consultation form submissions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Consultation Submissions table
CREATE TABLE IF NOT EXISTS consultation_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contact information
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  province VARCHAR(100) NOT NULL,
  
  -- Message content
  message TEXT,
  
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
CREATE INDEX IF NOT EXISTS idx_consultation_submissions_status ON consultation_submissions(status);
CREATE INDEX IF NOT EXISTS idx_consultation_submissions_phone ON consultation_submissions(phone);
CREATE INDEX IF NOT EXISTS idx_consultation_submissions_email ON consultation_submissions(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_consultation_submissions_province ON consultation_submissions(province);
CREATE INDEX IF NOT EXISTS idx_consultation_submissions_created_at ON consultation_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consultation_submissions_assigned_to ON consultation_submissions(assigned_to) WHERE assigned_to IS NOT NULL;

-- Add comments
COMMENT ON TABLE consultation_submissions IS 'Stores spa equipment setup consultation form submissions';
COMMENT ON COLUMN consultation_submissions.status IS 'Submission status: new, read, replied, archived';
COMMENT ON COLUMN consultation_submissions.province IS 'Province/city where the customer is located';

