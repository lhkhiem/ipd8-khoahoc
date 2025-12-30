'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, GripVertical, Clock } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { buildApiUrl } from '@/lib/api';
import RichTextEditor from '@/components/RichTextEditor';

interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  order: number;
  created_at: string;
  updated_at: string;
}

interface CourseModulesManagerProps {
  courseId: string;
}

export default function CourseModulesManager({ courseId }: CourseModulesManagerProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  const [order, setOrder] = useState(0);

  useEffect(() => {
    fetchModules();
  }, [courseId]);

  const fetchModules = async () => {
    try {
      const response = await axios.get(buildApiUrl(`/api/courses/${courseId}/modules`), {
        withCredentials: true,
      });
      if (response.data?.data) {
        setModules(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
      toast.error('Không thể tải danh sách modules');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingModule(null);
    setTitle('');
    setDescription('');
    setDurationMinutes('');
    setOrder(modules.length);
    setShowDialog(true);
  };

  const openEdit = (module: Module) => {
    setEditingModule(module);
    setTitle(module.title);
    setDescription(module.description || '');
    setDurationMinutes(module.duration_minutes || '');
    setOrder(module.order);
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Tiêu đề module là bắt buộc');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        duration_minutes: durationMinutes ? Number(durationMinutes) : null,
        order: order || modules.length,
      };

      if (editingModule) {
        await axios.put(
          buildApiUrl(`/api/courses/${courseId}/modules/${editingModule.id}`),
          payload,
          { withCredentials: true }
        );
        toast.success('Module đã được cập nhật');
      } else {
        await axios.post(
          buildApiUrl(`/api/courses/${courseId}/modules`),
          payload,
          { withCredentials: true }
        );
        toast.success('Module đã được tạo');
      }

      setShowDialog(false);
      fetchModules();
    } catch (error: any) {
      console.error('Failed to save module:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể lưu module';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (moduleId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa module này?')) return;

    try {
      await axios.delete(buildApiUrl(`/api/courses/${courseId}/modules/${moduleId}`), {
        withCredentials: true,
      });
      toast.success('Module đã được xóa');
      fetchModules();
    } catch (error: any) {
      console.error('Failed to delete module:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể xóa module';
      toast.error(errorMessage);
    }
  };

  const handleReorder = async (moduleIds: string[]) => {
    try {
      await axios.put(
        buildApiUrl(`/api/courses/${courseId}/modules/reorder`),
        { moduleIds },
        { withCredentials: true }
      );
      toast.success('Thứ tự modules đã được cập nhật');
      fetchModules();
    } catch (error: any) {
      console.error('Failed to reorder modules:', error);
      toast.error('Không thể sắp xếp lại modules');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quản lý Modules</h2>
          <p className="text-muted-foreground">
            Tổng số: {modules.length} modules
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Thêm Module
        </button>
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground mb-4">Chưa có modules nào</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Thêm Module đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((module, index) => (
            <div
              key={module.id}
              className="group flex items-start gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <GripVertical className="h-5 w-5 cursor-move" />
                <span className="text-sm font-medium">#{index + 1}</span>
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground mb-1">
                  {module.title}
                </h3>
                {module.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {module.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {module.duration_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {module.duration_minutes} phút
                    </div>
                  )}
                  <span>Thứ tự: {module.order}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => openEdit(module)}
                  className="rounded-lg border border-border bg-background p-2 hover:bg-accent"
                  title="Chỉnh sửa"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(module.id)}
                  className="rounded-lg border border-border bg-background p-2 hover:bg-accent text-red-600"
                  title="Xóa"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg border border-border bg-card p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">
              {editingModule ? 'Chỉnh sửa Module' : 'Tạo Module mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nhập tiêu đề module"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Mô tả</label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Nhập mô tả module (tùy chọn)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Thời lượng (phút)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="30"
                    min="0"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Thứ tự</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : editingModule ? 'Cập nhật' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

