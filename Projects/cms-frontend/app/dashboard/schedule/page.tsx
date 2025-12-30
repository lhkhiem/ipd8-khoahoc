'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Search, Filter } from 'lucide-react';
import { resolveApiBaseUrl } from '@/lib/api';

interface Session {
  id: string;
  course_id: string;
  instructor_id?: string;
  start_time: string;
  end_time: string;
  capacity: number;
  registered_count: number;
  status: string;
}

export default function SchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  useEffect(() => {
    fetchSessions();
  }, []);

  const getApiUrl = () => {
    const base = resolveApiBaseUrl();
    return base.endsWith('/') ? base.slice(0, -1) : base;
  };

  const fetchSessions = async () => {
    try {
      const baseUrl = getApiUrl();
      const path = baseUrl.endsWith('/api') ? '/sessions' : '/api/sessions';
      const res = await fetch(`${baseUrl}${path}`, {
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        setSessions(Array.isArray(data) ? data : (data?.data ?? []));
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      scheduled: {
        label: 'Đã lên lịch',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      },
      full: {
        label: 'Đã đầy',
        className: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
      },
      cancelled: {
        label: 'Đã hủy',
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400',
      },
      done: {
        label: 'Đã hoàn thành',
        className: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      },
    };

    const statusInfo = statusMap[status] || statusMap.scheduled;

    return (
      <span className={`rounded px-2 py-1 text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Quản lý Lịch học
          </h1>
          <p className="text-muted-foreground">
            Xem và quản lý lịch học, tạo lịch học mới
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('month')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              viewMode === 'month'
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-background hover:bg-accent'
            }`}
          >
            Tháng
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              viewMode === 'week'
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-background hover:bg-accent'
            }`}
          >
            Tuần
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              viewMode === 'day'
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-background hover:bg-accent'
            }`}
          >
            Ngày
          </button>
        </div>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg border border-border bg-card"
            />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            Chưa có lịch học
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Bắt đầu bằng cách tạo lịch học đầu tiên.
          </p>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Tạo lịch học mới
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-card-foreground">
                      {new Date(session.start_time).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    {getStatusBadge(session.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {new Date(session.start_time).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        -{' '}
                        {new Date(session.end_time).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {session.registered_count}/{session.capacity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}






















