'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye, Filter, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { Order } from '@/types';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/api';

export default function OrdersPage() {
  const { user, hydrate } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!user) {
      hydrate().then(() => {
        if (!useAuthStore.getState().user) return (window.location.href = '/login');
        fetchOrders();
        setIsInitialized(true);
      });
    } else {
      fetchOrders();
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce search query
  useEffect(() => {
    if (!isInitialized) return;
    
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchOrders();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Fetch when filters/pagination change
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get<any>(buildApiUrl('/api/orders'), {
        params: {
          page: currentPage,
          pageSize,
          status: statusFilter || undefined,
          search: searchQuery || undefined
        },
        withCredentials: true,
      });
      
      setOrders(response.data?.orders || []);
      setTotal(response.data?.pagination?.total || 0);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Không thể tải đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId: string, orderNumber: string) => {
    if (!confirm(
      `Bạn có chắc chắn muốn ẩn đơn hàng ${orderNumber}?\n\n` +
      `Đơn hàng sẽ được ẩn khỏi danh sách nhưng dữ liệu vẫn được lưu lại cho:\n` +
      `- Báo cáo và thống kê\n` +
      `- Kế toán và audit\n` +
      `- Tra cứu sau này\n\n` +
      `Bạn có thể khôi phục đơn hàng sau nếu cần.`
    )) {
      return;
    }

    try {
      await axios.delete(buildApiUrl(`/api/orders/${orderId}`), {
        withCredentials: true,
      });
      
      toast.success('Đã ẩn đơn hàng thành công');
      // Update state without full reload
      setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
      setTotal(prevTotal => prevTotal - 1);
    } catch (error) {
      console.error('Failed to archive order:', error);
      toast.error('Không thể ẩn đơn hàng');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    // Parse date string - if it doesn't have timezone, assume it's UTC from database
    let date: Date;
    if (dateString.includes('Z') || dateString.includes('+') || dateString.includes('-') && dateString.match(/[+-]\d{2}:\d{2}$/)) {
      // Has timezone info, parse directly
      date = new Date(dateString);
    } else {
      // No timezone info, assume UTC from PostgreSQL
      date = new Date(dateString + 'Z');
    }
    
    if (Number.isNaN(date.getTime())) return '—';
    
    // Format in Vietnam timezone (UTC+7)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      refunded: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Đơn hàng</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý đơn hàng khách hàng ({total} tổng số)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm theo số đơn hàng, tên khách hàng, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="processing">Đang xử lý</option>
          <option value="shipped">Đã gửi hàng</option>
          <option value="delivered">Đã giao hàng</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="px-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="10">10 mỗi trang</option>
          <option value="20">20 mỗi trang</option>
          <option value="50">50 mỗi trang</option>
        </select>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="Không tìm thấy đơn hàng"
          description="Đơn hàng sẽ xuất hiện ở đây khi khách hàng đặt hàng"
        />
      ) : (
        <div className="overflow-hidden border border-border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Đơn hàng</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Khách hàng</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Sản phẩm</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Tổng tiền</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Trạng thái</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Thanh toán</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Ngày</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{order.order_number}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-foreground">{order.customer_name}</div>
                      <div className="text-muted-foreground text-xs">{order.customer_email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground">
                      {order.items?.length || 0} sản phẩm
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(Math.round(order.total))}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} dark:bg-opacity-20 dark:text-opacity-90`}>
                      {order.status === 'pending' ? 'Chờ xử lý' : order.status === 'processing' ? 'Đang xử lý' : order.status === 'shipped' ? 'Đã gửi hàng' : order.status === 'delivered' ? 'Đã giao hàng' : 'Đã hủy'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)} dark:bg-opacity-20 dark:text-opacity-90`}>
                      {order.payment_status === 'pending' ? 'Chờ thanh toán' : order.payment_status === 'paid' ? 'Đã thanh toán' : order.payment_status === 'failed' ? 'Thanh toán thất bại' : 'Đã hoàn tiền'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Eye className="h-4 w-4" />
                        Xem
                      </Link>
                      <button
                        onClick={() => handleDelete(order.id, order.order_number)}
                        className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 dark:hover:text-red-400 hover:underline"
                        title="Ẩn đơn hàng"
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Hiển thị {(currentPage - 1) * pageSize + 1} đến {Math.min(currentPage * pageSize, total)} trong tổng số {total} đơn hàng
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              Trước
            </button>
            <span className="px-4 py-2 text-sm text-foreground">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-border bg-background text-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

