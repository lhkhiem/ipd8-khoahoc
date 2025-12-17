'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  CheckCircle,
  Edit,
  Folder,
  TrendingUp,
  Users,
  Eye,
  ArrowUpRight,
  Package,
  Plus,
  Trash2,
  Clock,
} from 'lucide-react';
import { resolveApiBaseUrl } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  action: string;
  entity_type: string;
  entity_name?: string;
  description?: string;
  user_name?: string;
  user_email?: string;
  created_at: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalTopics: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStats();
    fetchActivities();
  }, []);

  const getApiUrl = () => {
    const base = resolveApiBaseUrl();
    return base.endsWith('/') ? base.slice(0, -1) : base;
  };

  const fetchStats = async () => {
    try {
      const baseUrl = getApiUrl();
      // baseUrl already includes /api, so don't add it again
      const postsPath = baseUrl.endsWith('/api') ? '/posts' : '/api/posts';
      const postsRes = await fetch(`${baseUrl}${postsPath}`, {
        credentials: 'include',
      });
      const posts = await postsRes.json();
      const postsData = Array.isArray(posts) ? posts : (posts?.data ?? []);
      
      const topicsPath = baseUrl.endsWith('/api') ? '/topics' : '/api/topics';
      const topicsRes = await fetch(`${baseUrl}${topicsPath}`, {
        credentials: 'include',
      });
      const topics = await topicsRes.json();
      const topicsData = Array.isArray(topics) ? topics : (topics?.data ?? topics ?? []);

      setStats({
        totalPosts: postsData.length || 0,
        publishedPosts: postsData.filter((p: any) => p.status === 'published').length || 0,
        draftPosts: postsData.filter((p: any) => p.status === 'draft').length || 0,
        totalTopics: topicsData.length || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const baseUrl = getApiUrl();
      // baseUrl already includes /api, so don't add it again
      const activityPath = baseUrl.endsWith('/api') ? '/activity-logs?limit=10' : '/api/activity-logs?limit=10';
      const url = `${baseUrl}${activityPath}`;
      console.log('[Dashboard] Fetching activities from:', url);
      
      const res = await fetch(url, {
        credentials: 'include',
      });
      
      if (!res.ok) {
        console.error('[Dashboard] Activities API error:', res.status, res.statusText);
        throw new Error(`Failed to fetch activities: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('[Dashboard] Activities response:', data);
      
      if (data.success && data.data) {
        setActivities(data.data);
      } else {
        console.warn('[Dashboard] Unexpected activities response format:', data);
      }
    } catch (error) {
      console.error('[Dashboard] Failed to fetch activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const getActivityIcon = (action: string, entityType: string) => {
    if (action === 'create') return Plus;
    if (action === 'delete') return Trash2;
    if (entityType === 'product') return Package;
    if (entityType === 'post') return FileText;
    return Edit;
  };

  const getActivityColor = (action: string) => {
    if (action === 'create') return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (action === 'delete') return 'text-red-600 bg-red-100 dark:bg-red-900/20';
    if (action === 'update') return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
    return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const statCards = [
    {
      title: 'Tổng bài viết',
      value: stats.totalPosts,
      icon: FileText,
      trend: '+12%',
      trendUp: true,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Đã xuất bản',
      value: stats.publishedPosts,
      icon: CheckCircle,
      trend: '+8%',
      trendUp: true,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Bản nháp',
      value: stats.draftPosts,
      icon: Edit,
      trend: '-3%',
      trendUp: false,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      title: 'Chủ đề',
      value: stats.totalTopics,
      icon: Folder,
      trend: '+2',
      trendUp: true,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
  ];

  return (
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Bảng điều khiển
          </h1>
          <p className="text-muted-foreground">
            Chào mừng trở lại! Đây là tổng quan về nội dung của bạn.
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-lg border border-border bg-card"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
              <div
                key={stat.title}
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-card-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn('rounded-lg p-2', stat.bgColor)}>
                    <stat.icon className={cn('h-5 w-5', stat.color)} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <span
                    className={cn(
                      'font-medium',
                      stat.trendUp ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {stat.trend}
                  </span>
                  <span className="text-muted-foreground">so với tháng trước</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Thao tác nhanh
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/dashboard/posts"
              className={cn(
                'group relative overflow-hidden rounded-lg border border-border bg-card p-6',
                'transition-all hover:shadow-md hover:border-primary'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    Quản lý bài viết
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tạo và chỉnh sửa bài viết blog
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>

            <Link
              href="/dashboard/topics"
              className={cn(
                'group relative overflow-hidden rounded-lg border border-border bg-card p-6',
                'transition-all hover:shadow-md hover:border-primary'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20">
                  <Folder className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    Chủ đề
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tổ chức nội dung theo chủ đề
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>

            <Link
              href="/dashboard/media"
              className={cn(
                'group relative overflow-hidden rounded-lg border border-border bg-card p-6',
                'transition-all hover:shadow-md hover:border-primary'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/20">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    Thư viện Media
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tải lên và quản lý file media
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Hoạt động gần đây
          </h2>
          <div className="rounded-lg border border-border bg-card">
            {loadingActivities ? (
              <div className="p-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
              </div>
            ) : activities.length === 0 ? (
              <div className="p-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-card-foreground mb-2">
                  Chưa có hoạt động
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Hoạt động sẽ hiển thị ở đây khi bạn thực hiện thay đổi nội dung.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {activities.map((activity) => {
                  const Icon = getActivityIcon(activity.action, activity.entity_type);
                  const colorClass = getActivityColor(activity.action);
                  return (
                    <div key={activity.id} className="p-4 hover:bg-accent/40 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-lg p-2 ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">
                              {activity.user_name || 'Hệ thống'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {activity.action} {activity.entity_type}
                            </span>
                          </div>
                          {activity.entity_name && (
                            <p className="text-sm text-foreground font-medium mb-1">
                              {activity.entity_name}
                            </p>
                          )}
                          {activity.description && (
                            <p className="text-xs text-muted-foreground mb-1">
                              {activity.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(activity.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
