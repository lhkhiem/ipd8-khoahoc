// Order model
// Complete order management

import { OrderItem, CreateOrderItemDTO } from './OrderItem';

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string; // Required for phone-based order lookup
  shipping_address: any; // JSONB
  billing_address: any; // JSONB
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  shipping_method?: string;
  tracking_number?: string;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_transaction_id?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  admin_notes?: string;
  created_at: Date;
  updated_at: Date;
  shipped_at?: Date;
  delivered_at?: Date;
  cancelled_at?: Date;
  
  // Populated fields
  items?: OrderItem[];
}

export interface CreateOrderDTO {
  customer_id?: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string; // Required for phone-based order lookup
  shipping_address: any;
  billing_address: any;
  shipping_method?: string;
  payment_method: string;
  items: CreateOrderItemDTO[];
  notes?: string;
}

export interface UpdateOrderDTO {
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  admin_notes?: string;
}





