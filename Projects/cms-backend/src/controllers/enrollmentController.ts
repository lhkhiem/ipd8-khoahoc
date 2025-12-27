import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Enrollment from '../models/Enrollment';
import Progress from '../models/Progress';
import User from '../models/User';
import Course from '../models/Course';

// List enrollments
export const getEnrollments = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', status, user_id, course_id } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (user_id) where.user_id = user_id;
    if (course_id) where.course_id = course_id;

    const { count, rows } = await Enrollment.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'slug'],
        },
      ],
      limit: limitNum,
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (err) {
    console.error('[getEnrollments] Error:', err);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
};

// Get enrollment by ID
export const getEnrollmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
        },
        {
          model: Course,
          as: 'course',
        },
      ],
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    res.json({ data: enrollment });
  } catch (err) {
    console.error('[getEnrollmentById] Error:', err);
    res.status(500).json({ error: 'Failed to fetch enrollment' });
  }
};

// Create enrollment
export const createEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { user_id, course_id, type, status, start_date, end_date } = req.body;

    if (!user_id || !course_id || !type) {
      return res.status(400).json({ error: 'Missing required fields: user_id, course_id, type' });
    }

    // Check if enrollment already exists
    const existing = await Enrollment.findOne({ where: { user_id, course_id } });
    if (existing) {
      return res.status(400).json({ error: 'Enrollment already exists' });
    }

    const enrollment = await Enrollment.create({
      user_id,
      course_id,
      type,
      status: status || 'pending',
      start_date,
      end_date,
      progress_percent: 0.0,
    });

    res.status(201).json({ data: enrollment });
  } catch (err) {
    console.error('[createEnrollment] Error:', err);
    res.status(500).json({ error: 'Failed to create enrollment' });
  }
};

// Update enrollment
export const updateEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id } = req.params;
    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    await enrollment.update(req.body);
    res.json({ data: enrollment });
  } catch (err) {
    console.error('[updateEnrollment] Error:', err);
    res.status(500).json({ error: 'Failed to update enrollment' });
  }
};

// Delete enrollment
export const deleteEnrollment = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id } = req.params;
    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    await enrollment.destroy();
    res.json({ message: 'Enrollment deleted successfully' });
  } catch (err) {
    console.error('[deleteEnrollment] Error:', err);
    res.status(500).json({ error: 'Failed to delete enrollment' });
  }
};

// Get enrollment progress
export const getEnrollmentProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    const progresses = await Progress.findAll({
      where: { enrollment_id: id },
      order: [['created_at', 'DESC']],
    });

    res.json({
      data: {
        enrollment,
        progresses,
      },
    });
  } catch (err) {
    console.error('[getEnrollmentProgress] Error:', err);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};

// Update enrollment progress
export const updateEnrollmentProgress = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id } = req.params;
    const { progress_percent, module_id, session_id, feedback, completed_at } = req.body;

    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // Update enrollment progress_percent
    if (progress_percent !== undefined) {
      await enrollment.update({ progress_percent });
    }

    // Create or update progress record
    if (module_id || session_id) {
      const [progress] = await Progress.findOrCreate({
        where: {
          enrollment_id: id,
          module_id: module_id || null,
          session_id: session_id || null,
        },
        defaults: {
          enrollment_id: id,
          module_id,
          session_id,
          progress_percent: progress_percent || 0.0,
          feedback,
          completed_at,
        },
      });

      if (progress_percent !== undefined || feedback || completed_at) {
        await progress.update({
          progress_percent: progress_percent !== undefined ? progress_percent : progress.progress_percent,
          feedback,
          completed_at,
        });
      }

      res.json({ data: { enrollment, progress } });
    } else {
      res.json({ data: enrollment });
    }
  } catch (err) {
    console.error('[updateEnrollmentProgress] Error:', err);
    res.status(500).json({ error: 'Failed to update progress' });
  }
};











