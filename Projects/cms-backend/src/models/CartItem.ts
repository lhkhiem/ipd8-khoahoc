// CartItem model
// Shopping cart items for both guest and authenticated users

export interface CartItem {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  product_id: string;
  quantity: number;
  snapshot_price?: number;
  created_at: Date;
  updated_at: Date;
  
  // Populated fields
  product?: any;
}

export interface CreateCartItemDTO {
  user_id?: string | null;
  session_id?: string | null;
  product_id: string;
  quantity?: number;
  snapshot_price?: number;
}

export interface UpdateCartItemDTO {
  quantity?: number;
}

















