// =============================================================================
// CENTRALIZED TYPE DEFINITIONS FOR FRONTEND ADMIN
// =============================================================================
// This file contains all TypeScript interfaces/types used across the admin panel
// to ensure consistency and avoid duplication

// =============================================================================
// AUTH & USER
// =============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  status?: string;
  role?: 'owner' | 'admin' | 'editor' | 'author';
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  user: User;
}

export interface RegisterResponse {
  user: User;
}

// =============================================================================
// CONTENT MANAGEMENT (POSTS, TOPICS, TAGS)
// =============================================================================

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: any; // JSONB or HTML string
  status: string;
  created_at: string;
  updated_at?: string;
  author_id: string;
  author?: User;
  published_at?: string;
  cover_asset_id?: string;
  cover_asset?: Asset;
  topics?: Topic[];
  tags?: Tag[];
  seo?: any;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  post_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  post_count?: number;
}

// =============================================================================
// MEDIA & ASSETS
// =============================================================================

export interface Asset {
  id: string;
  type: string; // image, video, document, etc.
  provider: string; // local, s3, etc.
  url: string;
  cdn_url?: string;
  width?: number;
  height?: number;
  format?: string;
  sizes?: {
    thumb?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
    original?: { url: string; width: number; height: number };
  };
  folder_id?: string | null;
  file_name?: string;
  thumb_url?: string;
  original_url?: string;
  created_at: string;
}

export interface AssetFolder {
  id: string;
  name: string;
  parent_id?: string | null;
  path?: string;
  created_at: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  parent_id: string | null;
  file_count?: number;
  created_at: string;
  updated_at?: string;
}

// =============================================================================
// E-COMMERCE PRODUCTS
// =============================================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  content?: any; // JSONB for rich content
  category_id?: string;
  brand_id?: string;
  sku?: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  stock: number;
  status: 'draft' | 'published' | 'archived';
  thumbnail_id?: string;
  thumbnail_url?: string;
  thumbnail_sizes?: {
    thumb?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
  };
  published_at?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  category_name?: string;
  categories?: Array<{ id: string; name: string }>;
  brand_name?: string;
  brand?: Brand;
  created_at: string;
  updated_at?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string | null;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  website?: string;
  logo_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface ProductImage {
  id: string;
  product_id: string;
  asset_id: string;
  asset?: Asset;
  sort_order: number;
  created_at: string;
}

export interface ProductAttribute {
  id: string;
  product_id: string;
  name: string;
  value: string;
  created_at: string;
}

// =============================================================================
// E-COMMERCE SHOPPING
// =============================================================================

export interface CartItem {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  product_id: string;
  quantity: number;
  snapshot_price?: number;
  product?: Product;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone?: string; // Phone number for order lookup
  shipping_address: any; // JSONB
  billing_address: any; // JSONB
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  shipping_method?: string;
  tracking_number?: string;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_transaction_id?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  items?: OrderItem[];
  customer?: User;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  product_sku?: string;
  product_image_url?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_info?: any; // JSONB
  created_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  user?: User;
  created_at: string;
}

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
  moderated_at?: string;
  moderation_notes?: string;
  helpful_count: number;
  not_helpful_count: number;
  created_at: string;
  updated_at: string;
  customer?: User;
  product?: Product;
}

// =============================================================================
// NAVIGATION & MENU
// =============================================================================

export interface MenuLocation {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  item_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface MenuItem {
  id: string;
  menu_location_id: string;
  parent_id?: string;
  title: string;
  url?: string;
  icon?: string;
  type: string; // custom, post, page, product, category
  entity_id?: string;
  target: string;
  rel?: string;
  css_classes?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: MenuItem[];
  depth?: number;
}

// =============================================================================
// TRACKING & ANALYTICS
// =============================================================================

export interface TrackingScript {
  id: string;
  name: string;
  type: 'analytics' | 'pixel' | 'custom' | 'tag-manager' | 'heatmap' | 'live-chat';
  provider?: string;
  position: 'head' | 'body';
  script_code: string;
  is_active: boolean;
  load_strategy: 'sync' | 'async' | 'defer';
  pages: string[]; // ['all'] or specific pages
  priority: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// SETTINGS & CONFIGURATION
// =============================================================================

export interface Appearance {
  logo_url?: string;
  primaryColor?: string;
  themeMode?: 'light' | 'dark' | 'system';
}

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  businessInfo?: any;
  socialLinks?: any;
}

export interface SEOSettings {
  home: {
    title: string;
    description: string;
    headScript: string;
    bodyScript: string;
    slug: string;
  };
  pages: any[];
}

// =============================================================================
// API RESPONSE WRAPPERS
// =============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type SortField = 'title' | 'status' | 'created_at' | 'updated_at' | 'published_at' | 'name' | 'date';
export type SortOrder = 'asc' | 'desc';

export type Status = 'draft' | 'published' | 'archived' | 'active' | 'inactive';

export type UserRole = 'owner' | 'admin' | 'editor' | 'author';

