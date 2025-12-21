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
  BookOpen,
  GraduationCap,
  UserCheck,
  Receipt,
  CreditCard,
  Calendar,
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
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalEnrollments: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalPosts: 0,
    publishedPosts: 0,
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

  // Helper function to safely parse JSON response
  const safeJsonParse = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Response is not JSON, might be HTML (redirect/error page)
      const text = await response.text();
      console.warn('[Dashboard] Received non-JSON response:', {
        status: response.status,
        statusText: response.statusText,
        contentType,
        preview: text.substring(0, 100),
      });
      return null;
    }
    
    if (!response.ok) {
      // Response is JSON but status is not OK
      try {
        const error = await response.json();
        console.warn('[Dashboard] API error:', error);
        return null;
      } catch {
        return null;
      }
    }
    
    try {
      return await response.json();
    } catch (error) {
      console.error('[Dashboard] Failed to parse JSON:', error);
      return null;
    }
  };

  const fetchStats = async () => {
    try {
      const baseUrl = getApiUrl();
      
      // Fetch courses
      const coursesPath = baseUrl.endsWith('/api') ? '/courses' : '/api/courses';
      const coursesRes = await fetch(`${baseUrl}${coursesPath}`, {
        credentials: 'include',
      });
      const courses = await safeJsonParse(coursesRes);
      const coursesData = courses ? (Array.isArray(courses) ? courses : (courses?.data ?? [])) : [];
      
      // Fetch users (students)
      const usersPath = baseUrl.endsWith('/api') ? '/users' : '/api/users';
      const usersRes = await fetch(`${baseUrl}${usersPath}`, {
        credentials: 'include',
      });
      const users = await safeJsonParse(usersRes);
      const usersData = users ? (Array.isArray(users) ? users : (users?.data ?? [])) : [];
      
      // Fetch instructors
      const instructorsPath = baseUrl.endsWith('/api') ? '/instructors' : '/api/instructors';
      const instructorsRes = await fetch(`${baseUrl}${instructorsPath}`, {
        credentials: 'include',
      });
      const instructors = await safeJsonParse(instructorsRes);
      const instructorsData = instructors ? (Array.isArray(instructors) ? instructors : (instructors?.data ?? [])) : [];
      
      // Fetch enrollments
      const enrollmentsPath = baseUrl.endsWith('/api') ? '/enrollments' : '/api/enrollments';
      const enrollmentsRes = await fetch(`${baseUrl}${enrollmentsPath}`, {
        credentials: 'include',
      });
      const enrollments = await safeJsonParse(enrollmentsRes);
      const enrollmentsData = enrollments ? (Array.isArray(enrollments) ? enrollments : (enrollments?.data ?? [])) : [];
      
      // Fetch orders
      const ordersPath = baseUrl.endsWith('/api') ? '/orders' : '/api/orders';
      const ordersRes = await fetch(`${baseUrl}${ordersPath}`, {
        credentials: 'include',
      });
      const orders = await safeJsonParse(ordersRes);
      const ordersData = orders ? (Array.isArray(orders) ? orders : (orders?.data ?? [])) : [];
      
      // Fetch posts
      const postsPath = baseUrl.endsWith('/api') ? '/posts' : '/api/posts';
      const postsRes = await fetch(`${baseUrl}${postsPath}`, {
        credentials: 'include',
      });
      const posts = await safeJsonParse(postsRes);
      const postsData = posts ? (Array.isArray(posts) ? posts : (posts?.data ?? [])) : [];

      // Calculate revenue from paid orders
      const totalRevenue = ordersData
        .filter((o: any) => o.status === 'paid')
        .reduce((sum: number, o: any) => sum + (o.amount || 0), 0);

      setStats({
        totalCourses: coursesData.length || 0,
        publishedCourses: coursesData.filter((c: any) => c.status === 'published').length || 0,
        totalStudents: usersData.filter((u: any) => u.role === 'student').length || 0,
        totalInstructors: instructorsData.length || 0,
        totalEnrollments: enrollmentsData.length || 0,
        totalOrders: ordersData.length || 0,
        totalRevenue: totalRevenue || 0,
        totalPosts: postsData.length || 0,
        publishedPosts: postsData.filter((p: any) => p.status === 'published').length || 0,
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
      
      const res = await fetch(url, {
        credentials: 'include',
      });
      
      // If 404, endpoint doesn't exist yet - silently skip
      if (res.status === 404) {
        console.log('[Dashboard] Activity logs endpoint not available (404) - skipping');
        setActivities([]);
        return;
      }
      
      const data = await safeJsonParse(res);
      
      if (data && data.success && data.data) {
        setActivities(data.data);
      } else {
        // Endpoint exists but returned unexpected format - set empty array
        setActivities([]);
      }
    } catch (error) {
      console.error('[Dashboard] Failed to fetch activities:', error);
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const getActivityIcon = (action: string, entityType: string) => {
    if (action === 'create') return Plus;
    if (action === 'delete') return Trash2;
    if (entityType === 'course') return BookOpen;
    if (entityType === 'post') return FileText;
    if (entityType === 'enrollment') return UserCheck;
    if (entityType === 'order') return Receipt;
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
      title: 'Tổng khóa học',
      value: stats.totalCourses,
      icon: BookOpen,
      trend: '+5',
      trendUp: true,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Khóa học đã xuất bản',
      value: stats.publishedCourses,
      icon: CheckCircle,
      trend: '+3',
      trendUp: true,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: 'Học viên',
      value: stats.totalStudents,
      icon: Users,
      trend: '+12',
      trendUp: true,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Giảng viên',
      value: stats.totalInstructors,
      icon: GraduationCap,
      trend: '+2',
      trendUp: true,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      title: 'Đăng ký',
      value: stats.totalEnrollments,
      icon: UserCheck,
      trend: '+8',
      trendUp: true,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    },
    {
      title: 'Đơn hàng',
      value: stats.totalOrders,
      icon: Receipt,
      trend: '+15',
      trendUp: true,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100 dark:bg-teal-900/20',
    },
    {
      title: 'Doanh thu',
      value: `${(stats.totalRevenue / 1000000).toFixed(1)}M`,
      icon: CreditCard,
      trend: '+18%',
      trendUp: true,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
    },
    {
      title: 'Bài viết',
      value: stats.totalPosts,
      icon: FileText,
      trend: '+4',
      trendUp: true,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/20',
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
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/dashboard/courses"
              className={cn(
                'group relative overflow-hidden rounded-lg border border-border bg-card p-6',
                'transition-all hover:shadow-md hover:border-primary'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    Quản lý Khóa học
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Tạo và chỉnh sửa khóa học
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>

            <Link
              href="/dashboard/instructors"
              className={cn(
                'group relative overflow-hidden rounded-lg border border-border bg-card p-6',
                'transition-all hover:shadow-md hover:border-primary'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/20">
                  <GraduationCap className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    Quản lý Giảng viên
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Thêm và quản lý giảng viên
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>

            <Link
              href="/dashboard/enrollments"
              className={cn(
                'group relative overflow-hidden rounded-lg border border-border bg-card p-6',
                'transition-all hover:shadow-md hover:border-primary'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/20">
                  <UserCheck className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    Đăng ký Khóa học
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Xem và quản lý đăng ký
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </Link>

            <Link
              href="/dashboard/schedule"
              className={cn(
                'group relative overflow-hidden rounded-lg border border-border bg-card p-6',
                'transition-all hover:shadow-md hover:border-primary'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-teal-100 p-3 dark:bg-teal-900/20">
                  <Calendar className="h-6 w-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    Lịch học
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Quản lý lịch học và sessions
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
