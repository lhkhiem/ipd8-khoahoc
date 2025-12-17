import { Router } from 'express';
import * as aboutSectionController from '../controllers/aboutSectionController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes (for frontend)
router.get('/', aboutSectionController.getAllAboutSections);
router.get('/key/:key', aboutSectionController.getAboutSectionByKey);
router.get('/:id', aboutSectionController.getAboutSectionById);

// Protected routes (require authentication)
router.post('/', authMiddleware, aboutSectionController.createAboutSection);
router.put('/:id', authMiddleware, aboutSectionController.updateAboutSection);
router.delete('/:id', authMiddleware, aboutSectionController.deleteAboutSection);

export default router;

