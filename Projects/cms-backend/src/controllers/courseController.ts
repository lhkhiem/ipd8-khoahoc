import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth';
import Course from '../models/Course';
import CourseModule from '../models/CourseModule';
import CourseSession from '../models/CourseSession';
import Material from '../models/Material';
import Instructor from '../models/Instructor';
import path from 'path';
import fs from 'fs';
import { MATERIALS_UPLOAD_PATH } from '../utils/multerMaterials';

// Helper function to check if user has permission to manage courses
// Note: User model only supports 'guest', 'student', 'instructor', 'admin'
// So we only check for 'admin' and 'instructor' (owner is not a valid role in DB)
const canManageCourses = (actor: any): boolean => {
  if (!actor || !actor.role) return false;
  // Allow admin and instructor to manage courses
  return actor.role === 'admin' || actor.role === 'instructor';
};

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
    
    // Debug logging
    console.log('[createCourse] Actor:', {
      id: actor?.id,
      email: actor?.email,
      role: actor?.role,
      hasActor: !!actor,
    });
    
    // Allow admin and instructor to create courses
    // Note: 'owner' role doesn't exist in User model, only 'admin', 'instructor', 'student', 'guest'
    if (!canManageCourses(actor)) {
      console.error('[createCourse] Permission denied:', {
        actorRole: actor?.role,
        actorId: actor?.id,
        actorEmail: actor?.email,
        hasActor: !!actor,
        allowedRoles: ['admin', 'instructor'],
      });
      return res.status(403).json({ 
        error: 'Insufficient permission. Only admin or instructor can create courses.',
        userRole: actor?.role || 'none',
        requiredRoles: ['admin', 'instructor'],
      });
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
    // Allow owner, admin, and instructor to update courses
    if (!canManageCourses(actor)) {
      return res.status(403).json({ error: 'Insufficient permission. Only owner, admin, or instructor can update courses.' });
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
    if (!canManageCourses(actor)) {
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
    if (!canManageCourses(actor)) {
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

// Update module
export const updateCourseModule = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!canManageCourses(actor)) {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id, moduleId } = req.params;
    const { title, description, duration_minutes, order } = req.body;

    const module = await CourseModule.findOne({
      where: {
        id: moduleId,
        course_id: id,
      },
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    await module.update({
      title: title !== undefined ? title : module.title,
      description: description !== undefined ? description : module.description,
      duration_minutes: duration_minutes !== undefined ? duration_minutes : module.duration_minutes,
      order: order !== undefined ? order : module.order,
    });

    res.json({ data: module });
  } catch (err) {
    console.error('[updateCourseModule] Error:', err);
    res.status(500).json({ error: 'Failed to update module' });
  }
};

// Delete module
export const deleteCourseModule = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!canManageCourses(actor)) {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id, moduleId } = req.params;

    const module = await CourseModule.findOne({
      where: {
        id: moduleId,
        course_id: id,
      },
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    await module.destroy();
    res.json({ message: 'Module deleted successfully' });
  } catch (err) {
    console.error('[deleteCourseModule] Error:', err);
    res.status(500).json({ error: 'Failed to delete module' });
  }
};

// Reorder modules
export const reorderCourseModules = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!canManageCourses(actor)) {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id } = req.params;
    const { moduleIds } = req.body;

    if (!Array.isArray(moduleIds)) {
      return res.status(400).json({ error: 'moduleIds must be an array' });
    }

    // Update order for each module
    const updatePromises = moduleIds.map((moduleId: string, index: number) => {
      return CourseModule.update(
        { order: index },
        {
          where: {
            id: moduleId,
            course_id: id,
          },
        }
      );
    });

    await Promise.all(updatePromises);

    // Fetch updated modules
    const modules = await CourseModule.findAll({
      where: { course_id: id },
      order: [['order', 'ASC']],
    });

    res.json({ data: modules });
  } catch (err) {
    console.error('[reorderCourseModules] Error:', err);
    res.status(500).json({ error: 'Failed to reorder modules' });
  }
};

