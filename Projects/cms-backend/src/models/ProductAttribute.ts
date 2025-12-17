// ProductAttribute model
// Custom attributes for products (e.g., Color: Red, Size: Large)

export interface ProductAttribute {
  id: string;
  product_id: string;
  name: string;
  value: string;
  created_at: Date;
}

export interface CreateProductAttributeDTO {
  product_id: string;
  name: string;
  value: string;
}
