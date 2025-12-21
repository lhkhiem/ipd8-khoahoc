'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Receipt, Eye } from 'lucide-react';
import { resolveApiBaseUrl } from '@/lib/api';

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const getApiUrl = () => {
    const base = resolveApiBaseUrl();
    return base.endsWith('/') ? base.slice(0, -1) : base;
  };

  const fetchOrders = async () => {
    try {
      const baseUrl = getApiUrl();
      const path = baseUrl.endsWith('/api') ? '/orders' : '/api/orders';
      const res = await fetch(`${baseUrl}${path}`, {
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : (data?.data ?? []));
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      created: {
        label: 'Đã tạo',
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
      },
      paid: {
        label: 'Đã thanh toán',
        className: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      },
      failed: {
        label: 'Thất bại',
        className: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
      },
      refunded: {
        label: 'Đã hoàn tiền',
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      },
    };

    const statusInfo = statusMap[status] || statusMap.created;

    return (
      <span className={`rounded px-2 py-1 text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Quản lý Đơn hàng
        </h1>
        <p className="text-muted-foreground">
          Xem và quản lý đơn hàng, xử lý hoàn tiền
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn hàng..."
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
          <option value="created">Đã tạo</option>
          <option value="paid">Đã thanh toán</option>
          <option value="failed">Thất bại</option>
          <option value="refunded">Đã hoàn tiền</option>
        </select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg border border-border bg-card"
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            Chưa có đơn hàng
          </h3>
          <p className="text-sm text-muted-foreground">
            Các đơn hàng sẽ hiển thị ở đây.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Mã đơn hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-accent/40">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      User ID: {order.user_id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">
                      {order.amount.toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="inline-flex items-center gap-1 text-primary hover:text-primary/80">
                        <Eye className="h-4 w-4" />
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










