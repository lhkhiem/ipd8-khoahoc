import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Instructor from '../models/Instructor';
import User from '../models/User';
import Course from '../models/Course';

// List instructors
export const getInstructors = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', featured } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const where: any = {};
    if (featured === 'true') {
      where.is_featured = true;
    }

    const { count, rows } = await Instructor.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
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
    console.error('[getInstructors] Error:', err);
    res.status(500).json({ error: 'Failed to fetch instructors' });
  }
};

// Get instructor by ID
export const getInstructorById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const instructor = await Instructor.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'avatar_url'],
        },
      ],
    });

    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    res.json({ data: instructor });
  } catch (err) {
    console.error('[getInstructorById] Error:', err);
    res.status(500).json({ error: 'Failed to fetch instructor' });
  }
};

// Create instructor
export const createInstructor = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { user_id, title, credentials, bio, specialties, achievements, is_featured } = req.body;

    if (!user_id || !credentials) {
      return res.status(400).json({ error: 'Missing required fields: user_id, credentials' });
    }

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if instructor already exists for this user
    const existing = await Instructor.findOne({ where: { user_id } });
    if (existing) {
      return res.status(400).json({ error: 'Instructor already exists for this user' });
    }

    const instructor = await Instructor.create({
      user_id,
      title,
      credentials,
      bio,
      specialties: specialties ? JSON.stringify(specialties) : null,
      achievements: achievements ? JSON.stringify(achievements) : null,
      is_featured: is_featured || false,
      rating: 0.0,
      total_courses: 0,
    });

    res.status(201).json({ data: instructor });
  } catch (err) {
    console.error('[createInstructor] Error:', err);
    res.status(500).json({ error: 'Failed to create instructor' });
  }
};

// Update instructor
export const updateInstructor = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id } = req.params;
    const { title, credentials, bio, specialties, achievements, is_featured } = req.body;

    const instructor = await Instructor.findByPk(id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    await instructor.update({
      title,
      credentials,
      bio,
      specialties: specialties ? JSON.stringify(specialties) : undefined,
      achievements: achievements ? JSON.stringify(achievements) : undefined,
      is_featured,
    });

    res.json({ data: instructor });
  } catch (err) {
    console.error('[updateInstructor] Error:', err);
    res.status(500).json({ error: 'Failed to update instructor' });
  }
};

// Delete instructor
export const deleteInstructor = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id } = req.params;
    const instructor = await Instructor.findByPk(id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    await instructor.destroy();
    res.json({ message: 'Instructor deleted successfully' });
  } catch (err) {
    console.error('[deleteInstructor] Error:', err);
    res.status(500).json({ error: 'Failed to delete instructor' });
  }
};

// Get instructor courses
export const getInstructorCourses = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const instructor = await Instructor.findByPk(id);
    if (!instructor) {
      return res.status(404).json({ error: 'Instructor not found' });
    }

    const courses = await Course.findAll({
      where: { instructor_id: id },
      order: [['created_at', 'DESC']],
    });

    res.json({ data: courses });
  } catch (err) {
    console.error('[getInstructorCourses] Error:', err);
    res.status(500).json({ error: 'Failed to fetch instructor courses' });
  }
};












