import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getTrackingScripts,
  getActiveScripts,
  getTrackingScriptById,
  createTrackingScript,
  updateTrackingScript,
  deleteTrackingScript,
  toggleTrackingScript,
} from '../controllers/trackingScriptController';

const router = Router();

// Public endpoint - Get active scripts for frontend
router.get('/active', getActiveScripts);

// Protected routes - require auth (admin)
router.get('/', authMiddleware, getTrackingScripts);
router.get('/:id', authMiddleware, getTrackingScriptById);
router.post('/', authMiddleware, createTrackingScript);
router.put('/:id', authMiddleware, updateTrackingScript);
router.patch('/:id', authMiddleware, updateTrackingScript);
router.delete('/:id', authMiddleware, deleteTrackingScript);
router.patch('/:id/toggle', authMiddleware, toggleTrackingScript);

export default router;


