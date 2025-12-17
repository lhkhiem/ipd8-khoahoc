-- Analytics Migration
-- Self-hosted analytics system for tracking website traffic

-- Ensure uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Analytics Events Table
-- Stores every pageview and event
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Event Info
  event_type VARCHAR(50) NOT NULL DEFAULT 'pageview', -- 'pageview', 'event', 'session_start', 'session_end'
  
  -- Page Info
  page_url TEXT NOT NULL,
  page_title VARCHAR(500),
  page_path VARCHAR(500),
  referrer TEXT,
  
  -- Visitor Info
  visitor_id VARCHAR(100) NOT NULL, -- Generated on client, stored in cookie
  session_id VARCHAR(100) NOT NULL, -- Session identifier
  
  -- User Agent
  user_agent TEXT,
  browser VARCHAR(100),
  browser_version VARCHAR(50),
  os VARCHAR(100),
  os_version VARCHAR(50),
  device_type VARCHAR(20), -- 'desktop', 'mobile', 'tablet'
  
  -- Network Info
  ip_address VARCHAR(45), -- IPv4 or IPv6
  country_code VARCHAR(2), -- 'VN', 'US', etc.
  country_name VARCHAR(100),
  city VARCHAR(100),
  
  -- Screen Info
  screen_width INTEGER,
  screen_height INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,
  
  -- Traffic Source
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(200),
  utm_term VARCHAR(200),
  utm_content VARCHAR(200),
  traffic_source VARCHAR(50), -- 'direct', 'organic', 'referral', 'social', 'email'
  
  -- Timing
  time_on_page INTEGER, -- seconds
  is_bounce BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  CONSTRAINT chk_event_type CHECK (event_type IN ('pageview', 'event', 'session_start', 'session_end')),
  CONSTRAINT chk_device_type CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  CONSTRAINT chk_traffic_source CHECK (traffic_source IN ('direct', 'organic', 'referral', 'social', 'email', 'paid', 'other'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_id ON analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_path ON analytics_events(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_traffic_source ON analytics_events(traffic_source);
CREATE INDEX IF NOT EXISTS idx_analytics_events_country ON analytics_events(country_code);
CREATE INDEX IF NOT EXISTS idx_analytics_events_device ON analytics_events(device_type);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_date_type ON analytics_events(created_at DESC, event_type);

-- Daily Summary Table (for faster queries)
CREATE TABLE IF NOT EXISTS analytics_daily_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  
  -- Counts
  total_pageviews INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  
  -- Averages
  avg_session_duration INTEGER DEFAULT 0, -- seconds
  avg_pages_per_session DECIMAL(10,2) DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0, -- percentage
  
  -- Updated
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_daily_summary_date UNIQUE(date)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_analytics_daily_summary_date ON analytics_daily_summary(date DESC);

-- Comments
COMMENT ON TABLE analytics_events IS 'Stores all analytics events (pageviews, custom events)';
COMMENT ON TABLE analytics_daily_summary IS 'Daily aggregated analytics data for faster queries';

COMMENT ON COLUMN analytics_events.visitor_id IS 'Unique visitor identifier (stored in cookie)';
COMMENT ON COLUMN analytics_events.session_id IS 'Session identifier (30 min timeout)';
COMMENT ON COLUMN analytics_events.time_on_page IS 'Time spent on page in seconds';
COMMENT ON COLUMN analytics_events.is_bounce IS 'True if visitor left after viewing only one page';

-- Function to update daily summary
CREATE OR REPLACE FUNCTION update_analytics_daily_summary()
RETURNS void AS $$
BEGIN
  INSERT INTO analytics_daily_summary (date, total_pageviews, unique_visitors, total_sessions, updated_at)
  SELECT 
    DATE(created_at) as date,
    COUNT(*) FILTER (WHERE event_type = 'pageview') as total_pageviews,
    COUNT(DISTINCT visitor_id) as unique_visitors,
    COUNT(DISTINCT session_id) as total_sessions,
    CURRENT_TIMESTAMP as updated_at
  FROM analytics_events
  WHERE DATE(created_at) = CURRENT_DATE
  GROUP BY DATE(created_at)
  ON CONFLICT (date) DO UPDATE SET
    total_pageviews = EXCLUDED.total_pageviews,
    unique_visitors = EXCLUDED.unique_visitors,
    total_sessions = EXCLUDED.total_sessions,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_analytics_daily_summary IS 'Updates daily analytics summary for today';

