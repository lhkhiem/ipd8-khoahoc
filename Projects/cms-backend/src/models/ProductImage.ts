// ProductImage model
// Product gallery images

export interface ProductImage {
  id: string;
  product_id: string;
  asset_id: string;
  sort_order: number;
  created_at: Date;
}

export interface CreateProductImageDTO {
  product_id: string;
  asset_id: string;
  sort_order?: number;
}
