'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, ArrowLeft, Search, Pencil, Trash2, Eye, EyeOff, Tag as TagIcon } from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/api';

interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  is_active: boolean;
  post_count: number;
  created_at: string;
  updated_at: string;
}

type SortBy = 'name' | 'popular';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6',
    is_active: true
  });

  const router = useRouter();

  useEffect(() => {
    fetchTags();
  }, [sortBy]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`/api/tags?sort=${sortBy}`), {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      toast.error('Không thể tải thẻ');
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      // Only auto-generate slug when creating (not editing)
      slug: editingTag ? formData.slug : generateSlug(name)
    });
  };

  const handleCreate = () => {
    setEditingTag(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#3B82F6',
      is_active: true
    });
    setShowModal(true);
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || '',
      color: tag.color || '#3B82F6',
      is_active: tag.is_active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error('Tên và slug là bắt buộc');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingTag
        ? buildApiUrl(`/api/tags/${editingTag.id}`)
        : buildApiUrl('/api/tags');
      
      const response = await fetch(url, {
        method: editingTag ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save tag');
      }

      toast.success(editingTag ? 'Cập nhật thẻ thành công!' : 'Tạo thẻ thành công!');
      setShowModal(false);
      fetchTags();
    } catch (error: any) {
      console.error('Failed to save tag:', error);
      toast.error(error.message || 'Không thể lưu thẻ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa "${name}"?`)) return;

    try {
      const response = await fetch(buildApiUrl(`/api/tags/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete tag');
      }
      
      toast.success('Xóa thẻ thành công!');
      fetchTags();
    } catch (error) {
      console.error('Failed to delete tag:', error);
      toast.error('Không thể xóa thẻ');
    }
  };

  const toggleActive = async (tag: Tag) => {
    try {
      const response = await fetch(buildApiUrl(`/api/tags/${tag.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: !tag.is_active })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle status');
      }

      toast.success(tag.is_active ? 'Vô hiệu hóa thẻ thành công' : 'Kích hoạt thẻ thành công');
      fetchTags();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Không thể thay đổi trạng thái');
    }
  };

  // Filter tags based on search
  const filteredTags = useMemo(() => {
    return tags.filter(tag =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tags, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Đang tải thẻ...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại Bảng điều khiển
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Thẻ</h1>
          <p className="text-muted-foreground mt-1">Quản lý thẻ nội dung để tổ chức tốt hơn</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thẻ mới
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm thẻ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="name">Sắp xếp theo Tên</option>
          <option value="popular">Sắp xếp theo Độ phổ biến</option>
        </select>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {filteredTags.map((tag) => (
          <div
            key={tag.id}
            className="relative p-4 bg-card border border-border rounded-lg hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: tag.color || '#3B82F6' }}
              >
                <TagIcon className="h-5 w-5" />
              </div>
              {!tag.is_active && (
                <span className="absolute top-2 right-2 px-2 py-0.5 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                  Ẩn
                </span>
              )}
            </div>

            <h3 className="font-semibold text-foreground mb-1 truncate">{tag.name}</h3>
            <p className="text-xs text-muted-foreground font-mono mb-2 truncate">{tag.slug}</p>
            
            {tag.description && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {tag.description}
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <span>{tag.post_count} {tag.post_count === 1 ? 'bài viết' : 'bài viết'}</span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEdit(tag)}
                className="flex-1 inline-flex items-center justify-center px-2 py-1.5 rounded bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
                title="Chỉnh sửa"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                onClick={() => toggleActive(tag)}
                className="inline-flex items-center justify-center px-2 py-1.5 rounded bg-secondary hover:bg-secondary/80 transition-colors"
                title={tag.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
              >
                {tag.is_active ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </button>
              <button
                onClick={() => handleDelete(tag.id, tag.name)}
                className="inline-flex items-center justify-center px-2 py-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                title="Xóa"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTags.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? 'Không tìm thấy thẻ nào phù hợp với tìm kiếm.' : 'Chưa có thẻ nào. Tạo thẻ đầu tiên để bắt đầu.'}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {editingTag ? 'Chỉnh sửa Thẻ' : 'Tạo Thẻ Mới'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                  Tên <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-1">
                  Slug <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                  Mô tả
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Color */}
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-foreground mb-1">
                  Màu sắc
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-primary/50"
                />
                <label htmlFor="is_active" className="text-sm text-foreground">
                  Hoạt động (hiển thị cho người dùng)
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent transition-colors"
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu...' : editingTag ? 'Cập nhật Thẻ' : 'Tạo Thẻ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
