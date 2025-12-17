'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import RichTextEditor from '@/components/RichTextEditor';
import MediaPicker from '@/components/MediaPicker';
import SEOPopup from '@/components/SEOPopup';
import { generateSlug } from '@/lib/slug';
import { Image as ImageIcon, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { buildApiUrl, getAssetUrl } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
}

export default function NewPostPage(){
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [manualEdit, setManualEdit] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [readTime, setReadTime] = useState('');
  const [content, setContent] = useState<string>(''); // Changed to string for HTML content
  const [status, setStatus] = useState<'draft'|'published'>('draft');
  const [authorId, setAuthorId] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [pubDate, setPubDate] = useState<string>(()=> new Date().toISOString().slice(0,10));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [featuredImageId, setFeaturedImageId] = useState<string>('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [allTopics, setAllTopics] = useState<Array<{id:string; name:string}>>([]);
  const [allTags, setAllTags] = useState<Array<{id:string; name:string}>>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  
  // Post type and conditional fields
  const [isFeatured, setIsFeatured] = useState(true); // Default to true
  const [seo, setSeo] = useState<any>(null);
  const [showSeoPopup, setShowSeoPopup] = useState(false);

  const handleSelectFeaturedImage = async (value: string | string[]) => {
    const assetId = Array.isArray(value) ? value[0] : value;
    console.log('[handleSelectFeaturedImage] Selected asset ID:', assetId);
    setFeaturedImageId(assetId || '');
    setDirty(true);
    
    // Fetch asset details to get URL
    if (assetId) {
      try {
        const response = await fetch(buildApiUrl(`/api/assets/${assetId}`), {
          credentials: 'include'
        });
        if (response.ok) {
          const asset = await response.json();
          const imageUrl = getAssetUrl(asset.sizes?.medium?.url || asset.url);
          setFeaturedImage(imageUrl);
        }
      } catch (error) {
        console.error('Failed to fetch asset:', error);
      }
    } else {
      setFeaturedImage('');
    }
  };

  const slugPreview = useMemo(()=> `/blog/${slug || generateSlug(title)}`, [slug, title]);

  // Fetch users for author dropdown
  useEffect(() => {
    fetch(buildApiUrl('/api/users'), { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        const userList = Array.isArray(d) ? d : (d?.data || []);
        setUsers(userList);
      })
      .catch(err => {
        console.error('Failed to fetch users:', err);
      });
  }, []);

  // Fetch topics and tags
  useEffect(() => {
    Promise.all([
      fetch(buildApiUrl('/api/topics'), { credentials: 'include' }).then(r=>r.json()).catch(()=>[]),
      fetch(buildApiUrl('/api/tags'), { credentials: 'include' }).then(r=>r.json()).catch(()=>[]),
    ]).then(([topics, tags]) => {
      setAllTopics(Array.isArray(topics) ? topics : []);
      setAllTags(Array.isArray(tags) ? tags : []);
    }).catch((e)=>{
      console.error('Failed to fetch topics/tags', e);
    });
  }, []);

  // Debounced auto-generate slug unless user edited it manually
  useEffect(()=>{
    setDirty(true);
    if (manualEdit || !title) return;
    const t = setTimeout(()=>{
      setSlug(generateSlug(title));
    }, 1200);
    return ()=> clearTimeout(t);
  }, [title, manualEdit]);

  // Ctrl+S to save
  useEffect(()=>{
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  }, [title, slug, excerpt, content, status, authorId, pubDate, isFeatured, readTime]);

  // Optional autosave every 60s
  useEffect(()=>{
    const t = setInterval(()=>{ if (dirty && !saving) handleSubmit(true); }, 60000);
    return ()=> clearInterval(t);
  }, [dirty, saving]);

  const handleSubmit = async (autosave?: boolean) => {
    console.log('[handleSubmit] featuredImageId:', featuredImageId);
      if (!title) { 
      if(!autosave) toast.error('Tiêu đề là bắt buộc');
      return;
    }
    setSaving(true);
    try{
      const body: any = {
        title,
        slug: slug || generateSlug(title),
        excerpt,
        content,
        status: autosave ? 'draft' : status,
        published_at: (status === 'published') ? pubDate : undefined,
        is_featured: isFeatured,
        topics: selectedTopicIds,
        tags: selectedTagIds,
      read_time: readTime?.trim() ? readTime.trim() : null,
        seo: seo, // Include SEO data
      };
      
      // Only include author_id if a user is selected
      if (authorId) {
        body.author_id = authorId;
      }
      
      // Include cover_asset_id if featured image is selected
      if (featuredImageId) {
        body.cover_asset_id = featuredImageId;
        console.log('[handleSubmit] Adding cover_asset_id:', featuredImageId);
      } else {
        console.log('[handleSubmit] No featuredImageId, skipping cover_asset_id');
      }

      // Attach topics/tags selections (arrays of ids)
      if (selectedTopicIds.length) body.topics = selectedTopicIds;
      if (selectedTagIds.length) body.tags = selectedTagIds;
      
      // Blog/Article-specific fields
      
      console.log('[handleSubmit] Final Body:', JSON.stringify(body, null, 2));
      
      const res = await fetch(buildApiUrl('/api/posts'),{
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        credentials:'include',
        body: JSON.stringify(body),
      });
      
      if(!res.ok) {
        const json = await res.json().catch(()=>({ error: 'Failed to create post' }));
        throw new Error(json.message || json.error || 'Failed to create post');
      }
      
      if (!autosave) {
        toast.success(status === 'published' ? 'Xuất bản bài viết thành công!' : 'Lưu bản nháp thành công!');
        router.push('/dashboard/posts');
      }
      setDirty(false);
    }catch(err){
      console.error('[NewPost] Error:', err);
      if (!autosave) {
        toast.error(err instanceof Error ? err.message : 'Không thể tạo bài viết');
      }
    }finally{ 
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tạo bài viết</h1>
          <p className="text-sm text-muted-foreground">Thêm bài viết mới vào blog của bạn</p>
        </div>
        <Link
          href="/dashboard/posts"
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Tiêu đề</label>
            <input className="w-full rounded border border-input bg-background text-foreground px-3 py-2" value={title} onChange={(e)=>setTitle(e.target.value)} required />
            <div className="text-xs text-muted-foreground mt-1">Xem trước: {slugPreview}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Slug</label>
            <input className="w-full rounded border border-input bg-background text-foreground px-3 py-2" value={slug} onChange={(e)=>setSlug(generateSlug(e.target.value))} />
            <p className="text-xs text-muted-foreground mt-1">Tự động tạo từ tiêu đề; bạn có thể chỉnh sửa.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Tóm tắt</label>
            <textarea className="w-full rounded border border-input bg-background text-foreground px-3 py-2" value={excerpt} onChange={(e)=>setExcerpt(e.target.value)} rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Thời gian đọc ước tính</label>
            <input
              className="w-full rounded border border-input bg-background text-foreground px-3 py-2"
              value={readTime}
              onChange={(e) => {
                setReadTime(e.target.value);
                setDirty(true);
              }}
              placeholder="ví dụ: 5 phút đọc"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Hiển thị cùng bài viết để giúp người đọc ước tính thời gian đọc.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Nội dung</label>
            <RichTextEditor 
              value={content} 
              onChange={(html) => { 
                setContent(html); 
                setDirty(true); 
              }} 
              placeholder="Bắt đầu viết nội dung bài viết của bạn tại đây..."
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded border p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Hình ảnh nổi bật</label>
              {featuredImage ? (
                <div className="relative">
                  <img
                    src={featuredImage}
                    alt="Featured"
                    className="w-full h-40 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImage('');
                      setFeaturedImageId('');
                      setDirty(true);
                    }}
                    className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="w-full h-40 rounded border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-sm">Chọn từ Thư viện Media</span>
                </button>
              )}
              {featuredImage && (
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="w-full mt-2 text-sm text-primary hover:underline"
                >
                  Đổi hình ảnh
                </button>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Tác giả (tùy chọn)</label>
              <select
                className="w-full rounded border border-input bg-background text-foreground px-3 py-2"
                value={authorId}
                onChange={(e)=>setAuthorId(e.target.value)}
              >
                <option value="">-- Không có tác giả --</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">Chọn tác giả hoặc để trống.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Ngày xuất bản</label>
              <input type="date" className="w-full rounded border border-input bg-background text-foreground px-3 py-2" value={pubDate} onChange={(e)=>setPubDate(e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Sử dụng khi trạng thái là Đã xuất bản (có thể lên lịch tương lai).</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Trạng thái</label>
              <select className="w-full rounded border border-input bg-background text-foreground px-3 py-2" value={status} onChange={(e)=>setStatus(e.target.value as any)}>
                <option value="draft">Bản nháp</option>
                <option value="published">Đã xuất bản</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-foreground">
                <input type="checkbox" checked={isFeatured} onChange={(e)=>setIsFeatured(e.target.checked)} />
                <span className="text-sm font-medium">Bài viết nổi bật</span>
              </label>
              <p className="text-xs text-muted-foreground mt-1">Hiển thị trên trang chủ</p>
            </div>
            {/* Topics */}
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Chủ đề</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto rounded border border-input bg-background p-2">
                {allTopics.map(t => (
                  <label key={t.id} className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedTopicIds.includes(t.id)}
                      onChange={(e)=>{
                        setSelectedTopicIds(prev => e.target.checked ? [...prev, t.id] : prev.filter(id=>id!==t.id));
                        setDirty(true);
                      }}
                    />
                    <span>{t.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Chọn một hoặc nhiều chủ đề.</p>
            </div>
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Thẻ</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto rounded border border-input bg-background p-2">
                {allTags.map(t => (
                  <label key={t.id} className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selectedTagIds.includes(t.id)}
                      onChange={(e)=>{
                        setSelectedTagIds(prev => e.target.checked ? [...prev, t.id] : prev.filter(id=>id!==t.id));
                        setDirty(true);
                      }}
                    />
                    <span>{t.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Thêm thẻ để cải thiện khả năng tìm kiếm.</p>
            </div>
            {/* SEO */}
            <div className="rounded border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-foreground">SEO</label>
                <button
                  type="button"
                  onClick={() => setShowSeoPopup(true)}
                  className="text-sm text-primary hover:underline"
                >
                  {seo ? 'Chỉnh sửa SEO' : 'Thiết lập SEO'}
                </button>
              </div>
              {seo ? (
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Title:</span>
                    <p className="text-foreground font-medium">{seo.title || '(Chưa có)'}</p>
                  </div>
                  {seo.description && (
                    <div>
                      <span className="text-muted-foreground">Description:</span>
                      <p className="text-foreground line-clamp-2">{seo.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Chưa có cấu hình SEO. Click "Thiết lập SEO" để thêm.</p>
              )}
            </div>
          </div>
          <button onClick={()=>handleSubmit(false)} disabled={saving} className="w-full rounded bg-blue-600 text-white px-3 py-2">{saving? 'Đang lưu...':'Lưu'}</button>
        </div>
      </div>
      
      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        value={featuredImageId}
        onChange={handleSelectFeaturedImage}
        modalOnly
      />

      {/* SEO Popup */}
      <SEOPopup
        isOpen={showSeoPopup}
        onClose={() => setShowSeoPopup(false)}
        onSave={(seoData) => setSeo(seoData)}
        initialData={seo}
      />
    </div>
  );
}
