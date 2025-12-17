// Tracking Script model
// Quản lý tracking scripts (Google Analytics, Facebook Pixel, etc.)

export interface TrackingScript {
  id: string;
  name: string;
  type: 'analytics' | 'pixel' | 'custom' | 'tag-manager' | 'heatmap' | 'live-chat';
  provider?: string;
  position: 'head' | 'body';
  script_code: string;
  is_active: boolean;
  load_strategy: 'sync' | 'async' | 'defer';
  pages: string[]; // ['all'] hoặc ['home', 'products', 'cart', etc.]
  priority: number;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTrackingScriptDTO {
  name: string;
  type?: 'analytics' | 'pixel' | 'custom' | 'tag-manager' | 'heatmap' | 'live-chat';
  provider?: string;
  position?: 'head' | 'body';
  script_code: string;
  is_active?: boolean;
  load_strategy?: 'sync' | 'async' | 'defer';
  pages?: string[];
  priority?: number;
  description?: string;
}

export interface UpdateTrackingScriptDTO extends Partial<CreateTrackingScriptDTO> {}


