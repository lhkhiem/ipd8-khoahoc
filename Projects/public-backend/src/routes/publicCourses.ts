/**
 * Public Courses Routes
 * Skeleton routes for public courses API
 * TODO: Implement controllers and business logic after models are ready
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { optionalAuthMiddleware } from '../middleware/auth';
import * as courseController from '../controllers/courseController';

const router = Router();

/**
 * GET /api/public/courses
 * Get list of courses (with pagination, filtering, search)
 * Query params: page, limit, search, category, instructor, sort
 */
router.get(
  '/',
  asyncHandler(courseController.getCourses)
);

/**
 * GET /api/public/courses/:id
 * Get course details by ID
 */
router.get(
  '/:id',
  asyncHandler(courseController.getCourseById)
);

/**
 * GET /api/public/courses/:id/modules
 * Get course modules (access control: enrolled users only)
 */
router.get(
  '/:id/modules',
  optionalAuthMiddleware,
  asyncHandler(courseController.getCourseModules)
);

/**
 * GET /api/public/courses/:id/sessions
 * Get course sessions (access control: enrolled users only)
 */
router.get(
  '/:id/sessions',
  optionalAuthMiddleware,
  asyncHandler(courseController.getCourseSessions)
);

/**
 * GET /api/public/courses/:id/materials
 * Get course materials (access control: enrolled users only)
 */
router.get(
  '/:id/materials',
  optionalAuthMiddleware,
  asyncHandler(courseController.getCourseMaterials)
);

export default router;

