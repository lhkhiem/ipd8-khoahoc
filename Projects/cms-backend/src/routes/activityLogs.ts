import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getRecentActivities } from '../controllers/activityLogController';

const router = Router();

// Get recent activities (protected - admin only)
router.get('/', authMiddleware, getRecentActivities);

export default router;

