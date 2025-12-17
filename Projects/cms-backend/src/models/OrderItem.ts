// OrderItem model
// Order line items with product snapshots

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  product_sku?: string;
  product_image_url?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_info?: any; // JSONB
  created_at: Date;
}

export interface CreateOrderItemDTO {
  product_id: string;
  quantity: number;
  variant_info?: any;
}

















