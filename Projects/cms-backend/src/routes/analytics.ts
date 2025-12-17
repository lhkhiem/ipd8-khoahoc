import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  trackPageview,
  getAnalyticsStats,
  getRealtimeStats,
} from '../controllers/analyticsController';

const router = Router();

// Public endpoint - Track pageview
router.post('/track', trackPageview);

// Protected routes - require auth (admin)
router.get('/stats', authMiddleware, getAnalyticsStats);
router.get('/realtime', authMiddleware, getRealtimeStats);

export default router;

