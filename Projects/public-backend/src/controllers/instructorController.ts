/**
 * Instructor Controller for Public Backend
 * - Public instructors API
 * - List, detail, courses
 */

import { Response } from 'express';
import Instructor from '../models/Instructor';
import Course from '../models/Course';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

/**
 * Get instructors list
 * GET /api/public/instructors
 * Query: page, limit, search, featured, sort
 */
export const getInstructors = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const featured = req.query.featured === 'true';
    const sort = (req.query.sort as string) || 'rating';

    // Build where clause
    const where: any = {};

    if (search) {
      where[Op.or] = [
        { credentials: { [Op.iLike]: `%${search}%` } },
        { bio: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (featured) {
      where.is_featured = true;
    }

    // Get instructors
    const { count, rows } = await Instructor.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sort, 'DESC']],
      include: [
        {
          association: 'user',
          attributes: ['id', 'name', 'email', 'avatar_url'],
        },
      ],
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
    console.error('[InstructorController] GetInstructors error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch instructors',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

/**
 * Get instructor detail
 * GET /api/public/instructors/:id
 */
export const getInstructorById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const instructor = await Instructor.findByPk(id, {
      include: [
        {
          association: 'user',
          attributes: ['id', 'name', 'email', 'avatar_url'],
        },
      ],
    });

    if (!instructor) {
      return res.status(404).json({
        success: false,
        error: 'Instructor not found',
      });
    }

    res.json({
      success: true,
      data: instructor,
    });
  } catch (error: any) {
    console.error('[InstructorController] GetInstructorById error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch instructor',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

/**
 * Get instructor courses
 * GET /api/public/instructors/:id/courses
 */
export const getInstructorCourses = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Check if instructor exists
    const instructor = await Instructor.findByPk(id);
    if (!instructor) {
      return res.status(404).json({
        success: false,
        error: 'Instructor not found',
      });
    }

    // Get courses
    const { count, rows } = await Course.findAndCountAll({
      where: {
        instructor_id: id,
        status: 'published',
      },
      limit,
      offset,
      order: [['created_at', 'DESC']],
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
    console.error('[InstructorController] GetInstructorCourses error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch courses',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};























