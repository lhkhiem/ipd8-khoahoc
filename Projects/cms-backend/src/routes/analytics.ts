import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  trackPageview,
  getAnalyticsStats,
  getRealtimeStats,
  getDashboardStats,
  getCourseAnalytics,
  getEnrollmentAnalytics,
  getRevenueAnalytics,
  getUserAnalytics,
} from '../controllers/analyticsController';

const router = Router();

// Public endpoint - Track pageview
router.post('/track', trackPageview);

// Protected routes - require auth (admin)
router.get('/stats', authMiddleware, getAnalyticsStats);
router.get('/realtime', authMiddleware, getRealtimeStats);
// IPD8 Analytics endpoints
router.get('/dashboard', authMiddleware, getDashboardStats);
router.get('/courses', authMiddleware, getCourseAnalytics);
router.get('/enrollments', authMiddleware, getEnrollmentAnalytics);
router.get('/revenue', authMiddleware, getRevenueAnalytics);
router.get('/users', authMiddleware, getUserAnalytics);

export default router;

