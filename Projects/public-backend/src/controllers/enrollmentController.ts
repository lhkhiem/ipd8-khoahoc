/**
 * Enrollment Controller for Public Backend
 * - User enrollment management
 * - My enrollments, create, cancel, progress
 */

import { Response } from 'express';
import Enrollment from '../models/Enrollment';
import Course from '../models/Course';
import Progress from '../models/Progress';
import { AuthRequest } from '../middleware/auth';

/**
 * Get my enrollments
 * GET /api/public/enrollments/my
 * Requires authentication
 */
export const getMyEnrollments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const enrollments = await Enrollment.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          association: 'course',
          attributes: ['id', 'title', 'slug', 'thumbnail_url', 'price', 'duration_minutes'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: enrollments,
    });
  } catch (error: any) {
    console.error('[EnrollmentController] GetMyEnrollments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enrollments',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

/**
 * Create enrollment
 * POST /api/public/enrollments
 * Body: { courseId, type }
 * Requires authentication
 */
export const createEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const { courseId, type } = req.body;

    if (!courseId || !type) {
      return res.status(400).json({
        success: false,
        error: 'courseId and type are required',
      });
    }

    // Check if course exists and is published
    const course = await Course.findByPk(courseId);
    if (!course || course.status !== 'published') {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: {
        user_id: req.user.id,
        course_id: courseId,
      },
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: 'Already enrolled in this course',
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      user_id: req.user.id,
      course_id: courseId,
      type,
      status: 'pending', // Will be activated after payment
      progress_percent: 0,
    });

    res.status(201).json({
      success: true,
      data: enrollment,
    });
  } catch (error: any) {
    console.error('[EnrollmentController] CreateEnrollment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create enrollment',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

/**
 * Cancel enrollment
 * DELETE /api/public/enrollments/:id
 * Requires authentication
 */
export const cancelEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const { id } = req.params;

    const enrollment = await Enrollment.findOne({
      where: {
        id,
        user_id: req.user.id,
      },
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found',
      });
    }

    // Update status to cancelled
    await enrollment.update({ status: 'cancelled' });

    res.json({
      success: true,
      message: 'Enrollment cancelled successfully',
    });
  } catch (error: any) {
    console.error('[EnrollmentController] CancelEnrollment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel enrollment',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

/**
 * Get enrollment progress
 * GET /api/public/enrollments/:id/progress
 * Requires authentication
 */
export const getEnrollmentProgress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const { id } = req.params;

    const enrollment = await Enrollment.findOne({
      where: {
        id,
        user_id: req.user.id,
      },
      include: [
        {
          association: 'progresses',
          include: [
            {
              association: 'module',
              attributes: ['id', 'title', 'order'],
            },
            {
              association: 'session',
              attributes: ['id', 'title', 'start_time', 'end_time'],
            },
          ],
        },
      ],
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found',
      });
    }

    // Type assertion: enrollment.progresses exists after include
    const enrollmentWithProgresses = enrollment as any;

    res.json({
      success: true,
      data: {
        enrollment: {
          id: enrollment.id,
          progress_percent: enrollment.progress_percent,
          status: enrollment.status,
        },
        progresses: enrollmentWithProgresses.progresses || [],
      },
    });
  } catch (error: any) {
    console.error('[EnrollmentController] GetEnrollmentProgress error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};


