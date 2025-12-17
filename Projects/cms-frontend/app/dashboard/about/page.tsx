'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Image as ImageIcon } from 'lucide-react';
import MediaPicker from '@/components/MediaPicker';
import RichTextEditor from '@/components/RichTextEditor';
import axios from 'axios';
import { getAssetUrl, buildApiUrl } from '@/lib/api';

interface AboutSection {
  id: string;
  section_key: string;
  title?: string | null;
  content?: string | null;
  image_url?: string | null;
  button_text?: string | null;
  button_link?: string | null;
  list_items?: Array<{ 
    title?: string; 
    description?: string;
    icon_type?: string;
    icon_color?: string;
    year?: string;
  }> | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AboutPage() {
  const [welcomeSection, setWelcomeSection] = useState<AboutSection | null>(null);
  const [givingBackSection, setGivingBackSection] = useState<AboutSection | null>(null);
  const [differencesSection, setDifferencesSection] = useState<AboutSection | null>(null);
  const [timelineSection, setTimelineSection] = useState<AboutSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState<string | null>(null);
  const creatingSectionsRef = useRef(false);

  // Form states
  const [welcomeForm, setWelcomeForm] = useState({
    title: '',
    content: '',
    image_url: '',
    button_text: '',
    button_link: '',
  });

  const [givingBackForm, setGivingBackForm] = useState({
    title: '',
    content: '',
    image_url: '',
    list_items: [] as Array<{ title: string; description: string }>,
  });

  const [differencesForm, setDifferencesForm] = useState({
    title: '',
    content: '',
    list_items: [] as Array<{ icon_type: string; icon_color: string; title: string; description: string }>,
  });

  const [timelineForm, setTimelineForm] = useState({
    title: '',
    content: '',
    list_items: [] as Array<{ year: string; description: string }>,
  });

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ data: AboutSection[] }>(buildApiUrl('/api/about-sections'), {
        withCredentials: true,
      });
      const sections = response.data?.data || [];
      
      let welcome = sections.find(s => s.section_key === 'welcome');
      let givingBack = sections.find(s => s.section_key === 'giving_back');
      let differences = sections.find(s => s.section_key === 'differences');
      let timeline = sections.find(s => s.section_key === 'timeline');

      // Create missing sections if they don't exist
      if (!welcome && !creatingSectionsRef.current) {
        creatingSectionsRef.current = true;
        try {
          const createRes = await axios.post(
            buildApiUrl('/api/about-sections'),
            {
              section_key: 'welcome',
              title: 'Chào mừng các chuyên gia Spa!',
              content: '',
              image_url: '',
              button_text: '',
              button_link: '',
              order_index: 1,
              is_active: true,
            },
            { withCredentials: true }
          );
          welcome = createRes.data;
        } catch (err: any) {
          if (err.response?.status !== 400) {
            console.error('Failed to create welcome section:', err);
          }
        } finally {
          creatingSectionsRef.current = false;
        }
      }

      if (!givingBack && !creatingSectionsRef.current) {
        creatingSectionsRef.current = true;
        try {
          const createRes = await axios.post(
            buildApiUrl('/api/about-sections'),
            {
              section_key: 'giving_back',
              title: 'Giá trị cộng đồng',
              content: '',
              image_url: '',
              list_items: [],
              order_index: 2,
              is_active: true,
            },
            { withCredentials: true }
          );
          givingBack = createRes.data;
        } catch (err: any) {
          if (err.response?.status !== 400) {
            console.error('Failed to create giving_back section:', err);
          }
        } finally {
          creatingSectionsRef.current = false;
        }
      }

      if (welcome) {
        setWelcomeSection(welcome);
        setWelcomeForm({
          title: welcome.title || '',
          content: welcome.content || '',
          image_url: welcome.image_url || '',
          button_text: welcome.button_text || '',
          button_link: welcome.button_link || '',
        });
      }

      if (givingBack) {
        setGivingBackSection(givingBack);
        setGivingBackForm({
          title: givingBack.title || '',
          content: givingBack.content || '',
          image_url: givingBack.image_url || '',
          list_items: givingBack.list_items || [],
        });
      }

      if (differences) {
        setDifferencesSection(differences);
        setDifferencesForm({
          title: differences.title || '',
          content: differences.content || '',
          list_items: differences.list_items || [],
        });
      }