// Update session
export const updateCourseSession = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!canManageCourses(actor)) {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id, sessionId } = req.params;
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

    const session = await CourseSession.findOne({
      where: {
        id: sessionId,
        course_id: id,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await session.update({
      title: title !== undefined ? title : session.title,
      description: description !== undefined ? description : session.description,
      start_time: start_time !== undefined ? start_time : session.start_time,
      end_time: end_time !== undefined ? end_time : session.end_time,
      location: location !== undefined ? location : session.location,
      capacity: capacity !== undefined ? capacity : session.capacity,
      instructor_id: instructor_id !== undefined ? instructor_id : session.instructor_id,
      meeting_link: meeting_link !== undefined ? meeting_link : session.meeting_link,
      meeting_type: meeting_type !== undefined ? meeting_type : session.meeting_type,
      order: order !== undefined ? order : session.order,
    });

    res.json({ data: session });
  } catch (err) {
    console.error('[updateCourseSession] Error:', err);
    res.status(500).json({ error: 'Failed to update session' });
  }
};

// Delete session
export const deleteCourseSession = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!canManageCourses(actor)) {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id, sessionId } = req.params;

    const session = await CourseSession.findOne({
      where: {
        id: sessionId,
        course_id: id,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if session has registrations (optional - can be implemented later)
    // const registrations = await SessionRegistration.count({ where: { session_id: sessionId } });
    // if (registrations > 0) {
    //   return res.status(400).json({ error: 'Cannot delete session with existing registrations' });
    // }

    await session.destroy();
    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    console.error('[deleteCourseSession] Error:', err);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};

// Update session status
export const updateCourseSessionStatus = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!canManageCourses(actor)) {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id, sessionId } = req.params;
    const { status } = req.body;

    if (!status || !['scheduled', 'full', 'cancelled', 'done'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be: scheduled, full, cancelled, or done' });
    }

    const session = await CourseSession.findOne({
      where: {
        id: sessionId,
        course_id: id,
      },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await session.update({ status });
    res.json({ data: session });
  } catch (err) {
    console.error('[updateCourseSessionStatus] Error:', err);
    res.status(500).json({ error: 'Failed to update session status' });
  }
};

// Add material to course
export const addCourseMaterial = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!canManageCourses(actor)) {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id } = req.params;
    const file = (req as any).file as Express.Multer.File;
    const { title, visibility, provider } = req.body;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!title) {
      // Delete uploaded file if title is missing
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({ error: 'Missing required field: title' });
    }

    // Verify course exists
    const course = await Course.findByPk(id);
    if (!course) {
      // Delete uploaded file if course doesn't exist
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(404).json({ error: 'Course not found' });
    }

    // Generate file URL (relative to shared-storage)
    const fileKey = path.relative(MATERIALS_UPLOAD_PATH, file.path);
    const fileUrl = `/uploads/materials/${fileKey}`;

    const material = await Material.create({
      course_id: id,
      title,
      file_key: fileKey,
      file_url: fileUrl,
      mime_type: file.mimetype,
      size: file.size,
      visibility: visibility || 'enrolled',
      provider: provider || 'local',
      download_count: 0,
    });

    res.status(201).json({ data: material });
  } catch (err) {
    console.error('[addCourseMaterial] Error:', err);
    // Clean up uploaded file on error
    const file = (req as any).file;
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    res.status(500).json({ error: 'Failed to add material' });
  }
};

// Update material
export const updateCourseMaterial = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!canManageCourses(actor)) {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id, materialId } = req.params;
    const { title, visibility } = req.body;
    const file = (req as any).file as Express.Multer.File;

    const material = await Material.findOne({
      where: {
        id: materialId,
        course_id: id,
      },
    });

    if (!material) {
      // Delete uploaded file if material doesn't exist
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(404).json({ error: 'Material not found' });
    }

    // If new file is uploaded, delete old file and update
    if (file) {
      const oldFilePath = path.join(MATERIALS_UPLOAD_PATH, material.file_key);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      const fileKey = path.relative(MATERIALS_UPLOAD_PATH, file.path);
      const fileUrl = `/uploads/materials/${fileKey}`;

      await material.update({
        title: title !== undefined ? title : material.title,
        visibility: visibility !== undefined ? visibility : material.visibility,
        file_key: fileKey,
        file_url: fileUrl,
        mime_type: file.mimetype,
        size: file.size,
      });
    } else {
      // Only update title and visibility if no new file
      await material.update({
        title: title !== undefined ? title : material.title,
        visibility: visibility !== undefined ? visibility : material.visibility,
      });
    }

    res.json({ data: material });
  } catch (err) {
    console.error('[updateCourseMaterial] Error:', err);
    const file = (req as any).file;
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    res.status(500).json({ error: 'Failed to update material' });
  }
};

// Delete material
export const deleteCourseMaterial = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!canManageCourses(actor)) {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id, materialId } = req.params;

    const material = await Material.findOne({
      where: {
        id: materialId,
        course_id: id,
      },
    });

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Delete file from storage
    const filePath = path.join(MATERIALS_UPLOAD_PATH, material.file_key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete database record
    await material.destroy();
    res.json({ message: 'Material deleted successfully' });
  } catch (err) {
    console.error('[deleteCourseMaterial] Error:', err);
    res.status(500).json({ error: 'Failed to delete material' });
  }
};
















