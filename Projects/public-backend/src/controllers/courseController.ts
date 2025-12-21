/**
 * Course Controller for Public Backend
 * - Public courses API
 * - List, detail, modules, sessions, materials
 */

import { Response } from 'express';
import { Op } from 'sequelize';
import Course from '../models/Course';
import CourseModule from '../models/CourseModule';
import CourseSession from '../models/CourseSession';
import Material from '../models/Material';
import Enrollment from '../models/Enrollment';
import { AuthRequest } from '../middleware/auth';

/**
 * Get courses list
 * GET /api/public/courses
 * Query: page, limit, search, target_audience, instructor_id, sort, featured
 */
export const getCourses = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const targetAudience = req.query.target_audience as string;
    const instructorId = req.query.instructor_id as string;
    const featured = req.query.featured === 'true';
    const sort = (req.query.sort as string) || 'created_at';

    // Build where clause
    const where: any = {
      status: 'published', // Only show published courses
    };

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (targetAudience) {
      where.target_audience = targetAudience;
    }

    if (instructorId) {
      where.instructor_id = instructorId;
    }

    if (featured) {
      where.featured = true;
    }

    // Get courses
    const { count, rows } = await Course.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sort, 'DESC']],
      attributes: {
        exclude: ['seo_title', 'seo_description'], // Exclude SEO fields from list
      },
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error: any) {
    console.error('[CourseController] GetCourses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch courses',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

/**
 * Get course detail
 * GET /api/public/courses/:id
 */
export const getCourseById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [
        {
          association: 'instructor',
          attributes: ['id', 'title', 'credentials', 'bio', 'rating', 'is_featured'],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    // Only show published courses
    if (course.status !== 'published') {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    console.error('[CourseController] GetCourseById error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch course',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

/**
 * Get course modules
 * GET /api/public/courses/:id/modules
 * Access control: enrolled users only (optional auth)
 */
export const getCourseModules = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check if course exists and is published
    const course = await Course.findByPk(id);
    if (!course || course.status !== 'published') {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    // Check enrollment if user is authenticated
    if (userId) {
      const enrollment = await Enrollment.findOne({
        where: {
          user_id: userId,
          course_id: id,
          status: 'active',
        },
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          error: 'You must be enrolled in this course to view modules',
        });
      }
    } else {
      // Not authenticated - return empty or limited data
      return res.status(401).json({
        success: false,
        error: 'Authentication required to view modules',
      });
    }

    // Get modules
    const modules = await CourseModule.findAll({
      where: { course_id: id },
      order: [['order', 'ASC']],
    });

    res.json({
      success: true,
      data: modules,
    });
  } catch (error: any) {
    console.error('[CourseController] GetCourseModules error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch modules',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

/**
 * Get course sessions
 * GET /api/public/courses/:id/sessions
 * Access control: enrolled users only (optional auth)
 */
export const getCourseSessions = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check if course exists and is published
    const course = await Course.findByPk(id);
    if (!course || course.status !== 'published') {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    // Check enrollment if user is authenticated
    if (userId) {
      const enrollment = await Enrollment.findOne({
        where: {
          user_id: userId,
          course_id: id,
          status: 'active',
        },
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          error: 'You must be enrolled in this course to view sessions',
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        error: 'Authentication required to view sessions',
      });
    }

    // Get sessions
    const sessions = await CourseSession.findAll({
      where: {
        course_id: id,
        status: { [Op.ne]: 'cancelled' }, // Exclude cancelled sessions
      },
      order: [['start_time', 'ASC']],
      include: [
        {
          association: 'instructor',
          attributes: ['id', 'title', 'credentials'],
        },
      ],
    });

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error: any) {
    console.error('[CourseController] GetCourseSessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sessions',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

/**
 * Get course materials
 * GET /api/public/courses/:id/materials
 * Access control: enrolled users only (optional auth)
 */
export const getCourseMaterials = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check if course exists and is published
    const course = await Course.findByPk(id);
    if (!course || course.status !== 'published') {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    // Get materials based on visibility
    const where: any = { course_id: id };

    if (userId) {
      // Check enrollment
      const enrollment = await Enrollment.findOne({
        where: {
          user_id: userId,
          course_id: id,
          status: 'active',
        },
      });

      if (enrollment) {
        // Enrolled users can see all materials
        // No additional filter needed
      } else {
        // Not enrolled - only show public materials
        where.visibility = 'public';
      }
    } else {
      // Not authenticated - only show public materials
      where.visibility = 'public';
    }

    const materials = await Material.findAll({
      where,
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: materials,
    });
  } catch (error: any) {
    console.error('[CourseController] GetCourseMaterials error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch materials',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

