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
  updateCourseModule,
  deleteCourseModule,
  reorderCourseModules,
  addCourseSession,
  updateCourseSession,
  deleteCourseSession,
  updateCourseSessionStatus,
  addCourseMaterial,
  updateCourseMaterial,
  deleteCourseMaterial,
} from '../controllers/courseController';
import { uploadMaterial } from '../utils/multerMaterials';

const router = Router();

// Course CRUD
router.get('/', authMiddleware, getCourses);
router.get('/:id', authMiddleware, getCourseById);
router.post('/', authMiddleware, createCourse);
router.put('/:id', authMiddleware, updateCourse);
router.delete('/:id', authMiddleware, deleteCourse);

// Modules
router.get('/:id/modules', authMiddleware, getCourseModules);
router.post('/:id/modules', authMiddleware, addCourseModule);
router.put('/:id/modules/:moduleId', authMiddleware, updateCourseModule);
router.delete('/:id/modules/:moduleId', authMiddleware, deleteCourseModule);
router.put('/:id/modules/reorder', authMiddleware, reorderCourseModules);

// Sessions
router.get('/:id/sessions', authMiddleware, getCourseSessions);
router.post('/:id/sessions', authMiddleware, addCourseSession);
router.put('/:id/sessions/:sessionId', authMiddleware, updateCourseSession);
router.delete('/:id/sessions/:sessionId', authMiddleware, deleteCourseSession);
router.put('/:id/sessions/:sessionId/status', authMiddleware, updateCourseSessionStatus);

// Materials
router.get('/:id/materials', authMiddleware, getCourseMaterials);
router.post('/:id/materials', authMiddleware, uploadMaterial.single('file'), addCourseMaterial);
router.put('/:id/materials/:materialId', authMiddleware, uploadMaterial.single('file'), updateCourseMaterial);
router.delete('/:id/materials/:materialId', authMiddleware, deleteCourseMaterial);

export default router;
















