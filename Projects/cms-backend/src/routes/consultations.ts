import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  submitConsultation,
  getConsultations,
  getConsultationById,
  updateConsultation,
  deleteConsultation,
  getConsultationStats,
} from '../controllers/consultationController';

const router = Router();

// Public route - submit consultation form
router.post('/', submitConsultation);

// Admin routes - require authentication
router.get('/stats', authMiddleware, getConsultationStats);
router.get('/', authMiddleware, getConsultations);
router.get('/:id', authMiddleware, getConsultationById);
router.put('/:id', authMiddleware, updateConsultation);
router.delete('/:id', authMiddleware, deleteConsultation);

export default router;

