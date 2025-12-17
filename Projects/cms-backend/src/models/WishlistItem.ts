// WishlistItem model
// User wishlist/favorites

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: Date;
  
  // Populated fields
  product?: any;
}

export interface CreateWishlistItemDTO {
  user_id: string;
  product_id: string;
}

















