// Activity Log Controller
// Handles activity logging and retrieval

import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { CreateActivityLogDTO } from '../models/ActivityLog';

// Get recent activities
export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const { limit = 20 } = req.query;

    const query = `
      SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT :limit
    `;

    const result: any = await sequelize.query(query, {
      replacements: { limit: parseInt(limit as string) },
      type: QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Failed to fetch activities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activities',
      message: error.message
    });
  }
};

// Create activity log (can be called from middleware or controllers)
export const createActivityLog = async (data: CreateActivityLogDTO) => {
  try {
    const query = `
      INSERT INTO activity_logs (
        user_id, action, entity_type, entity_id, entity_name,
        description, metadata, ip_address, user_agent
      )
      VALUES (
        :user_id, :action, :entity_type, :entity_id, :entity_name,
        :description, :metadata, :ip_address, :user_agent
      )
      RETURNING id
    `;

    await sequelize.query(query, {
      replacements: {
        user_id: data.user_id || null,
        action: data.action,
        entity_type: data.entity_type,
        entity_id: data.entity_id || null,
        entity_name: data.entity_name || null,
        description: data.description || null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        ip_address: data.ip_address || null,
        user_agent: data.user_agent || null
      },
      type: QueryTypes.INSERT
    });
  } catch (error: any) {
    // Don't throw error - activity logging should not break the main flow
    console.error('Failed to create activity log:', error);
  }
};

// Helper function to log activity (can be used in controllers)
export const logActivity = async (
  req: Request,
  action: string,
  entityType: string,
  entityId?: string,
  entityName?: string,
  description?: string,
  metadata?: Record<string, unknown>
) => {
  const userId = (req as any).user?.id || null;
  const forwardedFor = req.headers['x-forwarded-for'];
  const ipAddress = (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0] : null)
    || (typeof req.headers['x-real-ip'] === 'string' ? req.headers['x-real-ip'] : null)
    || (typeof req.socket.remoteAddress === 'string' ? req.socket.remoteAddress : null)
    || null;
  const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : null;

  await createActivityLog({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    entity_name: entityName,
    description,
    metadata,
    ip_address: ipAddress,
    user_agent: userAgent
  });
};

