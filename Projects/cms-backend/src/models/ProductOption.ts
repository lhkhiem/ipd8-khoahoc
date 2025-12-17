export interface ProductOptionValue {
  id: string;
  option_id: string;
  value: string;
  code?: string | null;
  position: number;
  created_at: Date;
}

export interface ProductOption {
  id: string;
  group_id: string;
  name: string;
  position: number;
  created_at: Date;
  values?: ProductOptionValue[];
}



