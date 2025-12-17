'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import MediaPicker from '@/components/MediaPicker';
import RichTextEditor from '@/components/RichTextEditor';
import SEOPopup from '@/components/SEOPopup';
import { buildApiUrl } from '@/lib/api';
import { generateSlug } from '@/lib/slug';

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = !!params?.id;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    sku: '',
    price: '',
    compare_price: '',
    stock: '0',
    status: 'draft',
    category_id: '',
    brand_id: '',
    is_featured: false,
    is_best_seller: false
  });

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [thumbnailId, setThumbnailId] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<Array<{id?: string; name: string; value: string}>>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const originalSlugRef = useRef<string>('');
  const fetchAttemptedRef = useRef(false);
  const [formKey, setFormKey] = useState(0); // Force re-render key
  const [dataLoaded, setDataLoaded] = useState(false); // Track if data has been loaded
  const [seo, setSeo] = useState<any>(null);
  const [showSeoPopup, setShowSeoPopup] = useState(false);

  useEffect(() => {
    // Reset state when product ID changes
    if (isEdit && params.id) {
      setDataLoaded(false);
      setFormData({
        name: '',
        slug: '',
        description: '',
        sku: '',
        price: '',
        compare_price: '',
        stock: '0',
        status: 'draft',
        category_id: '',
        brand_id: '',
        is_featured: false,
        is_best_seller: false
      });
      setSelectedCategories([]);
      setThumbnailId('');
      setGalleryImages([]);
      setAttributes([]);
      fetchAttemptedRef.current = false;
    }
  }, [params.id, isEdit]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    if (isEdit && params.id && !fetchAttemptedRef.current) {
      fetchAttemptedRef.current = true;
      fetchProduct();
    } else if (!isEdit) {
      setDataLoaded(true); // For new products, mark as loaded immediately
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, isEdit]);

  const fetchCategories = async () => {
    try {
      const response: any = await axios.get(buildApiUrl('/api/product-categories'), {
        withCredentials: true
      });
      setCategories(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response: any = await axios.get(buildApiUrl('/api/brands'), {
        withCredentials: true
      });
      setBrands(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const fetchProduct = async (retryCount = 0) => {
    if (!params.id) {
      setError('Product ID is missing');
      return;
    }

    try {
      setLoadingProduct(true);
      setError(null);
      
      const response: any = await axios.get(buildApiUrl(`/api/products/${params.id}`), {
        withCredentials: true,
        timeout: 10000, // 10 second timeout
      });
      
      // Handle different response structures
      const product = response.data?.data || response.data;
      
      if (!product || !product.id) {
        throw new Error('Invalid product data received');
      }
      
      console.log('Loaded product data:', product);
      
      // Use a function to ensure state update happens correctly
      const productSlug = product.slug || '';
      const newFormData = {
        name: product.name || '',
        slug: productSlug,
        description: product.description || '',
        sku: product.sku || '',
        price: product.price !== undefined && product.price !== null ? Math.round(Number(product.price)).toString() : '',
        compare_price: product.compare_price !== undefined && product.compare_price !== null ? Math.round(Number(product.compare_price)).toString() : '',
        stock: product.stock !== undefined && product.stock !== null ? product.stock.toString() : '0',
        status: product.status || 'draft',
        category_id: product.category_id || '',
        brand_id: product.brand_id || '',
        is_featured: Boolean(product.is_featured),
        is_best_seller: Boolean(product.is_best_seller)
      };
      
      console.log('Setting form data:', newFormData);
      
      // Force state update by using functional setState and ensuring all fields are set
      setFormData(prev => {
        const updated = { ...newFormData };
        console.log('Form data updated, new values:', updated);
        return updated;
      });
      
      originalSlugRef.current = productSlug;
      setSlugManuallyEdited(false);
      
      // Mark data as loaded and force form re-render
      setDataLoaded(true);
      setTimeout(() => {
        setFormKey(prev => prev + 1);
        console.log('Form key updated to force re-render, dataLoaded:', true);
      }, 50);
      
      // Load selected categories from n-n relationship
      if (product.categories && Array.isArray(product.categories)) {
        const categoryIds = product.categories.map((cat: any) => cat.id);
        console.log('Setting categories:', categoryIds);
        setSelectedCategories(categoryIds);
      } else {
        setSelectedCategories([]);
      }
      
      // Load thumbnail
      if (product.thumbnail_id) {
        console.log('Setting thumbnail:', product.thumbnail_id);
        setThumbnailId(product.thumbnail_id);
      } else {
        setThumbnailId('');
      }
      
      // Load gallery images
      if (product.images && Array.isArray(product.images)) {
        // Backend returns images with asset_id field
        const imageIds = product.images.map((img: any) => {
          // Handle different possible structures
          if (img.asset_id) return img.asset_id;
          if (img.id) return img.id;
          if (typeof img === 'string') return img;
          return null;
        }).filter((id: any) => id !== null);
        console.log('Setting gallery images:', imageIds);
        setGalleryImages(imageIds);
      } else {
        setGalleryImages([]);
      }

      // Load attributes (thông số sản phẩm)
      if (product.attributes && Array.isArray(product.attributes)) {
        const attrs = product.attributes.map((attr: any) => ({
          id: attr.id,
          name: attr.name || '',
          value: attr.value || ''
        }));
        console.log('Setting attributes:', attrs);
        setAttributes(attrs);
      } else {
        setAttributes([]);
      }

      // Load SEO data
      if (product.seo) {
        try {
          const seoData = typeof product.seo === 'string' ? JSON.parse(product.seo) : product.seo;
          setSeo(seoData);
        } catch (e) {
          console.error('Failed to parse SEO data:', e);
          setSeo(null);
        }
      } else {
        setSeo(null);
      }
    } catch (error: any) {
      console.error('Failed to fetch product:', error);
      
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.message 
        || error.message 
        || 'Failed to load product data';
      
      setError(errorMessage);
      
      // Retry logic: retry up to 2 times with exponential backoff
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s
        console.log(`Retrying fetch product in ${delay}ms... (attempt ${retryCount + 1})`);
        setTimeout(() => {
          fetchProduct(retryCount + 1);
        }, delay);
      } else {
        alert(`Không thể tải sản phẩm: ${errorMessage}\n\nVui lòng làm mới trang hoặc thử lại sau.`);
      }
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        slug: formData.slug || null,
        description: formData.description || null,
        sku: formData.sku || null,
        price: Math.round(parseFloat(formData.price.replace(/,/g, '')) || 0), // Round to integer for VNĐ
        compare_price: formData.compare_price ? Math.round(parseFloat(formData.compare_price.replace(/,/g, ''))) : null,
        cost_price: null,
        stock: parseInt(formData.stock) || 0,
        status: formData.status,
        category_id: formData.category_id || null,
        brand_id: formData.brand_id || null,
        thumbnail_id: thumbnailId || null,
        is_featured: formData.is_featured,
        is_best_seller: formData.is_best_seller,
        categories: selectedCategories, // Add selected categories for n-n relationship
        images: galleryImages, // Add gallery images
        attributes: attributes.filter(attr => attr.name.trim() && attr.value.trim()), // Add attributes (thông số sản phẩm)
        seo: seo // Add SEO data
      };

      if (isEdit) {
        await axios.put(buildApiUrl(`/api/products/${params.id}`), data, {
          withCredentials: true
        });
      } else {
        await axios.post(buildApiUrl('/api/products'), data, {
          withCredentials: true
        });
      }

      router.push('/dashboard/products');
    } catch (error: any) {
      console.error('Failed to save product:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Không thể lưu sản phẩm';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAddAttribute = () => {
    setAttributes(prev => [...prev, { name: '', value: '' }]);
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== index));
  };

  const handleAttributeChange = (index: number, field: 'name' | 'value', value: string) => {
    setAttributes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Cập nhật chi tiết sản phẩm' : 'Thêm sản phẩm mới vào catalog của bạn'}
          </p>
        </div>
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-500 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-400">
            <strong>Lỗi khi tải sản phẩm:</strong> {error}
          </p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              fetchAttemptedRef.current = false;
              fetchProduct();
            }}
            className="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading State */}
      {loadingProduct && (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-2" />
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu sản phẩm...</p>
        </div>
      )}

      {/* Form - Only show when data is loaded (or it's a new product) */}
      {!loadingProduct && (isEdit ? dataLoaded : true) && (
      <form key={`form-${formKey}-${dataLoaded}`} onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Thông tin cơ bản</h3>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tên sản phẩm *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => {
                  const newName = e.target.value;
                  setFormData((prev) => {
                    // Auto-generate slug if not manually edited
                    const newSlug = !slugManuallyEdited && newName
                      ? generateSlug(newName)
                      : prev.slug;
                    return { ...prev, name: newName, slug: newSlug };
                  });
                }}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Slug
              </label>
              <input
                type="text"
                key={`slug-${params.id || 'new'}-${formKey}-${dataLoaded}`}
                value={formData.slug || ''}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, slug: e.target.value }));
                  setSlugManuallyEdited(true);
                }}
                onBlur={() => {
                  // If slug is empty, auto-generate from name
                  if (!formData.slug && formData.name) {
                    setFormData((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
                    setSlugManuallyEdited(false);
                  }
                }}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={formData.name ? generateSlug(formData.name) : "tự-động-tạo-từ-tên"}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Phiên bản thân thiện với URL của tên. Tự động tạo nếu để trống.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mô tả
              </label>
              <RichTextEditor
                key={`editor-${params.id || 'new'}`}
                value={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
                placeholder="Nhập mô tả sản phẩm..."
              />
            </div>
          </div>

          {/* Media */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-medium text-card-foreground mb-4">Media</h3>
            
            <div className="flex gap-6">
              {/* Left: Thumbnail */}
              <div className="flex-shrink-0">
                <MediaPicker
                  label="Hình đại diện (Hình chính)"
                  value={thumbnailId}
                  onChange={(value) => setThumbnailId(value as string)}
                  multiple={false}
                  previewSize={200}
                />
              </div>

              {/* Right: Gallery */}
              <div className="flex-1">
                <MediaPicker
                  label="Hình ảnh thư viện"
                  value={galleryImages}
                  onChange={(value) => setGalleryImages(value as string[])}
                  multiple={true}
                  maxFiles={10}
                  previewSize={100}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Giá & Kho hàng</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Giá *
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  key={`price-${params.id || 'new'}-${formKey}-${dataLoaded}`}
                  value={formData.price ? formData.price.replace(/[.,]/g, '') : ''}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Remove commas (vi-VN locale uses comma as decimal separator)
                    value = value.replace(/,/g, '');
                    // Only allow integers (no decimals for VNĐ)
                    if (value.includes('.')) {
                      value = Math.floor(parseFloat(value)).toString();
                    }
                    // Remove any non-numeric characters except empty string
                    if (value && !/^\d+$/.test(value)) {
                      value = value.replace(/\D/g, '');
                    }
                    setFormData((prev) => ({ ...prev, price: value }));
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Nhập giá (VNĐ, không có số thập phân)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Giá so sánh (Giá gốc)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  key={`compare_price-${params.id || 'new'}-${formKey}-${dataLoaded}`}
                  value={formData.compare_price ? formData.compare_price.replace(/[.,]/g, '') : ''}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Remove commas (vi-VN locale uses comma as decimal separator)
                    value = value.replace(/,/g, '');
                    // Only allow integers (no decimals for VNĐ)
                    if (value.includes('.')) {
                      value = Math.floor(parseFloat(value)).toString();
                    }
                    // Remove any non-numeric characters except empty string
                    if (value && !/^\d+$/.test(value)) {
                      value = value.replace(/\D/g, '');
                    }
                    setFormData((prev) => ({ ...prev, compare_price: value }));
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Giá so sánh (Giá gốc, VNĐ, không có số thập phân)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  key={`sku-${params.id || 'new'}-${formKey}-${dataLoaded}`}
                  value={formData.sku || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Stock
                </label>
                <input
                  type="number"
                  key={`stock-${params.id || 'new'}-${formKey}-${dataLoaded}`}
                  value={formData.stock || '0'}
                  onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Trạng thái</h3>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="draft">Bản nháp</option>
              <option value="published">Đã xuất bản</option>
              <option value="archived">Đã lưu trữ</option>
            </select>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">
                Tiếp thị
              </label>

              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0"
                />
                Sản phẩm nổi bật
              </label>

              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={formData.is_best_seller}
                  onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0"
                />
                Bán chạy nhất
              </label>
            </div>
          </div>

          {/* Product Attributes (Thông số sản phẩm) */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-card-foreground">Thông số sản phẩm</h3>
              <button
                type="button"
                onClick={handleAddAttribute}
                className="text-sm text-primary hover:underline"
              >
                + Thêm thông số
              </button>
            </div>
            
            {attributes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có thông số nào. Click "+ Thêm thông số" để thêm.</p>
            ) : (
              <div className="space-y-3">
                {attributes.map((attr, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Tên (VD: Tấm nền)"
                        value={attr.name}
                        onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <input
                        type="text"
                        placeholder="Giá trị (VD: IPS)"
                        value={attr.value}
                        onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(index)}
                      className="px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Thông số này sẽ hiển thị trên trang chi tiết sản phẩm trong phần "Thông số sản phẩm"
            </p>
          </div>

          {/* Organization */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Tổ chức</h3>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Danh mục
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-input rounded-lg bg-background">
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground px-2 py-1">Không có danh mục nào</p>
                ) : (
                  categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 px-2 py-1 hover:bg-accent rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.id)}
                        onChange={() => handleCategoryToggle(cat.id)}
                        className="rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0"
                      />
                      <span className="text-sm text-foreground">{cat.name}</span>
                    </label>
                  ))
                )}
              </div>
              {selectedCategories.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Đã chọn {selectedCategories.length} {selectedCategories.length === 1 ? 'danh mục' : 'danh mục'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Thương hiệu
              </label>
              <select
                value={formData.brand_id}
                onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Không có thương hiệu</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-card-foreground">SEO</h3>
              <button
                type="button"
                onClick={() => setShowSeoPopup(true)}
                className="text-sm text-primary hover:underline"
              >
                {seo ? 'Chỉnh sửa SEO' : 'Thiết lập SEO'}
              </button>
            </div>
            {seo ? (
              <div className="space-y-2 text-sm">
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
              <p className="text-sm text-muted-foreground">Chưa có cấu hình SEO. Click "Thiết lập SEO" để thêm.</p>
            )}
          </div>

          {/* Actions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
            </button>
          </div>
        </div>
      </form>
      )}

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
