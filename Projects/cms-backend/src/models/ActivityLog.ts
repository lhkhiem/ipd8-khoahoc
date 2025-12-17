// Activity Log model
// Tracks user actions and system events

export interface ActivityLog {
  id: string;
  user_id?: string | null;
  action: string; // 'create', 'update', 'delete', 'publish', 'login', etc.
  entity_type: string; // 'post', 'product', 'user', 'order', etc.
  entity_id?: string | null;
  entity_name?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: Date;
}

export interface CreateActivityLogDTO {
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  entity_name?: string | null;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface ActivityLogWithUser extends ActivityLog {
  user_name?: string | null;
  user_email?: string | null;
}

