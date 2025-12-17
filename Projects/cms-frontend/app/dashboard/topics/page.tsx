'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, ArrowLeft, Search, Pencil, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/api';

interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#3B82F6',
    icon: '',
    is_active: true
  });

  const router = useRouter();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/api/topics'), {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }
      
      const data = await response.json();
      setTopics(data);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
      toast.error('Không thể tải chủ đề');
      setTopics([]);
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
      slug: editingTopic ? formData.slug : generateSlug(name)
    });
  };

  const handleCreate = () => {
    setEditingTopic(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      color: '#3B82F6',
      icon: '',
      is_active: true
    });
    setShowModal(true);
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({
      name: topic.name,
      slug: topic.slug,
      description: topic.description || '',
      color: topic.color || '#3B82F6',
      icon: topic.icon || '',
      is_active: topic.is_active
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
      const url = editingTopic
        ? buildApiUrl(`/api/topics/${editingTopic.id}`)
        : buildApiUrl('/api/topics');
      
      const response = await fetch(url, {
        method: editingTopic ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save topic');
      }

      toast.success(editingTopic ? 'Cập nhật chủ đề thành công!' : 'Tạo chủ đề thành công!');
      setShowModal(false);
      fetchTopics();
    } catch (error: any) {
      console.error('Failed to save topic:', error);
      toast.error(error.message || 'Không thể lưu chủ đề');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa "${name}"?`)) return;

    try {
      const response = await fetch(buildApiUrl(`/api/topics/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete topic');
      }
      
      toast.success('Xóa chủ đề thành công!');
      fetchTopics();
    } catch (error) {
      console.error('Failed to delete topic:', error);
      toast.error('Không thể xóa chủ đề');
    }
  };

  const toggleActive = async (topic: Topic) => {
    try {
      const response = await fetch(buildApiUrl(`/api/topics/${topic.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: !topic.is_active })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle status');
      }

      toast.success(topic.is_active ? 'Vô hiệu hóa chủ đề thành công' : 'Kích hoạt chủ đề thành công');
      fetchTopics();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Không thể thay đổi trạng thái');
    }
  };

  // Filter topics based on search
  const filteredTopics = useMemo(() => {
    return topics.filter(topic =>
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [topics, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Đang tải chủ đề...</div>
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
          <h1 className="text-3xl font-bold text-foreground">Chủ đề</h1>
          <p className="text-muted-foreground mt-1">Quản lý chủ đề và danh mục nội dung</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Chủ đề mới
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm chủ đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className="p-6 bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: topic.color || '#3B82F6' }}
                >
                  {topic.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{topic.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{topic.slug}</p>
                </div>
              </div>
              {!topic.is_active && (
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                  Không hoạt động
                </span>
              )}
            </div>

            {topic.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {topic.description}
              </p>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <button
                onClick={() => handleEdit(topic)}
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
              >
                <Pencil className="h-3.5 w-3.5" />
                Chỉnh sửa
              </button>
              <button
                onClick={() => toggleActive(topic)}
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
                title={topic.is_active ? 'Vô hiệu hóa' : 'Kích hoạt'}
              >
                {topic.is_active ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                onClick={() => handleDelete(topic.id, topic.name)}
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                title="Xóa"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? 'Không tìm thấy chủ đề nào phù hợp với tìm kiếm.' : 'Chưa có chủ đề nào. Tạo chủ đề đầu tiên để bắt đầu.'}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {editingTopic ? 'Chỉnh sửa Chủ đề' : 'Tạo Chủ đề Mới'}
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

              {/* Icon */}
              <div>
                <label htmlFor="icon" className="block text-sm font-medium text-foreground mb-1">
                  Icon (tên lucide-react)
                </label>
                <input
                  type="text"
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="ví dụ: Cpu, Heart, Briefcase"
                />
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
                  {submitting ? 'Đang lưu...' : editingTopic ? 'Cập nhật Chủ đề' : 'Tạo Chủ đề'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
