'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, Pencil, Trash2, Grid, List, Eye, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl, buildBackendUrl } from '@/lib/api';

interface Asset {
  id: string;
  url: string;
  cdn_url?: string;
  format?: string;
  width?: number;
  height?: number;
  sizes?: any;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: string;
  created_at: string;
  author_id: string;
  published_at?: string;
  cover_asset_id?: string;
  cover_asset?: Asset;
}

type SortField = 'title' | 'status' | 'created_at' | 'published_at';
type SortOrder = 'asc' | 'desc';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [pageSize, setPageSize] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/users'), { credentials: 'include' });
      const data = await response.json();
      const map: Record<string, string> = {};
      for (const u of (data?.data || [])) {
        map[u.id] = u.name || u.email;
      }
      setAuthors(map);
    } catch (error) {
      console.error('Failed to fetch authors:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Fetch all posts regardless of status
      const response = await fetch(buildApiUrl('/api/posts?status='), {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      const items = Array.isArray(data) ? data : (data?.data ?? []);
      setPosts(items);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      toast.error('Không thể tải bài viết');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa "${title}"?`)) return;

    try {
      const response = await fetch(buildApiUrl(`/api/posts/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      
      toast.success('Xóa bài viết thành công');
      // Update state without full reload
      setPosts(prevPosts => prevPosts.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Không thể xóa bài viết');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(buildApiUrl(`/api/posts/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      toast.success(`Cập nhật trạng thái thành ${newStatus === 'published' ? 'Đã xuất bản' : newStatus === 'draft' ? 'Bản nháp' : 'Đã lưu trữ'}`);
      // Update state without full reload
      setPosts(prevPosts => 
        prevPosts.map(p => p.id === id ? { ...p, status: newStatus } : p)
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts.filter(post => {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.slug.toLowerCase().includes(query) ||
        post.status.toLowerCase().includes(query) ||
        (authors[post.author_id] || '').toLowerCase().includes(query)
      );
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'title') {
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
      } else if (sortField === 'created_at' || sortField === 'published_at') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [posts, searchQuery, sortField, sortOrder, authors]);

  // Paginate
  const paginatedPosts = useMemo(() => {
    if (pageSize === 0) return filteredAndSortedPosts; // Show all
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedPosts.slice(start, start + pageSize);
  }, [filteredAndSortedPosts, currentPage, pageSize]);

  const totalPages = pageSize === 0 ? 1 : Math.ceil(filteredAndSortedPosts.length / pageSize);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />;
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bài viết</h1>
            <p className="text-sm text-muted-foreground">
              Tổng cộng {filteredAndSortedPosts.length} {filteredAndSortedPosts.length === 1 ? 'bài viết' : 'bài viết'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/posts/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4" />
              Bài viết mới
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, slug, tác giả hoặc trạng thái..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground whitespace-nowrap">Hiển thị:</label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={0}>Tất cả</option>
            </select>
            <div className="flex items-center gap-1 border border-input rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-l-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
                title="Xem dạng danh sách"
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-r-lg transition-colors ${
                  viewMode === 'card' 
                    ? 'bg-accent text-accent-foreground' 
                    : 'text-muted-foreground hover:bg-muted'
                }`}
                title="Xem dạng thẻ"
              >
                <Grid className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Đang tải bài viết...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-card-foreground mb-2">Chưa có bài viết nào</h3>
            <p className="text-sm text-muted-foreground">Bắt đầu bằng cách tạo bài viết mới.</p>
            <div className="mt-6">
              <Link href="/dashboard/posts/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Bài viết mới
              </Link>
            </div>
          </div>
        ) : filteredAndSortedPosts.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">Không tìm thấy bài viết nào phù hợp với tiêu chí tìm kiếm.</p>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th 
                        onClick={() => handleSort('title')}
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex items-center">
                          Tiêu đề
                          <SortIcon field="title" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Tác giả
                      </th>
                      <th 
                        onClick={() => handleSort('status')}
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex items-center">
                          Trạng thái
                          <SortIcon field="status" />
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('created_at')}
                        className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex items-center">
                          Ngày
                          <SortIcon field="created_at" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {paginatedPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-accent/40 transition">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-foreground max-w-xs truncate">
                            {post.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground max-w-xs truncate">
                            {post.slug}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">
                            {authors[post.author_id] || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={post.status}
                            onChange={(e) => handleStatusChange(post.id, e.target.value)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer ${
                              post.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : post.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <option value="draft">Bản nháp</option>
                            <option value="published">Đã xuất bản</option>
                            <option value="archived">Đã lưu trữ</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/dashboard/posts/${post.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span>Chỉnh sửa</span>
                            </Link>
                            <button
                              onClick={() => handleDelete(post.id, post.title)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedPosts.map((post) => {
                  const imageUrl = post.cover_asset?.cdn_url || post.cover_asset?.url;
                  const fullImageUrl = imageUrl?.startsWith('http') 
                    ? imageUrl 
                    : imageUrl ? buildBackendUrl(imageUrl) : null;
                  
                  return (
                    <div 
                      key={post.id} 
                      className="group rounded-lg border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
                    >
                      {/* Featured Image */}
                      {fullImageUrl ? (
                        <div className="aspect-video w-full overflow-hidden bg-muted">
                          <img
                            src={fullImageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video w-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                          <svg className="h-12 w-12 text-muted-foreground/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      {/* Card Content */}
                      <div className="flex-1 flex flex-col p-4">
                        {/* Title */}
                        <h3 className="font-semibold text-foreground line-clamp-2 mb-2 min-h-[3rem]">
                          {post.title}
                        </h3>

                        {/* Excerpt */}
                        {post.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                            {post.excerpt}
                          </p>
                        )}

                        {/* Meta Information */}
                        <div className="space-y-2 mt-auto pt-3 border-t border-border">
                          {/* Status */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Trạng thái</span>
                            <select
                              value={post.status}
                              onChange={(e) => handleStatusChange(post.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className={`px-2 py-1 text-xs font-semibold rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer ${
                                post.status === 'published'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : post.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                              }`}
                            >
                              <option value="draft">Bản nháp</option>
                              <option value="published">Đã xuất bản</option>
                              <option value="archived">Đã lưu trữ</option>
                            </select>
                          </div>

                          {/* Author */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Tác giả</span>
                            <span className="text-sm text-foreground truncate max-w-[60%]">
                              {authors[post.author_id] || '-'}
                            </span>
                          </div>

                          {/* Date */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Ngày
                            </span>
                            <span className="text-xs text-foreground">
                              {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer - Actions */}
                      <div className="p-4 pt-0 flex items-center gap-2">
                        <Link 
                          href={`/dashboard/posts/${post.id}`}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span>Chỉnh sửa</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-md bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors text-sm"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pageSize > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-card border border-border rounded-lg">
                <div className="text-sm text-muted-foreground">
                  Hiển thị {((currentPage - 1) * pageSize) + 1} đến {Math.min(currentPage * pageSize, filteredAndSortedPosts.length)} trong tổng số {filteredAndSortedPosts.length} bài viết
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Show first, last, current, and pages around current
                        return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                      })
                      .map((page, idx, arr) => (
                        <span key={page}>
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1.5 rounded-md transition-colors ${
                              currentPage === page
                                ? 'bg-primary text-primary-foreground'
                                : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                            }`}
                          >
                            {page}
                          </button>
                        </span>
                      ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
  );
}
