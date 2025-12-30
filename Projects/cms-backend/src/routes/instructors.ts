import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getInstructors,
  getInstructorById,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  getInstructorCourses,
} from '../controllers/instructorController';

const router = Router();

router.get('/', authMiddleware, getInstructors);
router.get('/:id', authMiddleware, getInstructorById);
router.post('/', authMiddleware, createInstructor);
router.put('/:id', authMiddleware, updateInstructor);
router.delete('/:id', authMiddleware, deleteInstructor);
router.get('/:id/courses', authMiddleware, getInstructorCourses);

export default router;
















