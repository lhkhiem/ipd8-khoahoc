// ProductCategory model
// Hierarchical categories for product organization

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  description?: string;
  image_id?: string;
  is_featured?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductCategoryDTO {
  name: string;
  slug: string;
  parent_id?: string;
  description?: string;
  image_id?: string;
  is_featured?: boolean;
}

export interface UpdateProductCategoryDTO extends Partial<CreateProductCategoryDTO> {}
