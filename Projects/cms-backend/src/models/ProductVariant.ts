export interface ProductVariantOption {
  option_id: string;
  option_name: string;
  option_value_id: string;
  option_value: string;
  option_position?: number;
  option_value_position?: number;
  option_value_code?: string | null;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string | null;
  price: number;
  compare_price: number | null;
  stock: number;
  status: string;
  title_override?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  thumbnail_asset_id?: string | null;
  specs?: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
  options?: ProductVariantOption[];
  attributes?: ProductVariantAttribute[];
}

export interface ProductVariantAttribute {
  id: string;
  variant_id: string;
  name: string;
  value: string | null;
  created_at: Date;
}

export interface CreateProductVariantDTO {
  product_id: string;
  sku?: string | null;
  price: number;
  compare_price?: number | null;
  stock?: number;
  status?: string;
  title_override?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  thumbnail_asset_id?: string | null;
  specs?: Record<string, unknown> | null;
  options?: Array<{
    option_id?: string;
    option_name?: string;
    option_value_id?: string;
    value?: string;
  }>;
  attributes?: Array<{
    name: string;
    value?: string | null;
  }>;
}


