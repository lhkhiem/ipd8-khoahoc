/**
 * Public User Profile Routes
 * Skeleton routes for user profile management
 * TODO: Implement controllers and business logic after models are ready
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';
import { uploadAvatar } from '../middleware/upload';
import * as profileController from '../controllers/profileController';

const router = Router();

/**
 * GET /api/public/profile
 * Get user profile (requires authentication)
 */
router.get(
  '/',
  authMiddleware,
  asyncHandler(profileController.getProfile)
);

/**
 * PUT /api/public/profile
 * Update user profile (requires authentication)
 * Body: { name?, phone?, avatar? }
 */
router.put(
  '/',
  authMiddleware,
  asyncHandler(profileController.updateProfile)
);

/**
 * POST /api/public/profile/change-password
 * Change password (requires authentication)
 * Body: { currentPassword, newPassword }
 */
router.post(
  '/change-password',
  authMiddleware,
  asyncHandler(profileController.changePassword)
);

/**
 * POST /api/public/profile/avatar
 * Upload avatar (requires authentication)
 * Body: multipart/form-data with file
 */
router.post(
  '/avatar',
  authMiddleware,
  uploadAvatar.single('avatar'), // 'avatar' is the field name in form-data
  asyncHandler(profileController.uploadAvatar)
);

export default router;

