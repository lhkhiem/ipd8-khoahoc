'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import MediaPicker from './MediaPicker';
import { getAssetUrl } from '@/lib/api';

interface SEOData {
  title?: string;
  description?: string;
  og_image?: string;
  keywords?: string[];
}

interface SEOPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (seo: SEOData) => void;
  initialData?: SEOData | null;
}

export default function SEOPopup({ isOpen, onClose, onSave, initialData }: SEOPopupProps) {
  const [seo, setSeo] = useState<SEOData>({
    title: '',
    description: '',
    og_image: '',
    keywords: []
  });
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSeo(initialData || {
        title: '',
        description: '',
        og_image: '',
        keywords: []
      });
      setKeywordInput('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(seo);
    onClose();
  };

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !seo.keywords?.includes(trimmed)) {
      setSeo(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), trimmed]
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setSeo(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword) || []
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg border border-border shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Cấu hình SEO</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tiêu đề SEO *
            </label>
            <input
              type="text"
              value={seo.title || ''}
              onChange={(e) => setSeo(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Tiêu đề hiển thị trên kết quả tìm kiếm"
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={120}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {seo.title?.length || 0}/120 ký tự. Khuyến nghị: 50-70 ký tự
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Mô tả SEO
            </label>
            <textarea
              rows={3}
              value={seo.description || ''}
              onChange={(e) => setSeo(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả hiển thị trên kết quả tìm kiếm và khi chia sẻ"
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {seo.description?.length || 0}/160 ký tự. Khuyến nghị: 120-160 ký tự
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              OG Image (Ảnh chia sẻ)
            </label>
            <div className="flex items-center gap-4">
              {seo.og_image && (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getAssetUrl(seo.og_image)}
                    alt="OG Image"
                    className="w-32 h-20 object-cover rounded border border-border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="80"%3E%3Crect width="128" height="80" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
                >
                  {seo.og_image ? 'Đổi ảnh' : 'Chọn ảnh'}
                </button>
                {seo.og_image && (
                  <button
                    type="button"
                    onClick={() => setSeo(prev => ({ ...prev, og_image: '' }))}
                    className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm hover:bg-destructive/90"
                  >
                    Xóa ảnh
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ảnh hiển thị khi chia sẻ lên mạng xã hội (khuyến nghị: 1200x630px)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Từ khóa
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập từ khóa và nhấn Enter"
                className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm hover:bg-muted/80"
              >
                Thêm
              </button>
            </div>
            {seo.keywords && seo.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {seo.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded text-sm"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-background border-t border-border p-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm hover:bg-muted/80"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!seo.title?.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lưu
          </button>
        </div>

        {showMediaPicker && (
          <MediaPicker
            isOpen={showMediaPicker}
            onClose={() => setShowMediaPicker(false)}
            onSelect={(assetOrUrl) => {
              if (typeof assetOrUrl === 'object' && assetOrUrl !== null) {
                interface AssetType {
                  url?: string;
                  cdn_url?: string;
                  original_url?: string;
                  sizes?: {
                    medium?: { url?: string };
                    large?: { url?: string };
                  };
                }
                const asset = assetOrUrl as AssetType;
                const assetUrl = asset.url || asset.cdn_url || asset.original_url || asset.sizes?.medium?.url || asset.sizes?.large?.url || '';
                let relativePath = assetUrl;
                if (assetUrl.startsWith('http://') || assetUrl.startsWith('https://')) {
                  try {
                    const urlObj = new URL(assetUrl);
                    relativePath = urlObj.pathname;
                  } catch {
                    relativePath = assetUrl;
                  }
                }
                setSeo(prev => ({ ...prev, og_image: relativePath || assetUrl }));
              } else {
                const url = assetOrUrl as string;
                const relativePath = url.startsWith('http') ? new URL(url).pathname : url;
                setSeo(prev => ({ ...prev, og_image: relativePath || url }));
              }
              setShowMediaPicker(false);
            }}
            multiple={false}
          />
        )}
      </div>
    </div>
  );
}

