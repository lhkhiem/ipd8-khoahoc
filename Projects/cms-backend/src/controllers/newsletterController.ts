import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import NewsletterSubscription from '../models/NewsletterSubscription';
import { QueryTypes } from 'sequelize';
import sequelize from '../config/database';
import { logActivity } from './activityLogController';

/**
 * Subscribe to newsletter (public endpoint)
 */
export const subscribe = async (req: Request, res: Response) => {
  try {
    const { email, source } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Get IP address and user agent
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    // Check if already subscribed
    const existing = await NewsletterSubscription.findOne({
      where: { email: normalizedEmail },
    });

    if (existing) {
      // If already unsubscribed, reactivate
      if (existing.status === 'unsubscribed') {
        await existing.update({
          status: 'active',
          subscribed_at: new Date(),
          unsubscribed_at: null,
          source: source || existing.source,
          ip_address: ipAddress as string,
          user_agent: userAgent,
        });
        return res.json({
          success: true,
          message: 'Đã đăng ký lại nhận bản tin thành công',
          subscription: {
            id: existing.id,
            email: existing.email,
            status: existing.status,
          },
        });
      }

      // If already active, return success
      if (existing.status === 'active') {
        return res.json({
          success: true,
          message: 'Email này đã được đăng ký nhận bản tin',
          subscription: {
            id: existing.id,
            email: existing.email,
            status: existing.status,
          },
        });
      }

      // If bounced, allow resubscription
      if (existing.status === 'bounced') {
        await existing.update({
          status: 'active',
          subscribed_at: new Date(),
          unsubscribed_at: null,
          source: source || existing.source,
          ip_address: ipAddress as string,
          user_agent: userAgent,
        });
        return res.json({
          success: true,
          message: 'Đã đăng ký nhận bản tin thành công',
          subscription: {
            id: existing.id,
            email: existing.email,
            status: existing.status,
          },
        });
      }
    }

    // Create new subscription
    const subscription = await NewsletterSubscription.create({
      email: normalizedEmail,
      status: 'active',
      source: source || 'website',
      ip_address: ipAddress as string,
      user_agent: userAgent,
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký nhận bản tin thành công',
      subscription: {
        id: subscription.id,
        email: subscription.email,
        status: subscription.status,
      },
    });
  } catch (error: any) {
    console.error('[newsletterController] Subscribe error:', error);
    
    // Handle unique constraint violation (duplicate email)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        error: 'Email này đã được đăng ký',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to subscribe to newsletter',
    });
  }
};

/**
 * Unsubscribe from newsletter (public endpoint)
 */
export const unsubscribe = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const subscription = await NewsletterSubscription.findOne({
      where: { email: normalizedEmail },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Email not found in subscriptions' });
    }

    if (subscription.status === 'unsubscribed') {
      return res.json({
        success: true,
        message: 'Email này đã được hủy đăng ký trước đó',
      });
    }

    await subscription.update({
      status: 'unsubscribed',
      unsubscribed_at: new Date(),
    });

    res.json({
      success: true,
      message: 'Đã hủy đăng ký nhận bản tin thành công',
    });
  } catch (error: any) {
    console.error('[newsletterController] Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from newsletter' });
  }
};

/**
 * Get all newsletter subscriptions (admin only)
 */
export const getSubscribers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { page = 1, pageSize = 20, status, search } = req.query;

    const whereConditions: string[] = [];
    const replacements: any = {
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
    };

    if (status && (status === 'active' || status === 'unsubscribed' || status === 'bounced')) {
      whereConditions.push('status = :status');
      replacements.status = status;
    }

    if (search) {
      whereConditions.push('email ILIKE :search');
      replacements.search = `%${search}%`;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM newsletter_subscriptions ${whereClause}`;
    const countResult: any = await sequelize.query(countQuery, {
      replacements: Object.fromEntries(
        Object.entries(replacements).filter(([key]) => key !== 'limit' && key !== 'offset')
      ),
      type: QueryTypes.SELECT,
    });
    const total = Number(countResult[0]?.total || 0);

    // Get subscribers
    const query = `
      SELECT 
        id, email, status, subscribed_at, unsubscribed_at, source, ip_address, user_agent, created_at, updated_at
      FROM newsletter_subscriptions
      ${whereClause}
      ORDER BY subscribed_at DESC
      LIMIT :limit OFFSET :offset
    `;
    const subscribers: any = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    res.json({
      success: true,
      data: subscribers || [],
      pagination: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    });
  } catch (error: any) {
    console.error('[newsletterController] Get subscribers error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch subscribers',
      data: [],
      pagination: {
        total: 0,
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 20,
        totalPages: 0,
      },
    });
  }
};

/**
 * Delete newsletter subscription (admin only)
 */
export const deleteSubscriber = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const subscription = await NewsletterSubscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const email = subscription.email;
    await subscription.destroy();

    // Log activity
    await logActivity(req, 'delete', 'newsletter_subscription', id, email, `Deleted newsletter subscription: ${email}`);

    res.json({
      success: true,
      message: 'Subscription deleted successfully',
    });
  } catch (error: any) {
    console.error('[newsletterController] Delete subscriber error:', error);
    res.status(500).json({ error: 'Failed to delete subscription' });
  }
};

/**
 * Get newsletter statistics (admin only)
 */
export const getStatistics = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const statsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'active') as active_count,
        COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed_count,
        COUNT(*) FILTER (WHERE status = 'bounced') as bounced_count,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE subscribed_at >= CURRENT_DATE - INTERVAL '30 days') as new_last_30_days,
        COUNT(*) FILTER (WHERE subscribed_at >= CURRENT_DATE - INTERVAL '7 days') as new_last_7_days
      FROM newsletter_subscriptions
    `;
    const stats: any = await sequelize.query(statsQuery, {
      type: QueryTypes.SELECT,
    });

    res.json({
      success: true,
      data: stats[0] || {
        active_count: 0,
        unsubscribed_count: 0,
        bounced_count: 0,
        total_count: 0,
        new_last_30_days: 0,
        new_last_7_days: 0,
      },
    });
  } catch (error: any) {
    console.error('[newsletterController] Get statistics error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch statistics',
      data: {
        active_count: 0,
        unsubscribed_count: 0,
        bounced_count: 0,
        total_count: 0,
        new_last_30_days: 0,
        new_last_7_days: 0,
      },
    });
  }
};








