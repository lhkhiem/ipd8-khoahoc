'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Eye, 
  MousePointer,
  Clock,
  Globe,
  Monitor,
  Smartphone,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/api';

interface AnalyticsStats {
  overview: {
    total_pageviews: number;
    unique_visitors: number;
    total_sessions: number;
    avg_session_duration: number;
    avg_pages_per_session: number;
    bounce_rate: number;
    active_users: number;
  };
  trend: {
    pageviews_change: number;
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
  }>;
  realtime: {
    active_users: number;
    active_pages: Array<{
      page_path: string;
      users: number;
    }>;
  };
}

export default function AnalyticsPage() {
  const { user, hydrate } = useAuthStore();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!user) {
      hydrate().then(() => {
        if (!useAuthStore.getState().user) return (window.location.href = '/login');
        fetchStats();
      });
    } else {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  // Auto-refresh realtime stats every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, period]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ success: boolean; data: AnalyticsStats }>(
        buildApiUrl(`/api/analytics/stats?period=${period}`),
        { withCredentials: true }
      );
      
      if (response.data?.success && response.data.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Không thể tải dữ liệu phân tích');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Đang tải phân tích...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bảng phân tích</h1>
          <p className="text-sm text-muted-foreground">
            Thống kê lưu lượng truy cập và thông tin khách truy cập theo thời gian thực
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-input bg-background text-foreground rounded-lg text-sm"
          >
            <option value="1d">Hôm nay</option>
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
          </select>
          
          {/* Auto-refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 border rounded-lg text-sm transition-colors ${
              autoRefresh 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-background border-border hover:bg-accent text-foreground'
            }`}
          >
            <Activity className="h-4 w-4 inline mr-1" />
            {autoRefresh ? 'Tự làm mới BẬT' : 'Tự làm mới TẮT'}
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Pageviews */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lượt xem trang</p>
              <p className="text-2xl font-bold text-card-foreground">
                {stats?.overview.total_pageviews.toLocaleString() || 0}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {getTrendIcon(stats?.trend.pageviews_change || 0)}
            <p className={`text-xs font-medium ${getTrendColor(stats?.trend.pageviews_change || 0)}`}>
              {stats?.trend.pageviews_change > 0 ? '+' : ''}
              {stats?.trend.pageviews_change.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground ml-1">so với kỳ trước</p>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Khách truy cập</p>
              <p className="text-2xl font-bold text-card-foreground">
                {stats?.overview.unique_visitors.toLocaleString() || 0}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {getTrendIcon(stats?.trend.visitors_change || 0)}
            <p className={`text-xs font-medium ${getTrendColor(stats?.trend.visitors_change || 0)}`}>
              {stats?.trend.visitors_change > 0 ? '+' : ''}
              {stats?.trend.visitors_change.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground ml-1">so với kỳ trước</p>
          </div>
        </div>

        {/* Avg Session Duration */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phiên trung bình</p>
              <p className="text-2xl font-bold text-card-foreground">
                {formatDuration(stats?.overview.avg_session_duration || 0)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats?.overview.avg_pages_per_session.toFixed(1) || 0} trang/phiên
          </p>
        </div>

        {/* Active Users (Realtime) */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Đang hoạt động</p>
              <p className="text-2xl font-bold text-card-foreground">
                {stats?.overview.active_users || 0}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center relative">
              <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              {(stats?.overview.active_users || 0) > 0 && (
                <span className="absolute top-0 right-0 h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            người dùng trong 5 phút qua
          </p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Tổng phiên</p>
          <p className="text-xl font-bold">{stats?.overview.total_sessions.toLocaleString() || 0}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Tỷ lệ thoát</p>
          <p className="text-xl font-bold">{stats?.overview.bounce_rate.toFixed(1)}%</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Trang/Phiên</p>
          <p className="text-xl font-bold">{stats?.overview.avg_pages_per_session.toFixed(2)}</p>
        </div>
      </div>

      {/* Top Pages */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Trang phổ biến</h2>
        {stats && stats.top_pages.length > 0 ? (
          <div className="space-y-2">
            {stats.top_pages.map((page, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-sm">{page.page_title || page.page_path}</p>
                  <p className="text-xs text-muted-foreground">{page.page_path}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{page.pageviews.toLocaleString()} lượt xem</p>
                  <p className="text-xs text-muted-foreground">{page.unique_visitors} khách truy cập</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
        )}
      </div>

      {/* Traffic Sources & Devices */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Traffic Sources */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Nguồn lưu lượng
          </h2>
          {stats && stats.traffic_sources.length > 0 ? (
            <div className="space-y-3">
              {stats.traffic_sources.map((source, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize">{source.source}</span>
                    <span className="text-sm text-muted-foreground">
                      {source.visitors} ({source.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
          )}
        </div>

        {/* Devices */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Thiết bị
          </h2>
          {stats && stats.devices.length > 0 ? (
            <div className="space-y-3">
              {stats.devices.map((device, idx) => {
                const Icon = device.device_type === 'mobile' ? Smartphone : Monitor;
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium capitalize">{device.device_type}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {device.count} ({device.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${device.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
          )}
        </div>
      </div>

      {/* Realtime Active Pages */}
      {stats && stats.realtime.active_users > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Người dùng đang hoạt động
            <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
              {stats.realtime.active_users} TRỰC TIẾP
            </span>
          </h2>
          {stats.realtime.active_pages.length > 0 ? (
            <div className="space-y-2">
              {stats.realtime.active_pages.map((page, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <p className="text-sm font-medium">{page.page_path}</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">{page.users} đang hoạt động</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Không có người dùng đang hoạt động</p>
          )}
        </div>
      )}

      {/* Browsers */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">Trình duyệt phổ biến</h2>
        {stats && stats.browsers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.browsers.slice(0, 4).map((browser, idx) => (
              <div key={idx} className="text-center p-3 rounded-lg bg-muted">
                <p className="text-sm font-medium">{browser.browser}</p>
                <p className="text-xl font-bold mt-1">{browser.count}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Không có dữ liệu</p>
        )}
      </div>
    </div>
  );
}
