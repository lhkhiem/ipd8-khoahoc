'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { ArrowLeft, Package, Save, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/lib/api';
import { Order, OrderItem } from '@/types';
import { useAuthStore } from '@/store/authStore';

const toCurrency = (value: number | string | null | undefined) => {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return '0 đ';
  // VNĐ - no decimals, format as integer
  const rounded = Math.round(numeric);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
};

const formatDateTime = (value: string | Date | null | undefined) => {
  if (!value) return '—';
  
  // Parse date - if string doesn't have timezone, assume UTC from database
  let date: Date;
  if (typeof value === 'string') {
    if (value.includes('Z') || value.includes('+') || (value.includes('-') && value.match(/[+-]\d{2}:\d{2}$/))) {
      // Has timezone info, parse directly
      date = new Date(value);
    } else {
      // No timezone info, assume UTC from PostgreSQL
      date = new Date(value + 'Z');
    }
  } else {
    date = value;
  }
  
  if (Number.isNaN(date.getTime())) return '—';
  
  // Format in Vietnam timezone (UTC+7)
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  });
};

const normalizeAddress = (
  address: any
): Record<string, string | number> | null => {
  if (!address) return null;
  if (typeof address === 'string') {
    try {
      return JSON.parse(address);
    } catch (error) {
      return { raw: address };
    }
  }
  if (typeof address === 'object') {
    return address as Record<string, string | number>;
  }
  return null;
};

