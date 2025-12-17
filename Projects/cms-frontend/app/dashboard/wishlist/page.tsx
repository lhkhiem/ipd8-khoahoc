'use client';

import { useState, useEffect } from 'react';
import { Heart, Package, User, Search } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { WishlistItem } from '@/types';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/api';

export default function WishlistPage() {
  const { user, hydrate } = useAuthStore();
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedWishlist, setSelectedWishlist] = useState<any | null>(null);
  const [showWishlistDetail, setShowWishlistDetail] = useState(false);

  useEffect(() => {
    if (!user) {
      hydrate().then(() => {
        if (!useAuthStore.getState().user) return (window.location.href = '/login');
        fetchWishlists();
      });
    } else {
      fetchWishlists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce search query
  useEffect(() => {
    if (!user) return;
    
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchWishlists();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Fetch when filters/pagination change
  useEffect(() => {
    if (user) {
      fetchWishlists();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const fetchWishlists = async () => {
    try {
      setLoading(true);
      
      // Get all users to fetch their wishlists
      const usersResponse = await axios.get(buildApiUrl('/api/users'), {
        withCredentials: true,
      });
      
      const users = usersResponse.data?.data || [];
      
      // Filter users by search query
      const filteredUsers = searchQuery
        ? users.filter((u: any) =>
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : users;
      
      const wishlistPromises = filteredUsers.map(async (u: any) => {
        try {
          const wishlistResponse = await axios.get(buildApiUrl('/api/wishlist'), {
            params: { user_id: u.id },
            withCredentials: true,
          });
          
          if (wishlistResponse.data?.item_count > 0) {
            return {
              user_id: u.id,
              user_name: u.name,
              user_email: u.email,
              ...wishlistResponse.data
            };
          }
          return null;
        } catch (error: any) {
          if (error.response?.status !== 400) {
            console.error('Failed to fetch wishlist for user:', u.id, error);
          }
          return null;
        }
      });

      const results = await Promise.all(wishlistPromises);
      const validWishlists = results.filter(w => w !== null);
      
      // Paginate
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      const paginatedWishlists = validWishlists.slice(start, end);
      
      setWishlists(paginatedWishlists);
      setTotal(validWishlists.length);
      setTotalPages(Math.ceil(validWishlists.length / pageSize));
    } catch (error: any) {
      console.error('Failed to fetch wishlists:', error);
      toast.error('Failed to load wishlists');
      setWishlists([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    // VNĐ - no decimals, format as integer
    const rounded = Math.round(amount);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rounded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh', // UTC+7
    });
  };

  if (loading && wishlists.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading wishlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Wishlists</h1>
          <p className="text-sm text-muted-foreground">
            View customer wishlists ({total} total)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
        </select>
      </div>

      {/* Wishlists List */}
      {wishlists.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No wishlists found"
          description="Customer wishlists will appear here when they add favorites"
        />
      ) : (
        <div className="overflow-hidden border border-border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Items</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Total Value</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {wishlists.map((wishlist) => {
                const totalValue = (wishlist.items || []).reduce((sum: number, item: any) => {
                  return sum + (item.product_price || 0);
                }, 0);
                
                return (
                  <tr key={wishlist.user_id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-foreground">{wishlist.user_name}</div>
                          <div className="text-xs text-muted-foreground">{wishlist.user_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground">
                        {wishlist.item_count} item(s)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">
                        {formatCurrency(totalValue)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedWishlist(wishlist);
                          setShowWishlistDetail(true);
                        }}
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Package className="h-4 w-4" />
                        View Items
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, total)} of {total} wishlists
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Wishlist Detail Modal */}
      {showWishlistDetail && selectedWishlist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Wishlist Details</h2>
              <button
                onClick={() => setShowWishlistDetail(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {selectedWishlist.items.map((item: any) => (
                <div key={item.id} className="border border-border rounded-lg p-4 flex items-start gap-4">
                  {item.thumbnail_url && (
                    <img
                      src={item.thumbnail_url}
                      alt={item.product_name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.product_name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      SKU: {item.product_slug || item.product_id}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Added: {formatDate(item.created_at)}
                      </span>
                      <span className="font-medium text-foreground">
                        {formatCurrency(item.product_price || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {selectedWishlist.items.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No items in this wishlist
                </p>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowWishlistDetail(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

