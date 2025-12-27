import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth';
import Course from '../models/Course';
import CourseModule from '../models/CourseModule';
import CourseSession from '../models/CourseSession';
import Material from '../models/Material';
import Instructor from '../models/Instructor';

// List courses
export const getCourses = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', search, status, featured, instructor_id } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (status) where.status = status;
    if (featured === 'true') where.featured = true;
    if (instructor_id) where.instructor_id = instructor_id;

    const { count, rows } = await Course.findAndCountAll({
      where,
      include: [
        {
          model: Instructor,
          as: 'instructor',
          attributes: ['id', 'title', 'credentials'],
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
    console.error('[getCourses] Error:', err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

// Get course by ID
export const getCourseById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id, {
      include: [
        {
          model: Instructor,
          as: 'instructor',
          attributes: ['id', 'title', 'credentials', 'bio'],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ data: course });
  } catch (err) {
    console.error('[getCourseById] Error:', err);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

// Create course
export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!actor || (actor.role !== 'admin' && actor.role !== 'instructor')) {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const {
      slug,
      title,
      target_audience,
      description,
      benefits_mom,
      benefits_baby,
      price,
      price_type,
      duration_minutes,
      mode,
      status,
      featured,
      thumbnail_url,
      video_url,
      instructor_id,
      seo_title,
      seo_description,
    } = req.body;

    if (!slug || !title || !target_audience || !description || !price || !duration_minutes) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if slug exists
    const existing = await Course.findOne({ where: { slug } });
    if (existing) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    const course = await Course.create({
      slug,
      title,
      target_audience,
      description,
      benefits_mom,
      benefits_baby,
      price,
      price_type: price_type || 'one-off',
      duration_minutes,
      mode: mode || 'group',
      status: status || 'draft',
      featured: featured || false,
      thumbnail_url,
      video_url,
      instructor_id,
      seo_title,
      seo_description,
    });

    res.status(201).json({ data: course });
  } catch (err) {
    console.error('[createCourse] Error:', err);
    res.status(500).json({ error: 'Failed to create course' });
  }
};

// Update course
export const updateCourse = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!actor || (actor.role !== 'admin' && actor.role !== 'instructor')) {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await course.update(req.body);
    res.json({ data: course });
  } catch (err) {
    console.error('[updateCourse] Error:', err);
    res.status(500).json({ error: 'Failed to update course' });
  }
};

// Delete course
export const deleteCourse = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await course.destroy();
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('[deleteCourse] Error:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};

// Get course modules
export const getCourseModules = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const modules = await CourseModule.findAll({
      where: { course_id: id },
      order: [['order', 'ASC']],
    });

    res.json({ data: modules });
  } catch (err) {
    console.error('[getCourseModules] Error:', err);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
};

// Get course sessions
export const getCourseSessions = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const sessions = await CourseSession.findAll({
      where: { course_id: id },
      order: [['start_time', 'ASC']],
    });

    res.json({ data: sessions });
  } catch (err) {
    console.error('[getCourseSessions] Error:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

// Get course materials
export const getCourseMaterials = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const materials = await Material.findAll({
      where: { course_id: id },
      order: [['created_at', 'DESC']],
    });

    res.json({ data: materials });
  } catch (err) {
    console.error('[getCourseMaterials] Error:', err);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
};

// Add module to course
export const addCourseModule = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!actor || (actor.role !== 'admin' && actor.role !== 'instructor')) {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id } = req.params;
    const { title, description, duration_minutes, order } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Missing required field: title' });
    }

    const module = await CourseModule.create({
      course_id: id,
      title,
      description,
      duration_minutes,
      order: order || 0,
    });

    res.status(201).json({ data: module });
  } catch (err) {
    console.error('[addCourseModule] Error:', err);
    res.status(500).json({ error: 'Failed to add module' });
  }
};

// Add session to course
export const addCourseSession = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!actor || (actor.role !== 'admin' && actor.role !== 'instructor')) {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id } = req.params;
    const {
      title,
      description,
      start_time,
      end_time,
      location,
      capacity,
      instructor_id,
      meeting_link,
      meeting_type,
      order,
    } = req.body;

    if (!title || !start_time || !end_time) {
      return res.status(400).json({ error: 'Missing required fields: title, start_time, end_time' });
    }

    const session = await CourseSession.create({
      course_id: id,
      title,
      description,
      start_time,
      end_time,
      location,
      capacity: capacity || 10,
      instructor_id,
      meeting_link,
      meeting_type,
      order,
      status: 'scheduled',
      enrolled_count: 0,
    });

    res.status(201).json({ data: session });
  } catch (err) {
    console.error('[addCourseSession] Error:', err);
    res.status(500).json({ error: 'Failed to add session' });
  }
};