const normalizeOrder = (raw: any): Order => {
  const items: OrderItem[] = Array.isArray(raw?.items)
    ? raw.items.map((item: any) => ({
        ...item,
        quantity: Number(item?.quantity ?? 0),
        unit_price: Number(item?.unit_price ?? 0),
        total_price: Number(
          item?.total_price ?? item?.subtotal ?? item?.unit_price ?? 0
        ),
      }))
    : [];

  return {
    ...raw,
    subtotal: Number(raw?.subtotal ?? 0),
    tax_amount: Number(raw?.tax_amount ?? 0),
    shipping_cost: Number(raw?.shipping_cost ?? 0),
    discount_amount: Number(raw?.discount_amount ?? 0),
    total: Number(raw?.total ?? 0),
    items,
    shipping_address: normalizeAddress(raw?.shipping_address) ?? {},
    billing_address: normalizeAddress(raw?.billing_address) ?? {},
  };
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params?.id as string | undefined;
  const { user, hydrate } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStatus, setEditingStatus] = useState<string>('');
  const [editingPaymentStatus, setEditingPaymentStatus] = useState<string>('');
  const [editingTrackingNumber, setEditingTrackingNumber] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const ensureAuthAndFetch = async () => {
      try {
        if (!user) {
          await hydrate();
          if (!useAuthStore.getState().user) {
            window.location.href = '/login';
            return;
          }
        }
        if (!orderId) {
          setError('Order ID is missing');
          return;
        }
        await fetchOrder(orderId);
      } catch (err) {
        console.error('[OrderDetail] failed to load', err);
        setError('Failed to load order');
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    ensureAuthAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrder = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(buildApiUrl(`/api/orders/${id}`), {
        withCredentials: true,
      });
      const normalized = normalizeOrder(response.data);
      setOrder(normalized);
      // Initialize editing values
      setEditingStatus(normalized.status);
      setEditingPaymentStatus(normalized.payment_status);
      setEditingTrackingNumber(normalized.tracking_number || '');
    } catch (err: any) {
      console.error('Failed to fetch order detail:', err);
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Failed to load order';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!order) return;
    
    setSaving(true);
    try {
      const updateData: any = {};
      if (editingStatus !== order.status) {
        updateData.status = editingStatus;
      }
      if (editingPaymentStatus !== order.payment_status) {
        updateData.payment_status = editingPaymentStatus;
      }
      if (editingTrackingNumber !== (order.tracking_number || '')) {
        updateData.tracking_number = editingTrackingNumber || null;
      }

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        setSaving(false);
        return;
      }

      const response = await axios.put(
        buildApiUrl(`/api/orders/${order.id}`),
        updateData,
        { withCredentials: true }
      );

      const updated = normalizeOrder(response.data);
      setOrder(updated);
      setIsEditing(false);
      toast.success('Cập nhật đơn hàng thành công');
    } catch (err: any) {
      console.error('Failed to update order:', err);
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Không thể cập nhật đơn hàng';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;
    
    if (!confirm(
      `Bạn có chắc chắn muốn hủy đơn hàng ${order.order_number}?\n\n` +
      `Hành động này sẽ:\n` +
      `- Đặt trạng thái đơn hàng thành "cancelled"\n` +
      `- Restore stock cho tất cả sản phẩm trong đơn\n\n` +
      `Hành động này không thể hoàn tác.`
    )) {
      return;
    }

    setSaving(true);
    try {
      const response = await axios.put(
        buildApiUrl(`/api/orders/${order.id}`),
        { status: 'cancelled' },
        { withCredentials: true }
      );

      const updated = normalizeOrder(response.data);
      setOrder(updated);
      setEditingStatus('cancelled');
      setIsEditing(false);
      toast.success('Đã hủy đơn hàng và restore stock');
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Không thể hủy đơn hàng';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const shippingAddress = useMemo(
    () => normalizeAddress(order?.shipping_address) ?? {},
    [order?.shipping_address]
  );
  const billingAddress = useMemo(
    () => normalizeAddress(order?.billing_address) ?? {},
    [order?.billing_address]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-muted-foreground">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Order detail</h1>
            <p className="text-sm text-muted-foreground">
              {error || 'Order not found'}
            </p>
          </div>
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
        </div>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-destructive">
            {error || 'We could not find this order. It may have been removed.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Order {order.order_number}
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed on {formatDateTime(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingStatus(order.status);
                  setEditingPaymentStatus(order.payment_status);
                  setEditingTrackingNumber(order.tracking_number || '');
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
                disabled={saving}
              >
                <X className="h-4 w-4" />
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </>
          ) : (
            <>
              {order.status !== 'cancelled' && (
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg border border-destructive text-destructive px-3 py-2 text-sm hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Hủy đơn
                </button>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm hover:bg-primary/90 transition-colors"
              >
                Chỉnh sửa
              </button>
              <Link
                href="/dashboard/orders"
                className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to orders
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-card-foreground">
              Order items
            </h2>
            {order.items && order.items.length > 0 ? (
              <div className="mt-4 overflow-hidden rounded-lg border border-border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                        SKU
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                        Variant
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted-foreground">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-foreground">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {item.product_name}
                              </div>
                              {item.product_id && (
                                <div className="text-xs text-muted-foreground">
                                  ID: {item.product_id}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {item.product_sku || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {item.variant_name || '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-foreground">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-foreground">
                          {toCurrency(item.unit_price)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                          {toCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No items found for this order.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-card-foreground">
              Order summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{toCurrency(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Discount</span>
                  <span className="text-red-600">-{toCurrency(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{order.shipping_cost === 0 ? 'Free' : toCurrency(order.shipping_cost)}</span>
              </div>
              {order.tax_amount > 0 && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>{toCurrency(order.tax_amount)}</span>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between text-base font-semibold text-card-foreground border-t border-border pt-3">
                <span>Total</span>
                <span>{toCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment & Shipping Details */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-card-foreground">
              Payment & Shipping Details
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Order Status:</span>
                {isEditing ? (
                  <select
                    value={editingStatus}
                    onChange={(e) => setEditingStatus(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm"
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="shipped">Đã gửi hàng</option>
                    <option value="delivered">Đã giao hàng</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                ) : (
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'pending' ? 'Chờ xử lý' :
                       order.status === 'processing' ? 'Đang xử lý' :
                       order.status === 'shipped' ? 'Đã gửi hàng' :
                       order.status === 'delivered' ? 'Đã giao hàng' :
                       order.status === 'cancelled' ? 'Đã hủy' :
                       order.status}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <span className="text-muted-foreground">Payment Status:</span>
                {isEditing ? (
                  <select
                    value={editingPaymentStatus}
                    onChange={(e) => setEditingPaymentStatus(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm"
                  >
                    <option value="pending">Chờ thanh toán</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="failed">Thanh toán thất bại</option>
                    <option value="refunded">Đã hoàn tiền</option>
                  </select>
                ) : (
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                      order.payment_status === 'refunded' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.payment_status === 'paid' ? 'Đã thanh toán' :
                       order.payment_status === 'pending' ? 'Chờ thanh toán' :
                       order.payment_status === 'failed' ? 'Thanh toán thất bại' :
                       order.payment_status === 'refunded' ? 'Đã hoàn tiền' :
                       order.payment_status}
                    </span>
                  </div>
                )}
              </div>
              {order.payment_method && (
                <div>
                  <span className="text-muted-foreground">Payment Method:</span>
                  <p className="mt-1 font-medium text-foreground">
                    {order.payment_method === 'cod' ? 'Ship COD (Thanh toán khi nhận hàng)' :
                     order.payment_method === 'zalopay' ? 'ZaloPay (Thanh toán trực tuyến)' :
                     order.payment_method === 'card' ? 'Thẻ tín dụng/Ghi nợ' :
                     order.payment_method}
                  </p>
                </div>
              )}
              {order.shipping_method && (
                <div>
                  <span className="text-muted-foreground">Shipping Method:</span>
                  <p className="mt-1 font-medium text-foreground">
                    {order.shipping_method === 'standard' ? 'Giao hàng tiêu chuẩn (5-7 ngày)' :
                     order.shipping_method === 'express' ? 'Giao hàng nhanh (2-3 ngày)' :
                     order.shipping_method}
                  </p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Shipping Cost:</span>
                <p className="mt-1 font-medium text-foreground">
                  {order.shipping_cost === 0 ? 'Miễn phí' : toCurrency(order.shipping_cost)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Tracking Number:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editingTrackingNumber}
                    onChange={(e) => setEditingTrackingNumber(e.target.value)}
                    placeholder="Nhập mã vận đơn"
                    className="mt-1 w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground text-sm"
                  />
                ) : (
                  <p className="mt-1 font-medium text-foreground">
                    {order.tracking_number || 'Chưa có mã vận đơn'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-card-foreground">
              Customer
            </h2>
            <div className="space-y-1 text-sm">
              <div className="font-medium text-card-foreground">
                {order.customer_name}
              </div>
              <div className="text-muted-foreground">
                {order.customer_email}
              </div>
              <div className="text-muted-foreground">
                {order.customer_phone || '—'}
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-foreground capitalize">{order.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Status:</span>
                <span className={`font-medium capitalize ${
                  order.payment_status === 'paid' ? 'text-green-600' :
                  order.payment_status === 'pending' ? 'text-yellow-600' :
                  order.payment_status === 'failed' ? 'text-red-600' :
                  'text-muted-foreground'
                }`}>
                  {order.payment_status}
                </span>
              </div>
              {order.payment_method && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium text-foreground">
                    {order.payment_method === 'cod' ? 'Ship COD (Thanh toán khi nhận hàng)' :
                     order.payment_method === 'zalopay' ? 'ZaloPay (Thanh toán trực tuyến)' :
                     order.payment_method === 'card' ? 'Thẻ tín dụng/Ghi nợ' :
                     order.payment_method}
                  </span>
                </div>
              )}
              {order.shipping_method && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping Method:</span>
                  <span className="font-medium text-foreground">
                    {order.shipping_method === 'standard' ? 'Giao hàng tiêu chuẩn (5-7 ngày)' :
                     order.shipping_method === 'express' ? 'Giao hàng nhanh (2-3 ngày)' :
                     order.shipping_method}
                  </span>
                </div>
              )}
              {order.shipping_cost !== undefined && order.shipping_cost !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping Cost:</span>
                  <span className="font-medium text-foreground">
                    {order.shipping_cost === 0 ? 'Miễn phí' : toCurrency(order.shipping_cost)}
                  </span>
                </div>
              )}
              {order.tracking_number && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tracking Number:</span>
                  <span className="font-medium text-foreground">{order.tracking_number}</span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-card-foreground">
              Shipping address
            </h2>
            <AddressBlock address={shippingAddress} />
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-card-foreground">
              Billing address
            </h2>
            <AddressBlock address={billingAddress} />
          </div>
        </div>
      </div>
    </div>
  );
}

const AddressBlock = ({ address }: { address: Record<string, any> }) => {
  if (!address || Object.keys(address).length === 0) {
    return <p className="text-sm text-muted-foreground">No address provided.</p>;
  }

  const prioritizedFields = [
    'name',
    'company',
    'line1',
    'line2',
    'city',
    'state',
    'province',
    'postal_code',
    'zip',
    'country',
    'phone',
  ];

  const orderedEntries = [
    ...prioritizedFields
      .map((field) =>
        field in address ? [field, address[field] as string | number] : null
      )
      .filter(Boolean),
    ...Object.entries(address).filter(
      ([key]) => !prioritizedFields.includes(key)
    ),
  ] as Array<[string, string | number]>;

  return (
    <div className="space-y-1 text-sm text-card-foreground">
      {orderedEntries.map(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          return null;
        }
        return (
          <div key={key} className="flex items-start gap-2 text-sm">
            <span className="w-24 text-xs uppercase text-muted-foreground">
              {key.replace(/_/g, ' ')}
            </span>
            <span className="flex-1">{String(value)}</span>
          </div>
        );
      })}
    </div>
  );
};



