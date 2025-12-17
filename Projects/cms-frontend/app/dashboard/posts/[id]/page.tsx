'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function EditPostPage(){
  const params = useParams();
  const id = params?.id as string;
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
  const [pubDate, setPubDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [featuredImageId, setFeaturedImageId] = useState<string>('');
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [allTopics, setAllTopics] = useState<Array<{id:string; name:string}>>([]);
  const [allTags, setAllTags] = useState<Array<{id:string; name:string}>>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(true); // Default to true
  const [seo, setSeo] = useState<any>(null);
  const [showSeoPopup, setShowSeoPopup] = useState(false);

  const handleSelectFeaturedImage = async (value: string | string[]) => {
    const assetId = Array.isArray(value) ? value[0] : value;
    console.log('[handleSelectFeaturedImage] Selected asset ID:', assetId);
    setFeaturedImageId(assetId || '');
    
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

  // Fetch topics & tags lists
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

  useEffect(()=>{ fetchPost(); },[id]);

  const fetchPost = async () => {
    try{
      const res = await fetch(buildApiUrl(`/api/posts/${id}`), { credentials: 'include' });
      const data = await res.json();
      setTitle(data.title || '');
      setSlug(data.slug || '');
      setExcerpt(data.excerpt || '');
      // Handle both HTML string and JSON content (for backward compatibility)
      if (typeof data.content === 'string') {
        setContent(data.content);
      } else if (data.content) {
        // If content is JSON (from old TipTap format), convert to HTML or empty
        setContent('');
      } else {
        setContent('');
      }
      setStatus(data.status || 'draft');
      setAuthorId(data.author_id || '');
      setPubDate(data.published_at ? String(data.published_at).slice(0,10) : '');
      setReadTime(data.read_time || data.readTime || '');
      setIsFeatured(data.is_featured !== undefined ? data.is_featured : true); // Default to true if not set
      // Preselect relations if API provides them (optional)
      if (Array.isArray(data.topics)) setSelectedTopicIds(data.topics.map((t:any)=>t.id));
      if (Array.isArray(data.tags)) setSelectedTagIds(data.tags.map((t:any)=>t.id));
      
      // Load featured image
      if (data.cover_asset_id) {
        setFeaturedImageId(data.cover_asset_id);
        if (data.cover_asset) {
          const imageUrl = data.cover_asset.medium_url || data.cover_asset.url;
          setFeaturedImage(getAssetUrl(imageUrl));
        }
      }

      // Load SEO data
      if (data.seo) {
        try {
          const seoData = typeof data.seo === 'string' ? JSON.parse(data.seo) : data.seo;
          console.log('[fetchPost] Loaded SEO data:', seoData);
          setSeo(seoData);
        } catch (e) {
          console.error('[fetchPost] Failed to parse SEO data:', e, 'Raw SEO:', data.seo);
          setSeo(null);
        }
      } else {
        console.log('[fetchPost] No SEO data found');
        setSeo(null);
      }
    }catch(err){
      console.error('Failed to load post:', err);
      toast.error('Không thể tải bài viết');
    }finally{ setLoading(false); }
  }

  // Debounced auto-generate slug unless manually edited
  useEffect(()=>{
    if (manualEdit || !title) return;
    const t = setTimeout(()=> setSlug(generateSlug(title)), 1200);
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
  }, [title, slug, excerpt, content, status, authorId, pubDate, readTime]);

  const handleSubmit = async () => {
    if (!title) { 
      toast.error('Tiêu đề là bắt buộc'); 
      return; 
    }
    setSaving(true);
    try{
      const body: any = {
        title,
        slug: slug || generateSlug(title),
        excerpt,
        content,
        status,
        published_at: status === 'published' ? (pubDate ? pubDate : new Date().toISOString()) : null,
        is_featured: isFeatured,
        topics: selectedTopicIds,
        tags: selectedTagIds,
        read_time: readTime?.trim() ? readTime.trim() : null,
        seo: seo, // Include SEO data
      };
      
      // Include author if changed
      body.author_id = authorId || null;
      
      // Include cover_asset_id (even if null to allow clearing)
      body.cover_asset_id = featuredImageId || null;
      
      console.log('[handleSubmit] Body:', body);
      console.log('[handleSubmit] SEO data being sent:', seo);
      
      const res = await fetch(buildApiUrl(`/api/posts/${id}`),{
        method:'PATCH',
        headers:{ 'Content-Type':'application/json' },
        credentials:'include',
        body: JSON.stringify(body),
      });
      
      if(!res.ok) {
        const json = await res.json().catch(()=>({ error: 'Failed to update post' }));
        throw new Error(json.message || json.error || 'Failed to update post');
      }
      
      toast.success('Cập nhật bài viết thành công!');
      router.push('/dashboard/posts');
    }catch(err){
      console.error('Failed to update post:', err);
      toast.error(err instanceof Error ? err.message : 'Không thể cập nhật bài viết');
    }finally{ 
      setSaving(false); 
    }
  }

  if(loading) return <div className='p-6 text-foreground'>Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Chỉnh sửa bài viết</h1>
          <p className="text-sm text-muted-foreground">Cập nhật chi tiết bài viết</p>
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
              onChange={(e) => setReadTime(e.target.value)}
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
              onChange={setContent}
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
                <input 
                  type="checkbox" 
                  checked={isFeatured} 
                  onChange={(e)=>setIsFeatured(e.target.checked)} 
                  className="rounded"
                />
                <span className="text-sm font-medium">Bài viết nổi bật</span>
              </label>
              <p className="text-xs text-muted-foreground mt-1">Hiển thị bài viết này trên trang chủ và các phần nổi bật</p>
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
                      }}
                    />
                    <span>{t.name}</span>
                  </label>
                ))}
              </div>
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
                      }}
                    />
                    <span>{t.name}</span>
                  </label>
                ))}
              </div>
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
          <button onClick={handleSubmit} disabled={saving} className="w-full rounded bg-blue-600 text-white px-3 py-2">{saving? 'Đang lưu...':'Lưu'}</button>
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
