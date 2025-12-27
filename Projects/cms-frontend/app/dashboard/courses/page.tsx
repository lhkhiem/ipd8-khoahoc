'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Edit, Trash2, Eye, BookOpen } from 'lucide-react';
import { resolveApiBaseUrl } from '@/lib/api';

interface Course {
  id: string;
  title: string;
  slug: string;
  target_audience: string;
  price: number;
  price_type: string;
  status: string;
  featured: boolean;
  thumbnail_url?: string;
  instructor_id?: string;
  created_at: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const getApiUrl = () => {
    const base = resolveApiBaseUrl();
    return base.endsWith('/') ? base.slice(0, -1) : base;
  };

  const fetchCourses = async () => {
    try {
      const baseUrl = getApiUrl();
      const path = baseUrl.endsWith('/api') ? '/courses' : '/api/courses';
      const res = await fetch(`${baseUrl}${path}`, {
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : (data?.data ?? []));
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Quản lý Khóa học
          </h1>
          <p className="text-muted-foreground">
            Quản lý danh sách khóa học, modules và sessions
          </p>
        </div>
        <Link
          href="/dashboard/courses/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Tạo khóa học mới
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
          <Filter className="h-4 w-4" />
          Lọc
        </button>
      </div>

      {/* Courses List */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-lg border border-border bg-card"
            />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            Chưa có khóa học
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Bắt đầu bằng cách tạo khóa học đầu tiên của bạn.
          </p>
          <Link
            href="/dashboard/courses/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Tạo khóa học mới
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-md"
            >
              {course.thumbnail_url && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-semibold text-card-foreground line-clamp-2">
                    {course.title}
                  </h3>
                  {course.featured && (
                    <span className="ml-2 rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Nổi bật
                    </span>
                  )}
                </div>
                <p className="mb-2 text-sm text-muted-foreground">
                  {course.target_audience}
                </p>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-card-foreground">
                    {course.price.toLocaleString('vi-VN')} VNĐ
                  </span>
                  <span
                    className={`rounded px-2 py-1 text-xs font-medium ${
                      course.status === 'published'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}
                  >
                    {course.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/courses/${course.id}`}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-center text-sm font-medium hover:bg-accent"
                  >
                    <Edit className="mr-2 inline h-4 w-4" />
                    Chỉnh sửa
                  </Link>
                  <button className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

















