// Analytics Models
// Self-hosted analytics system

export interface AnalyticsEvent {
  id: string;
  event_type: 'pageview' | 'event' | 'session_start' | 'session_end';
  page_url: string;
  page_title?: string;
  page_path?: string;
  referrer?: string;
  visitor_id: string;
  session_id: string;
  user_agent?: string;
  browser?: string;
  browser_version?: string;
  os?: string;
  os_version?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  ip_address?: string;
  country_code?: string;
  country_name?: string;
  city?: string;
  screen_width?: number;
  screen_height?: number;
  viewport_width?: number;
  viewport_height?: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  traffic_source?: 'direct' | 'organic' | 'referral' | 'social' | 'email' | 'paid' | 'other';
  time_on_page?: number;
  is_bounce: boolean;
  created_at: Date;
}

export interface TrackPageviewDTO {
  page_url: string;
  page_title?: string;
  page_path?: string;
  referrer?: string;
  visitor_id: string;
  session_id: string;
  user_agent?: string;
  screen_width?: number;
  screen_height?: number;
  viewport_width?: number;
  viewport_height?: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  time_on_page?: number;
}

export interface AnalyticsDailySummary {
  id: string;
  date: Date;
  total_pageviews: number;
  unique_visitors: number;
  total_sessions: number;
  avg_session_duration: number;
  avg_pages_per_session: number;
  bounce_rate: number;
  updated_at: Date;
}

export interface AnalyticsStats {
  overview: {
    total_pageviews: number;
    unique_visitors: number;
    total_sessions: number;
    avg_session_duration: number;
    avg_pages_per_session: number;
    bounce_rate: number;
    active_users: number; // Last 5 minutes
  };
  trend: {
    pageviews_change: number; // percentage
    visitors_change: number;
    sessions_change: number;
  };
  top_pages: Array<{
    page_path: string;
    page_title: string;
    pageviews: number;
    unique_visitors: number;
  }>;
  traffic_sources: Array<{
    source: string;
    visitors: number;
    percentage: number;
  }>;
  devices: Array<{
    device_type: string;
    count: number;
    percentage: number;
  }>;
  browsers: Array<{
    browser: string;
    count: number;
    percentage: number;
  }>;
  countries: Array<{
    country_code: string;
    country_name: string;
    visitors: number;
  }>;
  hourly_pageviews: Array<{
    hour: number;
    pageviews: number;
  }>;
  realtime: {
    active_users: number;
    active_pages: Array<{
      page_path: string;
      users: number;
    }>;
  };
}

