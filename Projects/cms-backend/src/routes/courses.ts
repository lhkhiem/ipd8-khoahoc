import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseModules,
  getCourseSessions,
  getCourseMaterials,
  addCourseModule,
  addCourseSession,
} from '../controllers/courseController';

const router = Router();

router.get('/', authMiddleware, getCourses);
router.get('/:id', authMiddleware, getCourseById);
router.post('/', authMiddleware, createCourse);
router.put('/:id', authMiddleware, updateCourse);
router.delete('/:id', authMiddleware, deleteCourse);
router.get('/:id/modules', authMiddleware, getCourseModules);
router.get('/:id/sessions', authMiddleware, getCourseSessions);
router.get('/:id/materials', authMiddleware, getCourseMaterials);
router.post('/:id/modules', authMiddleware, addCourseModule);
router.post('/:id/sessions', authMiddleware, addCourseSession);

export default router;
















