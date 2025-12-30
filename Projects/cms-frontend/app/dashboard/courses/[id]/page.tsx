'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, BookOpen, Calendar, FileText, Settings } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { buildApiUrl } from '@/lib/api';
import MediaPicker from '@/components/MediaPicker';
import RichTextEditor from '@/components/RichTextEditor';
import CourseModulesManager from '@/components/courses/CourseModulesManager';
import CourseSessionsManager from '@/components/courses/CourseSessionsManager';
import CourseMaterialsManager from '@/components/courses/CourseMaterialsManager';

interface Instructor {
  id: string;
  title: string;
  credentials: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  target_audience: string;
  description: string;
  benefits_mom?: string;
  benefits_baby?: string;
  price: number;
  price_type: 'one-off' | 'subscription';
  duration_minutes: number;
  mode: 'group' | 'one-on-one';
  status: 'draft' | 'published';
  featured: boolean;
  thumbnail_url?: string;
  video_url?: string;
  instructor_id?: string;
  seo_title?: string;
  seo_description?: string;
}

type TabType = 'basic' | 'modules' | 'sessions' | 'materials' | 'settings';

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  
  // Course data
  const [course, setCourse] = useState<Course | null>(null);
  
  // Basic Info
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
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
  
  // Instructor
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [instructorId, setInstructorId] = useState('');
  
  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Fetch course data
  useEffect(() => {
    if (courseId) {
      fetchCourse();
      fetchInstructors();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(buildApiUrl(`/api/courses/${courseId}`), {
        withCredentials: true,
      });
      
      if (response.data?.data) {
        const courseData = response.data.data;
        setCourse(courseData);
        
        // Populate form
        setTitle(courseData.title || '');
        setSlug(courseData.slug || '');
        setTargetAudience(courseData.target_audience || 'pregnant-women');
        setDescription(courseData.description || '');
        setBenefitsMom(courseData.benefits_mom || '');
        setBenefitsBaby(courseData.benefits_baby || '');
        setPrice(courseData.price || 0);
        setPriceType(courseData.price_type || 'one-off');
        setDurationMinutes(courseData.duration_minutes || 60);
        setMode(courseData.mode || 'group');
        setStatus(courseData.status || 'draft');
        setFeatured(courseData.featured || false);
        setThumbnailUrl(courseData.thumbnail_url || '');
        setVideoUrl(courseData.video_url || '');
        setInstructorId(courseData.instructor_id || '');
        setSeoTitle(courseData.seo_title || '');
        setSeoDescription(courseData.seo_description || '');
      }
    } catch (error: any) {
      console.error('Failed to fetch course:', error);
      toast.error('Không thể tải thông tin khóa học');
      router.push('/dashboard/courses');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async () => {
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

      await axios.put(buildApiUrl(`/api/courses/${courseId}`), payload, {
        withCredentials: true,
      });

      toast.success('Khóa học đã được cập nhật');
      fetchCourse(); // Refresh data
    } catch (error: any) {
      console.error('Failed to update course:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể cập nhật khóa học';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic' as TabType, label: 'Thông tin cơ bản', icon: BookOpen },
    { id: 'modules' as TabType, label: 'Modules', icon: BookOpen },
    { id: 'sessions' as TabType, label: 'Lịch học', icon: Calendar },
    { id: 'materials' as TabType, label: 'Tài liệu', icon: FileText },
    { id: 'settings' as TabType, label: 'Cài đặt', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Không tìm thấy khóa học</p>
          <Link
            href="/dashboard/courses"
            className="text-primary hover:underline"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

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
              {course.title}
            </h1>
            <p className="text-muted-foreground">
              Chỉnh sửa khóa học
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'basic' && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
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
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Đối tượng <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Lợi ích cho mẹ
                    </label>
                    <RichTextEditor
                      value={benefitsMom}
                      onChange={setBenefitsMom}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Lợi ích cho bé
                    </label>
                    <RichTextEditor
                      value={benefitsBaby}
                      onChange={setBenefitsBaby}
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
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">SEO Description</label>
                    <textarea
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                </div>
              </div>

              {/* Pricing */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Giá</h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Giá (VNĐ)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      min="0"
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
                    <label className="mb-2 block text-sm font-medium">Thời lượng (phút)</label>
                    <input
                      type="number"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
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
        )}

        {activeTab === 'modules' && (
          <CourseModulesManager courseId={courseId} />
        )}

        {activeTab === 'sessions' && (
          <CourseSessionsManager courseId={courseId} />
        )}

        {activeTab === 'materials' && (
          <CourseMaterialsManager courseId={courseId} />
        )}

        {activeTab === 'settings' && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Cài đặt nâng cao</h2>
            <p className="text-muted-foreground">Các cài đặt nâng cao sẽ được thêm sau.</p>
          </div>
        )}
      </div>
    </div>
  );
}

