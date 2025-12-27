import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';
import User from '../models/User';

// List notifications
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', user_id, read, type } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const where: any = {};
    if (user_id) where.user_id = user_id;
    if (read !== undefined) where.read = read === 'true';
    if (type) where.type = type;

    const { count, rows } = await Notification.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      limit: limitNum,
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (err) {
    console.error('[getNotifications] Error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Get notification by ID
export const getNotificationById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ data: notification });
  } catch (err) {
    console.error('[getNotificationById] Error:', err);
    res.status(500).json({ error: 'Failed to fetch notification' });
  }
};

// Create notification
export const createNotification = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { user_id, type, title, message, link } = req.body;

    if (!user_id || !type || !title || !message) {
      return res.status(400).json({ error: 'Missing required fields: user_id, type, title, message' });
    }

    const notification = await Notification.create({
      user_id,
      type,
      title,
      message,
      link,
      read: false,
    });

    res.status(201).json({ data: notification });
  } catch (err) {
    console.error('[createNotification] Error:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.update({ read: true });
    res.json({ data: notification });
  } catch (err) {
    console.error('[markNotificationAsRead] Error:', err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: 'Missing required field: user_id' });
    }

    await Notification.update(
      { read: true },
      {
        where: { user_id, read: false },
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('[markAllNotificationsAsRead] Error:', err);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Delete notification
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id } = req.params;
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.destroy();
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('[deleteNotification] Error:', err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};











