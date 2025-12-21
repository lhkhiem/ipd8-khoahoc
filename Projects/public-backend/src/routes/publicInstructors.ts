/**
 * Public Instructors Routes
 * Skeleton routes for public instructors API
 * TODO: Implement controllers and business logic after models are ready
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as instructorController from '../controllers/instructorController';

const router = Router();

/**
 * GET /api/public/instructors
 * Get list of instructors (with pagination, filtering)
 * Query params: page, limit, search, sort
 */
router.get(
  '/',
  asyncHandler(instructorController.getInstructors)
);

/**
 * GET /api/public/instructors/:id
 * Get instructor details by ID
 */
router.get(
  '/:id',
  asyncHandler(instructorController.getInstructorById)
);

/**
 * GET /api/public/instructors/:id/courses
 * Get courses by instructor
 */
router.get(
  '/:id/courses',
  asyncHandler(instructorController.getInstructorCourses)
);

export default router;

