'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Plus, Search, Download, Upload, Edit, Trash2, Package, Copy } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { buildApiUrl, buildBackendUrl } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  stock: number;
  status: string;
  is_featured?: boolean;
  is_best_seller?: boolean;
  category_name?: string;
  categories?: Array<{id: string; name: string}>;
  brand_name?: string;
  thumbnail_url?: string;
  thumbnail_sizes?: {
    thumb?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
  };
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const { user, hydrate } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      if (!user) {
        await hydrate();
        if (!isMounted) return;
        if (!useAuthStore.getState().user) {
          window.location.href = '/login';
          return;
        }
      }
      
      if (isMounted) {
        await Promise.all([
          fetchCategories(),
          fetchBrands(),
        ]);
        setIsInitialized(true);
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce search query (skip initial mount)
  useEffect(() => {
    if (!isInitialized) return;
    
    let isMounted = true;
    const timer = setTimeout(() => {
      if (!isMounted) return;
      setCurrentPage(1); // Reset to page 1 when search changes
      // fetchProducts will be triggered by the filter change effect
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, isInitialized]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ data: Product[]; total: number; totalPages: number }>(buildApiUrl('/api/products'), {
        params: {
          page: currentPage,
          pageSize,
          status: statusFilter || undefined,
          category_id: categoryFilter || undefined,
          brand_id: brandFilter || undefined,
          q: searchQuery || undefined
        },
        withCredentials: true,
      });

      setProducts(response.data?.data || []);
      setTotal(response.data?.total || 0);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [brandFilter, categoryFilter, currentPage, pageSize, searchQuery, statusFilter]);

  // Fetch when filters/pagination change
  useEffect(() => {
    if (!isInitialized) return;
    fetchProducts();
  }, [fetchProducts, isInitialized]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get<{ data: Category[] }>(buildApiUrl('/api/product-categories'), {
        withCredentials: true,
      });
      setCategories(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get<{ data: Brand[] }>(buildApiUrl('/api/brands'), {
        withCredentials: true,
      });
      setBrands(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  const handleShowAll = () => {
    setSearchQuery('');
    setStatusFilter('');
    setCategoryFilter('');
    setBrandFilter('');
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    
    try {
      await axios.delete(buildApiUrl(`/api/products/${id}`), {
        withCredentials: true,
      });
      await fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Không thể xóa sản phẩm');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const response = await axios.post(buildApiUrl(`/api/products/${id}/duplicate`), {}, {
        withCredentials: true,
      });
      await fetchProducts();
      // Redirect to edit page of the new product
      if (response.data?.id) {
        window.location.href = `/dashboard/products/${response.data.id}`;
      }
    } catch (error: any) {
      console.error('Failed to duplicate product:', error);
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to duplicate product';
      alert(message);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await axios.patch(buildApiUrl(`/api/products/${id}`), 
        { status: newStatus },
        { withCredentials: true }
      );
      // Update local state immediately for better UX
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === id ? { ...p, status: newStatus } : p)
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Không thể cập nhật trạng thái sản phẩm');
      // Revert by refetching
      fetchProducts();
    }
  };

  const handleFlagChange = async (
    id: string,
    field: 'is_featured' | 'is_best_seller',
    checked: boolean
  ) => {
    const previousValue = products.find((p) => p.id === id)?.[field] ?? false;

    // Optimistic update
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, [field]: checked } : product
      )
    );

    try {
      await axios.patch(
        buildApiUrl(`/api/products/${id}`),
        { [field]: checked },
        { withCredentials: true }
      );
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      alert('Không thể cập nhật cờ sản phẩm');
      // Revert to previous value
      setProducts((prev) =>
        prev.map((product) =>
          product.id === id ? { ...product, [field]: previousValue } : product
        )
      );
    }
  };

  const handleImportChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsImporting(true);
      const response = await axios.post(
        buildApiUrl('/api/products/import'),
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      const { successCount = 0, failureCount = 0 } = (response.data ?? {}) as {
        successCount?: number;
        failureCount?: number;
      };
      await fetchProducts();
      alert(`Import hoàn tất. Thành công: ${successCount ?? 0}, Thất bại: ${failureCount ?? 0}`);
    } catch (error: any) {
      console.error('Import failed:', error);
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Không thể import sản phẩm';
      alert(message);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sản phẩm</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh mục sản phẩm của bạn
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/product_mau.xlsx"
            download
            className="inline-flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            <Download className="h-4 w-4" />
            Tải file mẫu
          </a>
          <label className="inline-flex items-center gap-2 rounded-lg border border-dashed border-input px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors cursor-pointer">
            <Upload className="h-4 w-4" />
            {isImporting ? 'Đang import...' : 'Import'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleImportChange}
              disabled={isImporting}
            />
          </label>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
          <option value="archived">Đã lưu trữ</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <select
          value={brandFilter}
          onChange={(e) => {
            setBrandFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tất cả thương hiệu</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
        </select>
        
        {/* Page Size Selector - Now inline */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground border-l border-border pl-4">
          <span>Hiển thị</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>mỗi trang</span>
        </div>

        <button
          onClick={handleShowAll}
          className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          Hiển thị tất cả
        </button>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Chưa có sản phẩm"
          description="Bắt đầu xây dựng danh mục sản phẩm bằng cách thêm sản phẩm đầu tiên. Bạn có thể thêm chi tiết, hình ảnh, giá và thông tin kho hàng."
          action={{
            label: 'Thêm sản phẩm đầu tiên',
            onClick: () => window.location.href = '/dashboard/products/new'
          }}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[32%]">Sản phẩm</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[12%] whitespace-nowrap">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[14%]">Danh mục</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[12%]">Thương hiệu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-24">Giá</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground uppercase w-16">Kho</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground uppercase w-20">Nổi bật</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground uppercase w-24 whitespace-nowrap">Bán chạy</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground uppercase w-28">Trạng thái</th>
                <th className="px-3 py-3 text-center text-xs font-medium text-muted-foreground uppercase w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-accent/40 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.thumbnail_url || product.thumbnail_sizes ? (
                        <img
                          src={
                            product.thumbnail_sizes?.thumb?.url 
                              ? buildBackendUrl(product.thumbnail_sizes.thumb.url)
                              : (product.thumbnail_url?.startsWith('http') 
                                  ? product.thumbnail_url 
                                  : buildBackendUrl(product.thumbnail_url || ''))
                          }
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-foreground">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground whitespace-nowrap">{product.sku || '—'}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {product.categories && product.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {product.categories.map(cat => (
                          <span key={cat.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    ) : product.category_name || '—'}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{product.brand_name || '—'}</td>
                  <td className="px-4 py-4 text-sm font-medium text-foreground whitespace-nowrap">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(Math.round(Number(product.price)))}
                  </td>
                  <td className="px-3 py-4 text-sm text-muted-foreground text-center">{product.stock}</td>
                  <td className="px-3 py-4">
                    <label className="flex items-center justify-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={Boolean(product.is_featured)}
                        onChange={(e) =>
                          handleFlagChange(product.id, 'is_featured', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0"
                        aria-label="Toggle featured product"
                      />
                    </label>
                  </td>
                  <td className="px-3 py-4">
                    <label className="flex items-center justify-center gap-2 text-sm text-foreground">
                      <input
                        type="checkbox"
                        checked={Boolean(product.is_best_seller)}
                        onChange={(e) =>
                          handleFlagChange(product.id, 'is_best_seller', e.target.checked)
                        }
                        className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0"
                        aria-label="Toggle best seller"
                      />
                    </label>
                  </td>
                  <td className="px-3 py-4 text-center">
                    <select
                      value={product.status}
                      onChange={(e) => handleStatusChange(product.id, e.target.value)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer ${
                        product.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : product.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <option value="draft">Bản nháp</option>
                      <option value="published">Đã xuất bản</option>
                      <option value="archived">Đã lưu trữ</option>
                    </select>
                  </td>
                  <td className="px-3 py-4 text-sm font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDuplicate(product.id)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition-colors dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white"
                        title="Sao chép"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Results Info and Pagination */}
      {!loading && products.length > 0 && (
        <div className="space-y-4">
          {/* Results Summary */}
          <div className="text-sm text-muted-foreground">
            Hiển thị {((currentPage - 1) * pageSize) + 1} đến {Math.min(currentPage * pageSize, total)} trong tổng số {total} kết quả
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="text-sm text-muted-foreground">
                Trang {currentPage} / {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border border-input bg-background text-sm hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    const pageNum = currentPage <= 3 ? idx + 1 : currentPage - 2 + idx;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-input bg-background hover:bg-accent'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border border-input bg-background text-sm hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No results message */}
      {!loading && products.length === 0 && total === 0 && (statusFilter || categoryFilter || brandFilter || searchQuery) && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn.</p>
          <button
            onClick={handleShowAll}
            className="mt-2 text-primary hover:underline"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
