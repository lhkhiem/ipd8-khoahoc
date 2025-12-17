'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Truck,
  DollarSign,
  ShieldCheck,
  Award,
  Heart,
  BookOpen,
  LucideIcon,
  Sparkles,
} from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { buildApiUrl } from '@/lib/api';

interface ValueProp {
  id: string;
  title: string;
  subtitle?: string;
  icon_key?: string;
  icon_color?: string;
  icon_background?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ValuePropForm {
  title: string;
  subtitle: string;
  icon_key: string;
  icon_color: string;
  icon_background: string;
  sort_order: number;
  is_active: boolean;
}

const ICON_OPTIONS: Array<{ value: string; label: string; icon: LucideIcon }> = [
  { value: 'shipping', label: 'Shipping', icon: Truck },
  { value: 'dollar', label: 'Savings', icon: DollarSign },
  { value: 'shield-check', label: 'Guarantee', icon: ShieldCheck },
  { value: 'award', label: 'Award', icon: Award },
  { value: 'heart', label: 'Rewards', icon: Heart },
  { value: 'book-open', label: 'Education', icon: BookOpen },
];

const DEFAULT_FORM: ValuePropForm = {
  title: '',
  subtitle: '',
  icon_key: ICON_OPTIONS[0]?.value || 'shipping',
  icon_color: '#2563eb',
  icon_background: '#bfdbfe',
  sort_order: 0,
  is_active: true,
};

const getIconByKey = (key?: string): LucideIcon => {
  const match = ICON_OPTIONS.find((item) => item.value === key);
  return match?.icon || Sparkles;
};

const buildPayload = (value: ValueProp, overrides: Partial<ValuePropForm & { sort_order?: number }> = {}) => {
  const payload = {
    title: (overrides.title ?? value.title ?? '').trim(),
    subtitle: (overrides.subtitle ?? value.subtitle ?? '')?.trim() || null,
    icon_key: (overrides.icon_key ?? value.icon_key ?? '') || null,
    icon_color: (overrides.icon_color ?? value.icon_color ?? '') || null,
    icon_background: (overrides.icon_background ?? value.icon_background ?? '') || null,
    sort_order: overrides.sort_order ?? value.sort_order ?? 0,
    is_active: overrides.is_active ?? value.is_active ?? true,
  };

  // Convert empty strings to null for optional fields
  if (!payload.icon_key) payload.icon_key = null;
  if (!payload.icon_color) payload.icon_color = null;
  if (!payload.icon_background) payload.icon_background = null;

  return payload;
};

export default function ValuePropsPage() {
  const [valueProps, setValueProps] = useState<ValueProp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ValueProp | null>(null);
  const [form, setForm] = useState<ValuePropForm>(DEFAULT_FORM);

  useEffect(() => {
    fetchValueProps();
  }, []);

  const sortedValueProps = useMemo(
    () => [...valueProps].sort((a, b) => a.sort_order - b.sort_order || (a.created_at || '').localeCompare(b.created_at || '')),
    [valueProps]
  );

  const fetchValueProps = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ data: ValueProp[] }>(buildApiUrl('/api/homepage/value-props'), {
        withCredentials: true,
      });
      setValueProps(response.data?.data || []);
    } catch (error) {
      console.error('[fetchValueProps] Error:', error);
      setValueProps([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...DEFAULT_FORM,
      sort_order: valueProps.length,
    });
    setShowDialog(true);
  };

  const openEdit = (item: ValueProp) => {
    setEditing(item);
    setForm({
      title: item.title,
      subtitle: item.subtitle || '',
      icon_key: item.icon_key || DEFAULT_FORM.icon_key,
      icon_color: item.icon_color || DEFAULT_FORM.icon_color,
      icon_background: item.icon_background || DEFAULT_FORM.icon_background,
      sort_order: item.sort_order ?? 0,
      is_active: item.is_active,
    });
    setShowDialog(true);
  };

  const resetDialog = () => {
    setShowDialog(false);
    setEditing(null);
    setForm({ ...DEFAULT_FORM, sort_order: valueProps.length });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      icon_key: form.icon_key || null,
      icon_color: form.icon_color?.trim() || null,
      icon_background: form.icon_background?.trim() || null,
      sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
      is_active: form.is_active,
    };

    setSaving(true);
    try {
      if (editing) {
        await axios.put(buildApiUrl(`/api/homepage/value-props/${editing.id}`), payload, {
          withCredentials: true,
        });
      } else {
        await axios.post(buildApiUrl('/api/homepage/value-props'), payload, {
          withCredentials: true,
        });
      }
      resetDialog();
      fetchValueProps();
    } catch (error: any) {
      console.error(')[ValuePropsPage] Save failed:', error);
      const message = error.response?.data?.error || error.message || 'Failed to save value prop';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa giá trị cốt lõi này?')) return;
    try {
      await axios.delete(buildApiUrl(`/api/homepage/value-props/${id}`), {
        withCredentials: true,
      });
      fetchValueProps();
    } catch (error) {
      console.error(')[ValuePropsPage] Delete failed:', error);
      alert('Failed to delete value prop');
    }
  };

  const handleToggleActive = async (item: ValueProp) => {
    try {
      await axios.put(
        buildApiUrl(`/api/homepage/value-props/${item.id}`),
        buildPayload(item, { is_active: !item.is_active }),
        {
          withCredentials: true,
        }
      );
      fetchValueProps();
    } catch (error) {
      console.error(')[ValuePropsPage] Toggle failed:', error);
      alert('Không thể cập nhật trạng thái');
    }
  };

  const handleMove = async (item: ValueProp, direction: 'up' | 'down') => {
    const currentIndex = sortedValueProps.findIndex(v => v.id === item.id);
    if (currentIndex === -1) return;

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= sortedValueProps.length) return;

    const target = sortedValueProps[swapIndex];

    try {
      await Promise.all([
        axios.put(buildApiUrl(`/api/homepage/value-props/${item.id}`), buildPayload(item, { sort_order: target.sort_order }), {
          withCredentials: true,
        }),
        axios.put(buildApiUrl(`/api/homepage/value-props/${target.id}`), buildPayload(target, { sort_order: item.sort_order }), {
          withCredentials: true,
        }),
      ]);
      fetchValueProps();
    } catch (error) {
      console.error('[ValuePropsPage] Reorder failed:', error);
      alert('Không thể sắp xếp lại giá trị cốt lõi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Giá trị cốt lõi trang chủ</h1>
          <p className="text-sm text-muted-foreground">Quản lý các ô giá trị cốt lõi hiển thị trên trang chủ.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Thêm giá trị cốt lõi
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        </div>
      ) : sortedValueProps.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Chưa có giá trị cốt lõi nào"
          description="Tạo giá trị cốt lõi đầu tiên để làm nổi bật các lợi ích chính trên trang chủ."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedValueProps.map((item, index) => {
            const Icon = getIconByKey(item.icon_key);
            const background = item.icon_background || '#ede9fe';
            const color = item.icon_color || '#6d28d9';

            return (
              <div key={item.id} className="flex flex-col rounded-2xl border border-border bg-card shadow-sm">
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: background }}
                    >
                      <Icon className="h-6 w-6" style={{ color }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-card-foreground">{item.title}</h3>
                      {item.subtitle && (
                        <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>Thứ tự: {item.sort_order}</span>
                    <span>Icon: {item.icon_key || 'mặc định'}</span>
                    <span>
                      Màu sắc: <span className="inline-block h-3 w-3 rounded-full mr-1" style={{ backgroundColor: color }} />
                      <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: background }} />
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMove(item, 'up')}
                      disabled={index === 0}
                      className="rounded p-2 text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      title="Di chuyển lên"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMove(item, 'down')}
                      disabled={index === sortedValueProps.length - 1}
                      className="rounded p-2 text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      title="Di chuyển xuống"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(item)}
                      className="rounded p-2 text-muted-foreground hover:text-foreground"
                      title={item.is_active ? 'Hủy kích hoạt' : 'Kích hoạt'}
                    >
                      {item.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="rounded p-2 text-primary hover:bg-primary/10"
                      title="Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded p-2 text-destructive hover:bg-destructive/10"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={resetDialog}
        >
          <div
            className="w-full max-w-xl rounded-lg bg-card border border-border p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-foreground">{editing ? 'Chỉnh sửa giá trị cốt lõi' : 'Tạo giá trị cốt lõi'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Tiêu đề <span className="text-destructive">*</span>
                  </label>
                  <input
                    className="w-full rounded border border-input bg-background text-foreground px-3 py-2"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phụ đề</label>
                  <input
                    className="w-full rounded border border-input bg-background text-foreground px-3 py-2"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    placeholder="Văn bản hỗ trợ ngắn"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Icon</label>
                    <select
                      className="w-full rounded border border-input bg-background text-foreground px-3 py-2"
                      value={form.icon_key}
                      onChange={(e) => setForm({ ...form, icon_key: e.target.value })}
                    >
                      {ICON_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end gap-3">
                    <div className="flex flex-1 flex-col">
                      <label className="text-sm font-medium text-foreground mb-1">Màu icon</label>
                      <input
                        type="color"
                        className="h-10 w-full rounded border border-input"
                        value={form.icon_color}
                        onChange={(e) => setForm({ ...form, icon_color: e.target.value })}
                      />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <label className="text-sm font-medium text-foreground mb-1">Nền</label>
                      <input
                        type="color"
                        className="h-10 w-full rounded border border-input"
                        value={form.icon_background}
                        onChange={(e) => setForm({ ...form, icon_background: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Thứ tự</label>
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded border border-input bg-background text-foreground px-3 py-2"
                      value={form.sort_order}
                      onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      id="value-prop-active"
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <label htmlFor="value-prop-active" className="text-sm text-foreground">Hoạt động</label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetDialog}
                  className="rounded-lg border border-input bg-background text-foreground px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {saving ? 'Đang lưu…' : editing ? 'Cập nhật giá trị cốt lõi' : 'Tạo giá trị cốt lõi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