      if (timeline) {
        setTimelineSection(timeline);
        setTimelineForm({
          title: timeline.title || '',
          content: timeline.content || '',
          list_items: timeline.list_items || [],
        });
      }
    } catch (error: any) {
      console.error('[fetchSections] Error:', error);
      alert('Failed to load about sections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleSaveWelcome = async () => {
    if (!welcomeSection) return;
    
    try {
      setSaving('welcome');
      await axios.put(
        buildApiUrl(`/api/about-sections/${welcomeSection.id}`),
        {
          title: welcomeForm.title,
          content: welcomeForm.content,
          image_url: welcomeForm.image_url,
          button_text: welcomeForm.button_text,
          button_link: welcomeForm.button_link,
        },
        { withCredentials: true }
      );
      alert('Đã lưu phần Chào mừng thành công!');
      fetchSections();
    } catch (error: any) {
      console.error('[handleSaveWelcome] Error:', error);
      alert(error.response?.data?.error || 'Không thể lưu phần Chào mừng');
    } finally {
      setSaving(null);
    }
  };

  const handleSaveGivingBack = async () => {
    if (!givingBackSection) return;
    
    try {
      setSaving('giving_back');
      await axios.put(
        buildApiUrl(`/api/about-sections/${givingBackSection.id}`),
        {
          title: givingBackForm.title,
          content: givingBackForm.content,
          image_url: givingBackForm.image_url,
          list_items: givingBackForm.list_items,
        },
        { withCredentials: true }
      );
      alert('Đã lưu phần Giá trị cộng đồng thành công!');
      fetchSections();
    } catch (error: any) {
      console.error('[handleSaveGivingBack] Error:', error);
      alert(error.response?.data?.error || 'Không thể lưu phần Giá trị cộng đồng');
    } finally {
      setSaving(null);
    }
  };

  const handleAddListItem = () => {
    setGivingBackForm({
      ...givingBackForm,
      list_items: [...givingBackForm.list_items, { title: '', description: '' }],
    });
  };

  const handleUpdateListItem = (index: number, field: 'title' | 'description', value: string) => {
    const newItems = [...givingBackForm.list_items];
    newItems[index] = { ...newItems[index], [field]: value };
    setGivingBackForm({ ...givingBackForm, list_items: newItems });
  };

  const handleRemoveListItem = (index: number) => {
    const newItems = givingBackForm.list_items.filter((_, i) => i !== index);
    setGivingBackForm({ ...givingBackForm, list_items: newItems });
  };

  const handleSelectImage = (assetId: string | string[]) => {
    const id = Array.isArray(assetId) ? assetId[0] : assetId;
    if (showMediaPicker === 'welcome') {
      // Get asset URL from media picker
      // For now, we'll need to fetch the asset to get its URL
      axios.get(buildApiUrl(`/api/assets/${id}`), { withCredentials: true })
        .then(res => {
          const asset = res.data;
          const url = asset.cdn_url || asset.url || '';
          setWelcomeForm({ ...welcomeForm, image_url: url });
        })
        .catch(err => console.error('Failed to fetch asset:', err));
    } else if (showMediaPicker === 'giving_back') {
      axios.get(buildApiUrl(`/api/assets/${id}`), { withCredentials: true })
        .then(res => {
          const asset = res.data;
          const url = asset.cdn_url || asset.url || '';
          setGivingBackForm({ ...givingBackForm, image_url: url });
        })
        .catch(err => console.error('Failed to fetch asset:', err));
    }
    setShowMediaPicker(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý trang Giới thiệu</h1>
        <p className="text-sm text-muted-foreground">Quản lý các phần của trang Giới thiệu</p>
      </div>

      {/* Welcome Section */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Phần Chào mừng</h2>
          <button
            onClick={handleSaveWelcome}
            disabled={saving === 'welcome'}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving === 'welcome' ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Tiêu đề</label>
            <input
              type="text"
              className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2"
              value={welcomeForm.title}
              onChange={(e) => setWelcomeForm({ ...welcomeForm, title: e.target.value })}
              placeholder="Tiêu đề phần"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Nội dung</label>
            <div className="w-full" style={{ minWidth: 0, overflow: 'visible' }}>
              <RichTextEditor
                key="welcome-editor"
                id="welcome-content-editor"
                value={welcomeForm.content || ''}
                onChange={(content) => setWelcomeForm({ ...welcomeForm, content })}
                placeholder="Enter section content..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Hình ảnh</label>
            {welcomeForm.image_url ? (
              <div className="relative group mb-2">
                <img
                  src={getAssetUrl(welcomeForm.image_url)}
                  alt="Preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => setWelcomeForm({ ...welcomeForm, image_url: '' })}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowMediaPicker('welcome')}
                className="w-full max-w-md h-48 rounded-lg border-2 border-dashed border-input hover:border-primary hover:bg-accent transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
              >
                <ImageIcon className="h-8 w-8" />
                <span className="text-sm">Chọn từ Thư viện Media</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Văn bản nút</label>
              <input
                type="text"
                className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2"
                value={welcomeForm.button_text}
                onChange={(e) => setWelcomeForm({ ...welcomeForm, button_text: e.target.value })}
                placeholder="Ví dụ: Tìm hiểu thêm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Liên kết nút</label>
              <input
                type="text"
                className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2"
                value={welcomeForm.button_link}
                onChange={(e) => setWelcomeForm({ ...welcomeForm, button_link: e.target.value })}
                placeholder="/products hoặc #"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Giving Back Section */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Phần Giá trị cộng đồng</h2>
          <button
            onClick={handleSaveGivingBack}
            disabled={saving === 'giving_back'}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving === 'giving_back' ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Tiêu đề</label>
            <input
              type="text"
              className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2"
              value={givingBackForm.title}
              onChange={(e) => setGivingBackForm({ ...givingBackForm, title: e.target.value })}
              placeholder="Tiêu đề phần"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Nội dung</label>
            <div className="w-full" style={{ minWidth: 0, overflow: 'visible' }}>
              <RichTextEditor
                key="giving-back-editor"
                id="giving-back-content-editor"
                value={givingBackForm.content || ''}
                onChange={(content) => setGivingBackForm({ ...givingBackForm, content })}
                placeholder="Enter section content..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Hình ảnh</label>
            {givingBackForm.image_url ? (
              <div className="relative group mb-2">
                <img
                  src={getAssetUrl(givingBackForm.image_url)}
                  alt="Preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => setGivingBackForm({ ...givingBackForm, image_url: '' })}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowMediaPicker('giving_back')}
                className="w-full max-w-md h-48 rounded-lg border-2 border-dashed border-input hover:border-primary hover:bg-accent transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
              >
                <ImageIcon className="h-8 w-8" />
                <span className="text-sm">Chọn từ Thư viện Media</span>
              </button>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">Mục danh sách</label>
              <button
                type="button"
                onClick={handleAddListItem}
                className="text-sm text-primary hover:underline"
              >
                + Thêm mục
              </button>
            </div>
            <div className="space-y-3">
              {givingBackForm.list_items.map((item, index) => (
                <div key={index} className="flex gap-2 p-3 border border-input rounded-lg">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm"
                      value={item.title}
                      onChange={(e) => handleUpdateListItem(index, 'title', e.target.value)}
                      placeholder="Tiêu đề mục"
                    />
                    <textarea
                      className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm"
                      value={item.description}
                      onChange={(e) => handleUpdateListItem(index, 'description', e.target.value)}
                      placeholder="Mô tả mục"
                      rows={2}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveListItem(index)}
                    className="px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md"
                  >
                    Xóa
                  </button>
                </div>
              ))}
              {givingBackForm.list_items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Chưa có mục nào. Nhấp "Thêm mục" để thêm.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Differences Section */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Phần Điều làm chúng tôi khác biệt</h2>
          <button
            onClick={async () => {
              if (!differencesSection) return;
              try {
                setSaving('differences');
                await axios.put(
                  buildApiUrl(`/api/about-sections/${differencesSection.id}`),
                  {
                    title: differencesForm.title,
                    content: differencesForm.content,
                    list_items: differencesForm.list_items,
                  },
                  { withCredentials: true }
                );
                alert('Đã lưu phần Điều làm chúng tôi khác biệt thành công!');
                fetchSections();
              } catch (error: any) {
                console.error('[handleSaveDifferences] Error:', error);
                alert(error.response?.data?.error || 'Không thể lưu phần Điều làm chúng tôi khác biệt');
              } finally {
                setSaving(null);
              }
            }}
            disabled={saving === 'differences'}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving === 'differences' ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Tiêu đề</label>
            <input
              type="text"
              className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2"
              value={differencesForm.title}
              onChange={(e) => setDifferencesForm({ ...differencesForm, title: e.target.value })}
              placeholder="Tiêu đề phần"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Nội dung giới thiệu</label>
            <textarea
              className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2"
              value={differencesForm.content}
              onChange={(e) => setDifferencesForm({ ...differencesForm, content: e.target.value })}
              placeholder="Mô tả ngắn gọn về phần này"
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">Các điểm khác biệt</label>
              <button
                type="button"
                onClick={() => {
                  setDifferencesForm({
                    ...differencesForm,
                    list_items: [...differencesForm.list_items, { icon_type: 'shield', icon_color: 'purple', title: '', description: '' }],
                  });
                }}
                className="text-sm text-primary hover:underline"
              >
                + Thêm điểm
              </button>
            </div>
            <div className="space-y-3">
              {differencesForm.list_items.map((item, index) => (
                <div key={index} className="flex gap-2 p-3 border border-input rounded-lg">
                  <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm"
                        value={item.icon_type || 'shield'}
                        onChange={(e) => {
                          const newItems = [...differencesForm.list_items];
                          newItems[index] = { ...newItems[index], icon_type: e.target.value };
                          setDifferencesForm({ ...differencesForm, list_items: newItems });
                        }}
                      >
                        <option value="shield">Shield</option>
                        <option value="document">Document</option>
                        <option value="book">Book</option>
                        <option value="users">Users</option>
                      </select>
                      <select
                        className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm"
                        value={item.icon_color || 'purple'}
                        onChange={(e) => {
                          const newItems = [...differencesForm.list_items];
                          newItems[index] = { ...newItems[index], icon_color: e.target.value };
                          setDifferencesForm({ ...differencesForm, list_items: newItems });
                        }}
                      >
                        <option value="purple">Purple</option>
                        <option value="green">Green</option>
                        <option value="blue">Blue</option>
                        <option value="pink">Pink</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm"
                      value={item.title || ''}
                      onChange={(e) => {
                        const newItems = [...differencesForm.list_items];
                        newItems[index] = { ...newItems[index], title: e.target.value };
                        setDifferencesForm({ ...differencesForm, list_items: newItems });
                      }}
                      placeholder="Tiêu đề điểm khác biệt"
                    />
                    <textarea
                      className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm"
                      value={item.description || ''}
                      onChange={(e) => {
                        const newItems = [...differencesForm.list_items];
                        newItems[index] = { ...newItems[index], description: e.target.value };
                        setDifferencesForm({ ...differencesForm, list_items: newItems });
                      }}
                      placeholder="Mô tả điểm khác biệt"
                      rows={3}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = differencesForm.list_items.filter((_, i) => i !== index);
                      setDifferencesForm({ ...differencesForm, list_items: newItems });
                    }}
                    className="px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md"
                  >
                    Xóa
                  </button>
                </div>
              ))}
              {differencesForm.list_items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Chưa có điểm nào. Nhấp "Thêm điểm" để thêm.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Phần Hành trình phát triển</h2>
          <button
            onClick={async () => {
              if (!timelineSection) return;
              try {
                setSaving('timeline');
                await axios.put(
                  buildApiUrl(`/api/about-sections/${timelineSection.id}`),
                  {
                    title: timelineForm.title,
                    content: timelineForm.content,
                    list_items: timelineForm.list_items,
                  },
                  { withCredentials: true }
                );
                alert('Đã lưu phần Hành trình phát triển thành công!');
                fetchSections();
              } catch (error: any) {
                console.error('[handleSaveTimeline] Error:', error);
                alert(error.response?.data?.error || 'Không thể lưu phần Hành trình phát triển');
              } finally {
                setSaving(null);
              }
            }}
            disabled={saving === 'timeline'}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving === 'timeline' ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Tiêu đề</label>
            <input
              type="text"
              className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2"
              value={timelineForm.title}
              onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })}
              placeholder="Tiêu đề phần"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Nội dung giới thiệu</label>
            <textarea
              className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2"
              value={timelineForm.content}
              onChange={(e) => setTimelineForm({ ...timelineForm, content: e.target.value })}
              placeholder="Mô tả ngắn gọn về phần này"
              rows={3}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">Các mốc thời gian</label>
              <button
                type="button"
                onClick={() => {
                  setTimelineForm({
                    ...timelineForm,
                    list_items: [...timelineForm.list_items, { year: '', description: '' }],
                  });
                }}
                className="text-sm text-primary hover:underline"
              >
                + Thêm mốc
              </button>
            </div>
            <div className="space-y-3">
              {timelineForm.list_items.map((item, index) => (
                <div key={index} className="flex gap-2 p-3 border border-input rounded-lg">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm"
                      value={item.year || ''}
                      onChange={(e) => {
                        const newItems = [...timelineForm.list_items];
                        newItems[index] = { ...newItems[index], year: e.target.value };
                        setTimelineForm({ ...timelineForm, list_items: newItems });
                      }}
                      placeholder="Năm hoặc mốc thời gian (ví dụ: 1982, Hiện tại)"
                    />
                    <textarea
                      className="w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm"
                      value={item.description || ''}
                      onChange={(e) => {
                        const newItems = [...timelineForm.list_items];
                        newItems[index] = { ...newItems[index], description: e.target.value };
                        setTimelineForm({ ...timelineForm, list_items: newItems });
                      }}
                      placeholder="Mô tả sự kiện tại mốc thời gian này"
                      rows={3}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = timelineForm.list_items.filter((_, i) => i !== index);
                      setTimelineForm({ ...timelineForm, list_items: newItems });
                    }}
                    className="px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md"
                  >
                    Xóa
                  </button>
                </div>
              ))}
              {timelineForm.list_items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Chưa có mốc nào. Nhấp "Thêm mốc" để thêm.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <MediaPicker
          value=""
          onChange={handleSelectImage}
          isOpen={!!showMediaPicker}
          onClose={() => setShowMediaPicker(null)}
        />
      )}
    </div>
  );
}
