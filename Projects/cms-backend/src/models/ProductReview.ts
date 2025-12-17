// ProductReview model
// Customer reviews and ratings

export interface ProductReview {
  id: string;
  product_id: string;
  user_id?: string | null;
  customer_name: string;
  customer_email?: string;
  rating: number; // 1-5
  title?: string;
  review_text?: string;
  is_verified_purchase: boolean;
  verified_purchase_order_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  moderated_by?: string;
  moderated_at?: Date;
  moderation_notes?: string;
  helpful_count: number;
  not_helpful_count: number;
  created_at: Date;
  updated_at: Date;
  
  // Populated fields
  customer?: any;
  product?: any;
}

export interface CreateProductReviewDTO {
  product_id: string;
  user_id?: string;
  customer_name: string;
  customer_email?: string;
  rating: number;
  title?: string;
  review_text?: string;
}

export interface UpdateProductReviewDTO {
  status?: 'pending' | 'approved' | 'rejected';
  moderation_notes?: string;
}

















