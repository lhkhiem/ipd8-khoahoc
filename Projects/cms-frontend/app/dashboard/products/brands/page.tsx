'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, Star } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import axios from 'axios';
import { buildApiUrl, getAssetUrl } from '@/lib/api';
import MediaPicker from '@/components/MediaPicker';

interface Brand {
  id: string;
  name: string;
  slug: string;
  website?: string;
  description?: string;
  logo_id?: string | null;
  logo_url?: string | null;
  logo_cdn_url?: string | null;
  is_featured?: boolean;
}

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPickerBrand, setLogoPickerBrand] = useState<Brand | null>(null);
  const [isUpdatingLogo, setIsUpdatingLogo] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    website: '',
    description: '',
    logo_id: '',
    is_featured: false,
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response: any = await axios.get(buildApiUrl('/api/brands'), {
        withCredentials: true
      });
      setBrands(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLogoPicker = (brand: Brand) => {
    setLogoPickerBrand(brand);
  };

  const fetchAssetMeta = async (assetId: string) => {
    try {
      const response = await axios.get(buildApiUrl(`/api/assets/${assetId}`), {
        withCredentials: true,
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Failed to fetch asset metadata:', error);
      return null;
    }
  };

  const closeLogoPicker = () => {
    setLogoPickerBrand(null);
    setIsUpdatingLogo(false);
  };

  const handleLogoSelected = async (value: string | string[]) => {
    const brand = logoPickerBrand;
    if (!brand) return;

    const newLogoId = Array.isArray(value) ? value[0] : value;
    if (!newLogoId) {
      closeLogoPicker();
      return;
    }

    setIsUpdatingLogo(true);
    const previousLogoId = brand.logo_id || '';
    const previousLogoUrl = brand.logo_url || null;
    const previousLogoCdn = brand.logo_cdn_url || null;

    const assetMeta = await fetchAssetMeta(newLogoId);
    const optimisticLogoUrl = assetMeta?.cdn_url || assetMeta?.url || null;
    const optimisticLogoCdn = assetMeta?.cdn_url || null;

    setBrands((prev) =>
      prev.map((b) =>
        b.id === brand.id
          ? {
              ...b,
              logo_id: newLogoId,
              logo_url: optimisticLogoUrl,
              logo_cdn_url: optimisticLogoCdn,
            }
          : b
      )
    );

    try {
      await axios.put(
        buildApiUrl(`/api/brands/${brand.id}`),
        { logo_id: newLogoId },
        { withCredentials: true }
      );
      await fetchBrands();
    } catch (error) {
      console.error('Failed to update brand logo:', error);
      setBrands((prev) =>
        prev.map((b) =>
          b.id === brand.id
            ? {
                ...b,
                logo_id: previousLogoId,
                logo_url: previousLogoUrl,
                logo_cdn_url: previousLogoCdn,
              }
            : b
        )
      );
      alert('Không thể cập nhật logo');
    } finally {
      closeLogoPicker();
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      slug: '',
      website: '',
      description: '',
      logo_id: '',
      is_featured: false,
    });
    setSlugManuallyEdited(false);
    setShowDialog(true);
  };

  const openEdit = (brand: Brand) => {
    setEditing(brand);
    setForm({
      name: brand.name || '',
      slug: brand.slug || '',
      website: brand.website || '',
      description: brand.description || '',
      logo_id: brand.logo_id || '',
      is_featured: Boolean(brand.is_featured),
    });
    setSlugManuallyEdited(false);
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug?.trim() || toSlug(form.name),
        website: form.website?.trim() || null,
        description: form.description?.trim() || null,
        logo_id: form.logo_id || null,
        is_featured: form.is_featured,
      };

      if (editing) {
        await axios.put(buildApiUrl(`/api/brands/${editing.id}`), payload, {
          withCredentials: true
        });
      } else {
        await axios.post(buildApiUrl('/api/brands'), payload, {
          withCredentials: true
        });
      }
      setShowDialog(false);
      fetchBrands();
    } catch (err) {
      alert('Không thể lưu thương hiệu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) return;
    try {
      await axios.delete(buildApiUrl(`/api/brands/${id}`), {
        withCredentials: true
      });
      fetchBrands();
    } catch (error) {
      alert('Không thể xóa thương hiệu');
    }
  };

  const handleFeaturedToggle = async (brand: Brand) => {
    const next = !brand.is_featured;
    setBrands(prev =>
      prev.map(b => (b.id === brand.id ? { ...b, is_featured: next } : b))
    );

    try {
      await axios.put(
        buildApiUrl(`/api/brands/${brand.id}`),
        { is_featured: next },
        { withCredentials: true }
      );
    } catch (error) {
      setBrands(prev =>
        prev.map(b => (b.id === brand.id ? { ...b, is_featured: !next } : b))
      );
      alert('Không thể cập nhật trạng thái nổi bật');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Thương hiệu</h1>
          <p className="text-sm text-muted-foreground">Quản lý thương hiệu sản phẩm</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Thêm thương hiệu
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        </div>
      ) : brands.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Chưa có thương hiệu nào"
          description="Thêm thương hiệu để tổ chức sản phẩm theo nhà sản xuất."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <div key={brand.id} className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-start gap-4">
                <div className="flex items-start gap-4">
                  <div className="relative h-12 w-12 rounded bg-muted flex items-center justify-center overflow-hidden">
                    {(() => {
                      const logoSrc = brand.logo_cdn_url
                        ? getAssetUrl(brand.logo_cdn_url)
                        : brand.logo_url
                        ? getAssetUrl(brand.logo_url)
                        : null;
                      return logoSrc ? (
                        <img
                          src={logoSrc}
                          alt={brand.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Tag className="h-5 w-5 text-muted-foreground" />
                      );
                    })()}
                    <button
                      type="button"
                      onClick={() => openLogoPicker(brand)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100 text-white text-xs"
                    >
                      {isUpdatingLogo && logoPickerBrand?.id === brand.id ? 'Đang lưu…' : 'Đổi logo'}
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-card-foreground">{brand.name}</h3>
                      {brand.is_featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/20 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
                          <Star className="h-3 w-3" />
                          Nổi bật
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{brand.slug}</p>
                    {brand.description && (
                      <p className="mt-2 text-sm text-foreground">{brand.description}</p>
                    )}
                    {brand.website && (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-2 inline-block"
                      >
                        Truy cập website
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground">
                <label className="flex items-center gap-2">
                  <span>Nổi bật</span>
                  <span className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={Boolean(brand.is_featured)}
                      onChange={() => handleFeaturedToggle(brand)}
                      aria-label="Toggle featured brand"
                    />
                    <span className="block h-5 w-10 rounded-full bg-gray-300 transition-colors peer-checked:bg-amber-400" />
                    <span className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white shadow transition-transform duration-200 ease-out peer-checked:translate-x-4" />
                  </span>
                </label>
                <button
                  onClick={() => openEdit(brand)}
                  className="inline-flex items-center justify-center rounded-full bg-primary/10 p-2 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Edit brand"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(brand.id)}
                  className="inline-flex items-center justify-center rounded-full bg-destructive/10 p-2 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  aria-label="Delete brand"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowDialog(false)}>
          <div className="w-full max-w-md rounded-lg bg-card border border-border p-6 shadow-xl" onClick={(e)=>e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-foreground">{editing ? 'Chỉnh sửa thương hiệu' : 'Tạo thương hiệu'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Tên</label>
                <input
                  className="w-full rounded border border-input bg-background text-foreground px-3 py-2"
                  value={form.name}
                  onChange={(e) => {
                    const nextName = e.target.value;
                    setForm((prev) => ({
                      ...prev,
                      name: nextName,
                      slug: !slugManuallyEdited && nextName ? toSlug(nextName) : prev.slug,
                    }));
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Slug</label>
                <input
                  className="w-full rounded border border-input bg-background text-foreground px-3 py-2"
                  value={form.slug}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, slug: toSlug(e.target.value) }));
                    setSlugManuallyEdited(true);
                  }}
                  onBlur={() => {
                    // If slug is empty, auto-generate from name
                    if (!form.slug && form.name) {
                      setForm((prev) => ({ ...prev, slug: toSlug(prev.name) }));
                      setSlugManuallyEdited(false);
                    }
                  }}
                  placeholder={form.name ? toSlug(form.name) : "tự động từ tên"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Mô tả</label>
                <textarea
                  className="w-full rounded border border-input bg-background text-foreground px-3 py-2"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Website</label>
                <input
                  className="w-full rounded border border-input bg-background text-foreground px-3 py-2"
                  value={form.website}
                  onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Logo</label>
                <MediaPicker
                  label="Chọn Logo"
                  value={form.logo_id}
                  onChange={(value) =>
                    setForm((prev) => ({ ...prev, logo_id: (value as string) || '' }))
                  }
                  multiple={false}
                  previewSize={120}
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, is_featured: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0"
                />
                Thương hiệu nổi bật
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={()=>setShowDialog(false)} className="rounded border border-input bg-background text-foreground hover:bg-accent px-3 py-2">Hủy</button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded bg-primary text-primary-foreground px-3 py-2 hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaPicker
        value={logoPickerBrand?.logo_id || ''}
        onChange={handleLogoSelected}
        multiple={false}
        modalOnly
        isOpen={!!logoPickerBrand}
        onClose={closeLogoPicker}
        label="Logo thương hiệu"
      />
    </div>
  );
}
