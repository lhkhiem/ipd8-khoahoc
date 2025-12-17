// Brand model
// Product brands/manufacturers

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_id?: string;
  website?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBrandDTO {
  name: string;
  slug: string;
  description?: string;
  logo_id?: string;
  website?: string;
}

export interface UpdateBrandDTO extends Partial<CreateBrandDTO> {}
