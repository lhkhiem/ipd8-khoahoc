-- Newsletter Subscriptions Migration
-- Table to store newsletter email subscriptions

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, unsubscribed, bounced
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP NULL,
  source VARCHAR(255), -- Where they subscribed from (footer, deals page, etc.)
  ip_address VARCHAR(45), -- Store IP for tracking
  user_agent TEXT, -- Store user agent for tracking
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_status ON newsletter_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_subscribed_at ON newsletter_subscriptions(subscribed_at DESC);

-- Add comments
COMMENT ON TABLE newsletter_subscriptions IS 'Newsletter email subscriptions from website visitors';
COMMENT ON COLUMN newsletter_subscriptions.status IS 'Subscription status: active, unsubscribed, bounced';
COMMENT ON COLUMN newsletter_subscriptions.source IS 'Where the subscription originated (footer, deals page, etc.)';








