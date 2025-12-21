import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
  getEnrollmentProgress,
  updateEnrollmentProgress,
} from '../controllers/enrollmentController';

const router = Router();

router.get('/', authMiddleware, getEnrollments);
router.get('/:id', authMiddleware, getEnrollmentById);
router.post('/', authMiddleware, createEnrollment);
router.put('/:id', authMiddleware, updateEnrollment);
router.delete('/:id', authMiddleware, deleteEnrollment);
router.get('/:id/progress', authMiddleware, getEnrollmentProgress);
router.put('/:id/progress', authMiddleware, updateEnrollmentProgress);

export default router;




