import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getNotifications,
  getNotificationById,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../controllers/notificationController';

const router = Router();

router.get('/', authMiddleware, getNotifications);
router.get('/:id', authMiddleware, getNotificationById);
router.post('/', authMiddleware, createNotification);
router.put('/:id/read', authMiddleware, markNotificationAsRead);
router.put('/read-all', authMiddleware, markAllNotificationsAsRead);
router.delete('/:id', authMiddleware, deleteNotification);

export default router;












