'use client';

import { useState, useEffect } from 'react';
import { Plus, Bell, Search, Filter, Send } from 'lucide-react';
import { resolveApiBaseUrl } from '@/lib/api';

interface Notification {
  id: string;
  user_id?: string;
  title: string;
  content: string;
  type: string;
  status: string;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getApiUrl = () => {
    const base = resolveApiBaseUrl();
    return base.endsWith('/') ? base.slice(0, -1) : base;
  };

  const fetchNotifications = async () => {
    try {
      const baseUrl = getApiUrl();
      const path = baseUrl.endsWith('/api') ? '/notifications' : '/api/notifications';
      const res = await fetch(`${baseUrl}${path}`, {
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : (data?.data ?? []));
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter((notification) =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Quản lý Thông báo
          </h1>
          <p className="text-muted-foreground">
            Tạo và quản lý thông báo cho người dùng
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Tạo thông báo
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Tìm kiếm thông báo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border border-border bg-card"
            />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            Chưa có thông báo
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Bắt đầu bằng cách tạo thông báo đầu tiên.
          </p>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Tạo thông báo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-card-foreground mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.content}
                    </p>
                  </div>
                  <span className="ml-4 rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                    {notification.type}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    {new Date(notification.created_at).toLocaleDateString('vi-VN')}
                  </span>
                  {notification.user_id && (
                    <span>Gửi cho: User ID {notification.user_id.substring(0, 8)}...</span>
                  )}
                  {!notification.user_id && (
                    <span className="inline-flex items-center gap-1">
                      <Send className="h-3 w-3" />
                      Gửi cho tất cả
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}










