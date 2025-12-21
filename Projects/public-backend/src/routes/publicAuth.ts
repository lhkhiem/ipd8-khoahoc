/**
 * Public Authentication Routes
 * Skeleton routes for user authentication
 * TODO: Implement controllers and business logic after models are ready
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authRateLimiter } from '../middleware/rateLimiter';
import { validateRequired, validateEmail } from '../middleware/inputValidator';
import { authMiddleware } from '../middleware/auth';
import * as authController from '../controllers/authController';

const router = Router();

/**
 * POST /api/public/auth/register
 * Register new user
 * Body: { email, password, name, phone? }
 */
router.post(
  '/register',
  authRateLimiter,
  validateRequired(['email', 'password', 'name']),
  validateEmail,
  asyncHandler(authController.register)
);

/**
 * POST /api/public/auth/login
 * Login user
 * Body: { email, password }
 */
router.post(
  '/login',
  authRateLimiter,
  validateRequired(['email', 'password']),
  validateEmail,
  asyncHandler(authController.login)
);

/**
 * POST /api/public/auth/google
 * Google OAuth login/register
 * Body: { idToken }
 */
router.post(
  '/google',
  authRateLimiter,
  asyncHandler(authController.googleAuth)
);

/**
 * POST /api/public/auth/logout
 * Logout user (requires authentication)
 */
router.post(
  '/logout',
  authMiddleware,
  asyncHandler(authController.logout)
);

/**
 * GET /api/public/auth/me
 * Get current user info (requires authentication)
 */
router.get(
  '/me',
  authMiddleware,
  asyncHandler(authController.getMe)
);

/**
 * POST /api/public/auth/forgot-password
 * Request password reset
 * Body: { email }
 */
router.post(
  '/forgot-password',
  authRateLimiter,
  validateRequired(['email']),
  validateEmail,
  asyncHandler(authController.forgotPassword)
);

/**
 * POST /api/public/auth/reset-password
 * Reset password with token
 * Body: { token, password }
 */
router.post(
  '/reset-password',
  authRateLimiter,
  validateRequired(['token', 'password']),
  asyncHandler(authController.resetPassword)
);

export default router;

