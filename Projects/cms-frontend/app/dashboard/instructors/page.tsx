'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, GraduationCap, Star } from 'lucide-react';
import { resolveApiBaseUrl } from '@/lib/api';

interface Instructor {
  id: string;
  user_id: string;
  title: string;
  credentials: string;
  bio?: string;
  rating: number;
  total_courses: number;
  is_featured: boolean;
  created_at: string;
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInstructors();
  }, []);

  const getApiUrl = () => {
    const base = resolveApiBaseUrl();
    return base.endsWith('/') ? base.slice(0, -1) : base;
  };

  const fetchInstructors = async () => {
    try {
      const baseUrl = getApiUrl();
      const path = baseUrl.endsWith('/api') ? '/instructors' : '/api/instructors';
      const res = await fetch(`${baseUrl}${path}`, {
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        setInstructors(Array.isArray(data) ? data : (data?.data ?? []));
      }
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstructors = instructors.filter((instructor) =>
    instructor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.credentials.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Quản lý Giảng viên
          </h1>
          <p className="text-muted-foreground">
            Quản lý thông tin giảng viên và gán khóa học
          </p>
        </div>
        <Link
          href="/dashboard/instructors/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Thêm giảng viên
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Tìm kiếm giảng viên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Instructors List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-lg border border-border bg-card"
            />
          ))}
        </div>
      ) : filteredInstructors.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            Chưa có giảng viên
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Bắt đầu bằng cách thêm giảng viên đầu tiên.
          </p>
          <Link
            href="/dashboard/instructors/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Thêm giảng viên
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInstructors.map((instructor) => (
            <div
              key={instructor.id}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-card-foreground">
                      {instructor.title}
                    </h3>
                    {instructor.is_featured && (
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Nổi bật
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {instructor.credentials}
                  </p>
                  <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{instructor.rating.toFixed(1)}</span>
                    </div>
                    <span>{instructor.total_courses} khóa học</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/instructors/${instructor.id}`}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                <button className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


















