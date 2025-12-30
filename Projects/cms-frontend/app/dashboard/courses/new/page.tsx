'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { buildApiUrl } from '@/lib/api';
import { generateSlug } from '@/lib/slug';
import MediaPicker from '@/components/MediaPicker';
import RichTextEditor from '@/components/RichTextEditor';

interface Instructor {
  id: string;
  title: string;
  credentials: string;
}

export default function NewCoursePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  // Basic Info
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [manualSlugEdit, setManualSlugEdit] = useState(false);
  const [targetAudience, setTargetAudience] = useState('pregnant-women');
  const [description, setDescription] = useState('');
  const [benefitsMom, setBenefitsMom] = useState('');
  const [benefitsBaby, setBenefitsBaby] = useState('');
  
  // Pricing
  const [price, setPrice] = useState(0);
  const [priceType, setPriceType] = useState<'one-off' | 'subscription'>('one-off');
  
  // Settings
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [mode, setMode] = useState<'group' | 'one-on-one'>('group');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [featured, setFeatured] = useState(false);
  
  // Media
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailId, setThumbnailId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  
  // Instructor
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [instructorId, setInstructorId] = useState('');
  
  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Auto-generate slug from title
  useEffect(() => {
    if (!manualSlugEdit && title) {
      const timer = setTimeout(() => {
        setSlug(generateSlug(title));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [title, manualSlugEdit]);

  // Fetch instructors
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await fetch(buildApiUrl('/api/instructors'), {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setInstructors(Array.isArray(data) ? data : (data?.data || []));
        }
      } catch (error) {
        console.error('Failed to fetch instructors:', error);
      }
    };
    fetchInstructors();
  }, []);

  const handleSelectThumbnail = async (value: string | string[]) => {
    const assetId = Array.isArray(value) ? value[0] : value;
    setThumbnailId(assetId || '');
    
    if (assetId) {
      try {
        const response = await fetch(buildApiUrl(`/api/assets/${assetId}`), {
          credentials: 'include',
        });
        if (response.ok) {
          const asset = await response.json();
          setThumbnailUrl(asset.url || asset.sizes?.medium?.url || '');
        }
      } catch (error) {
        console.error('Failed to fetch asset:', error);
      }
    } else {
      setThumbnailUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !slug) {
      toast.error('Tiêu đề và slug là bắt buộc');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        slug,
        target_audience: targetAudience,
        description,
        benefits_mom: benefitsMom || null,
        benefits_baby: benefitsBaby || null,
        price,
        price_type: priceType,
        duration_minutes: durationMinutes,
        mode,
        status,
        featured,
        thumbnail_url: thumbnailUrl || null,
        video_url: videoUrl || null,
        instructor_id: instructorId || null,
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
      };

      const response = await axios.post(buildApiUrl('/api/courses'), payload, {
        withCredentials: true,
      });

      if (response.status === 201) {
        toast.success('Khóa học đã được tạo thành công');
        const courseId = response.data.data?.id || response.data.id;
        router.push(`/dashboard/courses/${courseId}`);
      }
    } catch (error: any) {
      console.error('Failed to create course:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể tạo khóa học';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Tạo khóa học mới
            </h1>
            <p className="text-muted-foreground">
              Tạo khóa học mới và quản lý nội dung
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Thông tin cơ bản</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Nhập tiêu đề khóa học"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setManualSlugEdit(true);
                    }}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="slug-khoa-hoc"
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    URL: /courses/{slug || 'slug-khoa-hoc'}
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Đối tượng <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="pregnant-women">Phụ nữ mang thai</option>
                    <option value="new-moms">Mẹ mới sinh</option>
                    <option value="parents">Phụ huynh</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={description}
                    onChange={setDescription}
                    placeholder="Nhập mô tả khóa học..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Lợi ích cho mẹ
                  </label>
                  <RichTextEditor
                    value={benefitsMom}
                    onChange={setBenefitsMom}
                    placeholder="Nhập lợi ích cho mẹ..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Lợi ích cho bé
                  </label>
                  <RichTextEditor
                    value={benefitsBaby}
                    onChange={setBenefitsBaby}
                    placeholder="Nhập lợi ích cho bé..."
                  />
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">SEO</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">SEO Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="SEO title (optional)"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">SEO Description</label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="SEO description (optional)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Xuất bản</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Trạng thái</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="draft">Bản nháp</option>
                    <option value="published">Đã xuất bản</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <label htmlFor="featured" className="text-sm font-medium">
                    Khóa học nổi bật
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : 'Tạo khóa học'}
                </button>
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Giá</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Giá (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Loại giá</label>
                  <select
                    value={priceType}
                    onChange={(e) => setPriceType(e.target.value as 'one-off' | 'subscription')}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="one-off">Một lần</option>
                    <option value="subscription">Đăng ký</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Cài đặt</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Thời lượng (phút) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Hình thức</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as 'group' | 'one-on-one')}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="group">Nhóm</option>
                    <option value="one-on-one">Một kèm một</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Giảng viên</label>
                  <select
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Chọn giảng viên</option>
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.title} - {instructor.credentials}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Media</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Ảnh đại diện</label>
                  <MediaPicker
                    value={thumbnailId}
                    onChange={handleSelectThumbnail}
                    label="Chọn ảnh đại diện"
                  />
                  {thumbnailUrl && (
                    <img
                      src={thumbnailUrl}
                      alt="Thumbnail"
                      className="mt-2 h-32 w-full rounded-lg object-cover"
                    />
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Video URL</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

