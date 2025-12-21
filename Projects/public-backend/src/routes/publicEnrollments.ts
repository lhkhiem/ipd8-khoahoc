/**
 * Public Enrollments Routes
 * Skeleton routes for enrollment management (user actions)
 * TODO: Implement controllers and business logic after models are ready
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';
import * as enrollmentController from '../controllers/enrollmentController';

const router = Router();

/**
 * GET /api/public/enrollments/my
 * Get my enrollments (requires authentication)
 */
router.get(
  '/my',
  authMiddleware,
  asyncHandler(enrollmentController.getMyEnrollments)
);

/**
 * POST /api/public/enrollments
 * Create enrollment (requires authentication)
 * Body: { courseId, packageType? }
 */
router.post(
  '/',
  authMiddleware,
  asyncHandler(enrollmentController.createEnrollment)
);

/**
 * DELETE /api/public/enrollments/:id
 * Cancel enrollment (requires authentication)
 */
router.delete(
  '/:id',
  authMiddleware,
  asyncHandler(enrollmentController.cancelEnrollment)
);

/**
 * GET /api/public/enrollments/:id/progress
 * Get enrollment progress (requires authentication)
 */
router.get(
  '/:id/progress',
  authMiddleware,
  asyncHandler(enrollmentController.getEnrollmentProgress)
);

export default router;

