import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  submitContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
  getContactStats,
} from '../controllers/contactController';

const router = Router();

// Public route - submit contact form
router.post('/', submitContact);

// Admin routes - require authentication
router.get('/stats', authMiddleware, getContactStats);
router.get('/', authMiddleware, getContacts);
router.get('/:id', authMiddleware, getContactById);
router.put('/:id', authMiddleware, updateContact);
router.delete('/:id', authMiddleware, deleteContact);

export default router;







