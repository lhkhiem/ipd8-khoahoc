'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl, buildBackendUrl, getAssetUrl } from '@/lib/api';
import MediaPicker from '@/components/MediaPicker';
import { generateSlug } from '@/lib/slug';
import { Image as ImageIcon, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';

export default function NewEducationResourcePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [manualEdit, setManualEdit] = useState(false);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('Learn More');
  const [duration, setDuration] = useState('');
  const [ceus, setCeus] = useState('');
  const [level, setLevel] = useState('');
  const [resourceType, setResourceType] = useState<'course' | 'article' | 'video'>('course');
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [allTopics, setAllTopics] = useState<Array<{id: string; name: string}>>([]);
  const [allTags, setAllTags] = useState<Array<{id: string; name: string}>>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Auto-generate slug from title
  useEffect(() => {
    if (manualEdit || !title) return;
    const timer = setTimeout(() => {
      setSlug(generateSlug(title));
    }, 1200);
    return () => clearTimeout(timer);
  }, [title, manualEdit]);

  // Fetch topics and tags
  useEffect(() => {
    Promise.all([
      fetch(buildApiUrl('/api/topics'), { credentials: 'include' }).then(r => r.json()).catch(() => []),
      fetch(buildApiUrl('/api/tags'), { credentials: 'include' }).then(r => r.json()).catch(() => []),
    ]).then(([topics, tags]) => {
      setAllTopics(Array.isArray(topics) ? topics : []);
      setAllTags(Array.isArray(tags) ? tags : []);
    }).catch((e) => {
      console.error('Failed to fetch topics/tags', e);
    });
  }, []);

  const slugPreview = useMemo(() => `/education/${slug || generateSlug(title)}`, [slug, title]);

  const handleSelectImage = async (value: string | string[]) => {
    const assetId = Array.isArray(value) ? value[0] : value;
    setSelectedAssetId(assetId || '');
    
    if (assetId) {
      try {
        const response = await fetch(buildApiUrl(`/api/assets/${assetId}`), {
          credentials: 'include'
        });
        if (response.ok) {
          const asset = await response.json();
          // Get relative path from asset (backend will normalize it)
          const assetUrl = asset.sizes?.medium?.url || asset.url || '';
          // For display, use full URL
          const displayUrl = getAssetUrl(assetUrl);
          // For saving, use relative path (backend will normalize if needed)
          const relativePath = assetUrl?.startsWith('http') 
            ? new URL(assetUrl).pathname 
            : assetUrl;
          
          setImageUrl(displayUrl);
          setImageUrlInput(relativePath || displayUrl);
        }
      } catch (error) {
        console.error('Failed to fetch asset:', error);
      }
    } else {
      setImageUrl('');
      setImageUrlInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error('Title is required');
      return;
    }
    
    if (!imageUrlInput && !imageUrl) {
      toast.error('Image URL is required');
      return;
    }
    
    // link_url is optional - will be auto-generated from slug if not provided

    setSaving(true);
    try {
      const body: any = {
        title,
        slug: slug || generateSlug(title),
        description: description || null,
        image_url: imageUrlInput || imageUrl,
        link_url: linkUrl || undefined, // Will be auto-generated from slug if not provided
        link_text: linkText || 'Learn More',
        duration: duration || null,
        ceus: ceus || null,
        level: level || null,
        resource_type: resourceType,
        is_featured: isFeatured,
        sort_order: sortOrder,
        is_active: isActive,
      };

      // Always include topics and tags, even if empty array
      if (selectedTopicIds.length > 0) {
        body.topics = selectedTopicIds;
      }
      if (selectedTagIds.length > 0) {
        body.tags = selectedTagIds;
      }

      console.log('Submitting body:', JSON.stringify(body, null, 2));

      const response = await fetch(buildApiUrl('/api/homepage/education-resources'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const json = await response.json().catch(() => ({ error: 'Failed to create resource' }));
        throw new Error(json.message || json.error || 'Failed to create resource');
      }

      toast.success('Education resource created successfully!');
      router.push('/dashboard/education-resources');
    } catch (error) {
      console.error('Failed to create resource:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create resource');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create Education Resource</h1>
        <Link
          href="/dashboard/education-resources"
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Slug *
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  (URL: {slugPreview})
                </span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setManualEdit(true);
                }}
                onBlur={() => {
                  if (!slug && title) {
                    setSlug(generateSlug(title));
                    setManualEdit(false);
                  }
                }}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder={generateSlug(title) || 'auto-generated-from-title'}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL-friendly version of the title. Auto-generated if left empty.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter a brief description of the resource..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image *</label>
              <div className="space-y-2">
                {imageUrl ? (
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setImageUrlInput('');
                        setSelectedAssetId('');
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
                    className="w-full h-48 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-sm">Choose from Media Library</span>
                  </button>
                )}
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="w-full text-sm text-primary hover:underline"
                  >
                    Change Image
                  </button>
                )}
                <div className="text-xs text-muted-foreground">Or enter image URL manually:</div>
                <input
                  type="text"
                  value={imageUrlInput}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    if (e.target.value) {
                      setImageUrl(e.target.value);
                    }
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Link URL
                <span className="ml-2 text-xs text-muted-foreground font-normal">
                  (Optional - auto-generated from slug if empty)
                </span>
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder={slug ? `/education/${slug}` : '/education/auto-generated-slug'}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to auto-generate from slug, or enter custom URL (internal or external)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Link Text</label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Learn More"
              />
            </div>
          </div>

          {/* Resource Details */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Resource Details</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Resource Type *</label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as 'course' | 'article' | 'video')}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="course">Course</option>
                <option value="video">Video</option>
                <option value="article">Article</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. 2 hours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">CEUs</label>
                <input
                  type="text"
                  value={ceus}
                  onChange={(e) => setCeus(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. 2 CEUs"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Settings</h3>
            
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/50"
                />
                <span className="text-sm font-medium">Featured</span>
              </label>
              <p className="text-xs text-muted-foreground mt-1">Show on homepage</p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/50"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
              <p className="text-xs text-muted-foreground mt-1">Make resource visible</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">Lower numbers appear first</p>
            </div>

            {/* Topics */}
            <div>
              <label className="block text-sm font-medium mb-1">Topics</label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-auto rounded-lg border border-input p-2">
                {allTopics.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No topics available</p>
                ) : (
                  allTopics.map(t => (
                    <label key={t.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded">
                      <input
                        type="checkbox"
                        className="rounded border-input text-primary focus:ring-2 focus:ring-primary/50"
                        checked={selectedTopicIds.includes(t.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTopicIds([...selectedTopicIds, t.id]);
                          } else {
                            setSelectedTopicIds(selectedTopicIds.filter(id => id !== t.id));
                          }
                        }}
                      />
                      <span>{t.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium mb-1">Tags</label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-auto rounded-lg border border-input p-2">
                {allTags.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No tags available</p>
                ) : (
                  allTags.map(t => (
                    <label key={t.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded">
                      <input
                        type="checkbox"
                        className="rounded border-input text-primary focus:ring-2 focus:ring-primary/50"
                        checked={selectedTagIds.includes(t.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTagIds([...selectedTagIds, t.id]);
                          } else {
                            setSelectedTagIds(selectedTagIds.filter(id => id !== t.id));
                          }
                        }}
                      />
                      <span>{t.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Resource'}
          </button>
        </div>
      </form>

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        value={selectedAssetId}
        onChange={handleSelectImage}
        modalOnly
      />
    </div>
  );
}

