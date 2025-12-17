'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Search, Trash2, Download, Mail, Users, TrendingUp, X } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/api';

interface Subscriber {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribed_at: string;
  unsubscribed_at: string | null;
  source: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

interface Statistics {
  active_count: number;
  unsubscribed_count: number;
  bounced_count: number;
  total_count: number;
  new_last_30_days: number;
  new_last_7_days: number;
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(20);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        pageSize,
      };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await axios.get(buildApiUrl('/api/newsletter/subscribers'), {
        params,
        withCredentials: true,
      });

      console.log('[Newsletter] API Response:', response.data);

      if (response.data.success) {
        setSubscribers(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        console.error('[Newsletter] API returned success=false:', response.data);
        setSubscribers([]);
        setTotalPages(1);
        toast.error(response.data.error || 'Không thể tải danh sách đăng ký');
      }
    } catch (error: any) {
      console.error('[Newsletter] Failed to fetch subscribers:', error);
      console.error('[Newsletter] Error response:', error.response?.data);
      console.error('[Newsletter] Error status:', error.response?.status);
      setSubscribers([]);
      setTotalPages(1);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể tải danh sách đăng ký';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(buildApiUrl('/api/newsletter/statistics'), {
        withCredentials: true,
      });

      console.log('[Newsletter] Statistics Response:', response.data);

      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error: any) {
      console.error('[Newsletter] Failed to fetch statistics:', error);
      console.error('[Newsletter] Statistics error response:', error.response?.data);
    }
  };

  useEffect(() => {
    fetchSubscribers();
    fetchStatistics();
  }, [page, statusFilter]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchSubscribers();
      } else {
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đăng ký của "${email}"?`)) {
      return;
    }

    try {
      setDeleting(id);
      await axios.delete(buildApiUrl(`/api/newsletter/subscribers/${id}`), {
        withCredentials: true,
      });
      toast.success('Đã xóa đăng ký thành công');
      fetchSubscribers();
      fetchStatistics();
    } catch (error: any) {
      console.error('Failed to delete subscriber:', error);
      toast.error(error.response?.data?.error || 'Không thể xóa đăng ký');
    } finally {
      setDeleting(null);
    }
  };

  const handleExport = () => {
    // Export to CSV
    const headers = ['Email', 'Status', 'Subscribed At', 'Source', 'IP Address'];
    const rows = subscribers.map((s) => [
      s.email,
      s.status,
      new Date(s.subscribed_at).toLocaleString('vi-VN'),
      s.source || '',
      s.ip_address || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/20 text-green-600',
      unsubscribed: 'bg-gray-500/20 text-gray-600',
      bounced: 'bg-red-500/20 text-red-600',
    };
    const labels = {
      active: 'Đang đăng ký',
      unsubscribed: 'Đã hủy',
      bounced: 'Lỗi email',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles] || ''}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Newsletter</h1>
          <p className="text-sm text-muted-foreground">Quản lý danh sách đăng ký nhận bản tin</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          {subscribers.length > 0 && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng đăng ký</p>
                <p className="text-2xl font-bold text-foreground">{statistics.total_count}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đang đăng ký</p>
                <p className="text-2xl font-bold text-green-600">{statistics.active_count}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mới (7 ngày)</p>
                <p className="text-2xl font-bold text-foreground">{statistics.new_last_7_days}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mới (30 ngày)</p>
                <p className="text-2xl font-bold text-foreground">{statistics.new_last_30_days}</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang đăng ký</option>
            <option value="unsubscribed">Đã hủy</option>
            <option value="bounced">Lỗi email</option>
          </select>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="rounded-lg border border-border bg-card">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Đang tải...</div>
        ) : subscribers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {search || statusFilter !== 'all' ? 'Không tìm thấy đăng ký nào' : 'Chưa có đăng ký nào'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Ngày đăng ký</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Nguồn</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">IP Address</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="border-b border-border hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm text-foreground">{subscriber.email}</td>
                      <td className="px-4 py-3">{getStatusBadge(subscriber.status)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(subscriber.subscribed_at).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {subscriber.source || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                        {subscriber.ip_address || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(subscriber.id, subscriber.email)}
                          disabled={deleting === subscriber.id}
                          className="p-2 text-destructive hover:bg-destructive/20 rounded transition-colors disabled:opacity-50"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Trang {page} / {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded border border-input bg-background text-foreground text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 rounded border border-input bg-background text-foreground text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}








