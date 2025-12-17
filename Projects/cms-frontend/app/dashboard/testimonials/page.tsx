'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Star, StarOff } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { buildApiUrl } from '@/lib/api';

interface Testimonial {
  id: string;
  customer_name: string;
  customer_title?: string;
  customer_initials?: string;
  testimonial_text: string;
  rating: number;
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface TestimonialForm {
  customer_name: string;
  customer_title: string;
  customer_initials: string;
  testimonial_text: string;
  rating: number;
  sort_order: number;
  is_featured: boolean;
  is_active: boolean;
}

const DEFAULT_FORM: TestimonialForm = {
  customer_name: '',
  customer_title: '',
  customer_initials: '',
  testimonial_text: '',
  rating: 5,
  sort_order: 0,
  is_featured: false,
  is_active: true,
};

const clampRating = (value: number) => {
  if (Number.isNaN(value)) return 5;
  return Math.min(5, Math.max(1, Math.round(value)));
};

const buildPayload = (
  base: Testimonial | TestimonialForm,
  overrides: Partial<TestimonialForm> = {}
) => {
  const merged = {
    customer_name: (overrides.customer_name ?? base.customer_name ?? '').trim(),
    customer_title: (overrides.customer_title ?? base.customer_title ?? '')?.trim() || null,
    customer_initials: (overrides.customer_initials ?? base.customer_initials ?? '')?.trim() || null,
    testimonial_text: (overrides.testimonial_text ?? base.testimonial_text ?? '').trim(),
    rating: clampRating(overrides.rating ?? (base.rating ?? 5)),
    sort_order: overrides.sort_order ?? base.sort_order ?? 0,
    is_featured: overrides.is_featured ?? (base.is_featured ?? false),
    is_active: overrides.is_active ?? (base.is_active ?? true),
  };

  return merged;
};

const renderRating = (rating: number) => {
  const stars: JSX.Element[] = [];
  const clamped = clampRating(rating);
  for (let i = 1; i <= 5; i += 1) {
    if (clamped >= i) {
      stars.push(<Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-400" />);
    } else {
      stars.push(<StarOff key={i} className="h-4 w-4 text-muted-foreground" />);
    }
  }
  return <div className="flex items-center gap-1">{stars}</div>;
};

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<TestimonialForm>(DEFAULT_FORM);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const orderedTestimonials = useMemo(
    () =>
      [...testimonials].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (a.created_at || '').localeCompare(b.created_at || '')
      ),
    [testimonials]
  );

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ data: Testimonial[] }>(buildApiUrl('/api/homepage/testimonials'), {
        withCredentials: true,
      });
      setTestimonials(response.data?.data || []);
    } catch (error) {
      console.error(')[Testimonials] fetch error:', error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...DEFAULT_FORM,
      sort_order: testimonials.length,
    });
    setShowDialog(true);
  };

  const openEdit = (item: Testimonial) => {
    setEditing(item);
    setForm({
      customer_name: item.customer_name,
      customer_title: item.customer_title || '',
      customer_initials: item.customer_initials || '',
      testimonial_text: item.testimonial_text,
      rating: clampRating(item.rating),
      sort_order: item.sort_order ?? 0,
      is_featured: item.is_featured,
      is_active: item.is_active,
    });
    setShowDialog(true);
  };

  const resetDialog = () => {
    setShowDialog(false);
    setEditing(null);
    setForm({
      ...DEFAULT_FORM,
      sort_order: testimonials.length,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;

    const payload = buildPayload(form, {
      rating: clampRating(form.rating),
      sort_order: Number.isFinite(form.sort_order) ? form.sort_order : 0,
    });

    if (!payload.customer_name) {
      alert('Tên khách hàng là bắt buộc.');
      return;
    }
    if (!payload.testimonial_text) {
      alert('Lời chứng thực là bắt buộc.');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await axios.put(buildApiUrl(`/api/homepage/testimonials/${editing.id}`), payload, {
          withCredentials: true,
        });
      } else {
        await axios.post(buildApiUrl('/api/homepage/testimonials'), payload, {
          withCredentials: true,
        });
      }
      resetDialog();
      fetchTestimonials();
    } catch (error: any) {
      console.error('[Testimonials] save failed:', error);
      const message = error.response?.data?.error || error.message || 'Failed to save testimonial';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lời chứng thực này?')) return;
    try {
      await axios.delete(buildApiUrl(`/api/homepage/testimonials/${id}`), {
        withCredentials: true,
      });
      fetchTestimonials();
    } catch (error) {
      console.error(')[Testimonials] delete failed:', error);
      alert('Không thể xóa lời chứng thực');
    }
  };

  const handleToggle = async (item: Testimonial, field: 'is_active' | 'is_featured') => {
    const next = field === 'is_active' ? !item.is_active : !item.is_featured;
    const payload = buildPayload(item, { [field]: next } as Partial<TestimonialForm>);

    setTestimonials((prev) =>
      prev.map((t) =>
        t.id === item.id
          ? { ...t, [field]: next }
          : t
      )
    );

    try {
      await axios.put(buildApiUrl(`/api/homepage/testimonials/${item.id}`), payload, {
        withCredentials: true,
      });
      fetchTestimonials();
    } catch (error) {
      console.error(')[Testimonials] toggle failed:', error);
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === item.id
            ? { ...t, [field]: !next }
            : t
        )
      );
      alert('Không thể cập nhật lời chứng thực');
    }
  };

  const handleSortChange = async (item: Testimonial, value: number) => {
    const nextValue = Number.isFinite(value) ? value : 0;
    const payload = buildPayload(item, { sort_order: nextValue });
    setTestimonials((prev) =>
      prev.map((t) =>
        t.id === item.id
          ? { ...t, sort_order: nextValue }
          : t
      )
    );

    try {
      await axios.put(buildApiUrl(`/api/homepage/testimonials/${item.id}`), payload, {
        withCredentials: true,
      });
      fetchTestimonials();
    } catch (error) {
      console.error(')[Testimonials] sort update failed:', error);
      alert('Không thể cập nhật thứ tự');
      fetchTestimonials();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lời chứng thực</h1>
          <p className="text-sm text-muted-foreground">Quản lý lời chứng thực khách hàng hiển thị trên trang chủ.</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Thêm lời chứng thực
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        </div>
      ) : orderedTestimonials.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Chưa có lời chứng thực nào"
          description="Thêm lời chứng thực khách hàng để xây dựng niềm tin trên trang chủ của bạn."
          action={{
            label: 'Thêm lời chứng thực',
            onClick: openCreate,
          }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orderedTestimonials.map((item) => (
            <div key={item.id} className="rounded-lg border border-border bg-card p-6 space-y-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">{item.customer_name}</h3>
                  {item.customer_title && (
                    <p className="text-sm text-muted-foreground">{item.customer_title}</p>
                  )}
                  {item.customer_initials && (
                    <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">Initials: {item.customer_initials}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {renderRating(item.rating)}
                </div>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-5">
                “{item.testimonial_text}”
              </p>

              <div className="space-y-3 text-xs font-medium text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Trạng thái</span>
                  <label className="inline-flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wide">{item.is_active ? 'Hoạt động' : 'Ẩn'}</span>
                    <span className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={item.is_active}
                        onChange={() => handleToggle(item, 'is_active')}
                        aria-label="Toggle active state"
                      />
                      <span className="block h-4 w-8 rounded-full bg-gray-300 transition-colors peer-checked:bg-green-500" />
                      <span className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform duration-200 ease-out peer-checked:translate-x-4" />
                    </span>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span>Nổi bật</span>
                  <label className="inline-flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wide">{item.is_featured ? 'Nổi bật' : 'Tiêu chuẩn'}</span>
                    <span className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={item.is_featured}
                        onChange={() => handleToggle(item, 'is_featured')}
                        aria-label="Toggle featured state"
                      />
                      <span className="block h-4 w-8 rounded-full bg-gray-300 transition-colors peer-checked:bg-amber-500" />
                      <span className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform duration-200 ease-out peer-checked:translate-x-4" />
                    </span>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span>Thứ tự</span>
                  <input
                    type="number"
                    className="w-20 rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    value={item.sort_order}
                    onChange={(e) => handleSortChange(item, Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => openEdit(item)}
                  className="inline-flex items-center justify-center rounded-full bg-primary/10 p-2 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Edit testimonial"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="inline-flex items-center justify-center rounded-full bg-destructive/10 p-2 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  aria-label="Delete testimonial"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={resetDialog}
        >
          <div
            className="w-full max-w-2xl rounded-lg bg-card border border-border p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-foreground">{editing ? 'Chỉnh sửa lời chứng thực' : 'Tạo lời chứng thực'}</h3>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Tên khách hàng *</label>
                  <input
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={form.customer_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, customer_name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Chức danh khách hàng</label>
                  <input
                    className="w-full rounded border border-input bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={form.customer_title}
                    onChange={(e) => setForm((prev) => ({ ...prev, customer_title: e.target.value }))}
                    placeholder="Chủ sở hữu, Chuyên viên thẩm mỹ, v.v."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Chữ viết tắt</label>
                  <input
                    className="w-full rounded border border-input bg-background text-foreground px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-ring"
                    value={form.customer_initials}
                    onChange={(e) => setForm((prev) => ({ ...prev, customer_initials: e.target.value }))}
                    maxLength={4}
                    placeholder="AB"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Đánh giá (1-5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={form.rating}
                    onChange={(e) => setForm((prev) => ({ ...prev, rating: clampRating(Number(e.target.value)) }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Lời chứng thực *</label>
                <textarea
                  className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={5}
                  value={form.testimonial_text}
                  onChange={(e) => setForm((prev) => ({ ...prev, testimonial_text: e.target.value }))}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground">Thứ tự</label>
                  <input
                    type="number"
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={form.sort_order}
                    onChange={(e) => setForm((prev) => ({ ...prev, sort_order: Number(e.target.value) }))}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0"
                    checked={form.is_featured}
                    onChange={(e) => setForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
                  />
                  Nổi bật
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0"
                    checked={form.is_active}
                    onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                  />
                  Hoạt động
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetDialog}
                  className="rounded border border-input bg-background text-foreground px-3 py-2 text-sm hover:bg-muted transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Lưu lời chứng thực'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

