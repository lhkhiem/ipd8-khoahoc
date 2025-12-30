'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, UserCheck, Clock, CheckCircle, XCircle } from 'lucide-react';
import { resolveApiBaseUrl } from '@/lib/api';

interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  enrolled_at: string;
  expires_at?: string;
  progress?: number;
}

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const getApiUrl = () => {
    const base = resolveApiBaseUrl();
    return base.endsWith('/') ? base.slice(0, -1) : base;
  };

  const fetchEnrollments = async () => {
    try {
      const baseUrl = getApiUrl();
      const path = baseUrl.endsWith('/api') ? '/enrollments' : '/api/enrollments';
      const res = await fetch(`${baseUrl}${path}`, {
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        setEnrollments(Array.isArray(data) ? data : (data?.data ?? []));
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch = true; // TODO: Add search by user name or course name
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: any }> = {
      active: {
        label: 'Đang học',
        className: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        icon: CheckCircle,
      },
      pending: {
        label: 'Chờ xử lý',
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
        icon: Clock,
      },
      cancelled: {
        label: 'Đã hủy',
        className: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
        icon: XCircle,
      },
      completed: {
        label: 'Hoàn thành',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        icon: CheckCircle,
      },
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    const Icon = statusInfo.icon;

    return (
      <span className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${statusInfo.className}`}>
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Quản lý Đăng ký
        </h1>
        <p className="text-muted-foreground">
          Quản lý đăng ký khóa học và tiến độ học tập
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm đăng ký..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="active">Đang học</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Enrollments Table */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg border border-border bg-card"
            />
          ))}
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <UserCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            Chưa có đăng ký
          </h3>
          <p className="text-sm text-muted-foreground">
            Các đăng ký khóa học sẽ hiển thị ở đây.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Học viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Khóa học
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Tiến độ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Ngày đăng ký
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-accent/40">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      User ID: {enrollment.user_id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      Course ID: {enrollment.course_id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(enrollment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {enrollment.progress ?? 0}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(enrollment.enrolled_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary hover:text-primary/80">
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}






















