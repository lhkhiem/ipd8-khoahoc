'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Package } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { CartItem } from '@/types';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/api';

interface Cart {
  items: CartItem[];
  subtotal: number;
  item_count: number;
}

export default function CartPage() {
  const { user, hydrate } = useAuthStore();
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedCart, setSelectedCart] = useState<Cart | null>(null);
  const [showCartDetail, setShowCartDetail] = useState(false);

  useEffect(() => {
    if (!user) {
      hydrate().then(() => {
        if (!useAuthStore.getState().user) return (window.location.href = '/login');
        fetchCarts();
      });
    } else {
      fetchCarts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch when filters/pagination change
  useEffect(() => {
    if (user) {
      fetchCarts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const fetchCarts = async () => {
    try {
      setLoading(true);
      // Note: This endpoint assumes we have a way to list all carts
      // For now, we'll fetch carts for a specific user
      // In production, you might want to add an admin endpoint to list all carts
      
      // Get all users to fetch their carts
      const usersResponse = await axios.get<any>(buildApiUrl('/api/users'), {
        withCredentials: true,
      });
      
      const users = (usersResponse.data?.data || usersResponse.data || []) as any[];
      const cartPromises = users.slice(0, 10).map(async (u: any) => {
        try {
          const cartResponse = await axios.get<any>(buildApiUrl('/api/cart'), {
            params: { user_id: u.id },
            withCredentials: true,
          });
          return {
            user_id: u.id,
            user_name: u.name,
            user_email: u.email,
            ...(cartResponse.data || {})
          };
        } catch (error) {
          return null;
        }
      });

      const results = await Promise.all(cartPromises);
      const validCarts = results.filter(c => c && c.item_count > 0);
      
      setCarts(validCarts);
      setTotal(validCarts.length);
      setTotalPages(Math.ceil(validCarts.length / pageSize));
    } catch (error: any) {
      console.error('Failed to fetch carts:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load shopping carts');
      }
      setCarts([]);
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

  if (loading && carts.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading shopping carts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shopping Cart</h1>
          <p className="text-sm text-muted-foreground">
            View customer shopping carts ({total} total)
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Note:</strong> Currently showing first 10 users with active carts. 
          For production, consider adding an admin endpoint to list all carts.
        </p>
      </div>

      {/* Cart List */}
      {carts.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No active carts"
          description="Shopping carts will appear here when customers add items"
        />
      ) : (
        <div className="overflow-hidden border border-border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Customer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Items</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Subtotal</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Last Updated</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {carts.map((cart) => (
                <tr key={cart.user_id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium text-foreground">{cart.user_name}</div>
                        <div className="text-xs text-muted-foreground">{cart.user_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground">
                      {cart.item_count} item(s)
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">
                      {formatCurrency(cart.subtotal || 0)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-muted-foreground">
                      {cart.items?.[0]?.updated_at ? formatDate(cart.items[0].updated_at) : '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setSelectedCart(cart);
                        setShowCartDetail(true);
                      }}
                      className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <Package className="h-4 w-4" />
                      View Items
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cart Detail Modal */}
      {showCartDetail && selectedCart && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Cart Details</h2>
              <button
                onClick={() => setShowCartDetail(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {selectedCart.items.map((item: any) => (
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
                      SKU: {item.product_id}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        Quantity: <strong>{item.quantity}</strong>
                      </span>
                      <span className="font-medium text-foreground">
                        {formatCurrency((item.snapshot_price || item.product_price || 0) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t border-border pt-4 mt-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedCart.subtotal || 0)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCartDetail(false)}
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

