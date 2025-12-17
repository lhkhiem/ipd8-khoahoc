import { Router } from 'express';
import * as newsletterController from '../controllers/newsletterController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/subscribe', newsletterController.subscribe);
router.post('/unsubscribe', newsletterController.unsubscribe);

// Admin routes (require authentication)
router.get('/subscribers', authMiddleware, newsletterController.getSubscribers);
router.get('/statistics', authMiddleware, newsletterController.getStatistics);
router.delete('/subscribers/:id', authMiddleware, newsletterController.deleteSubscriber);

export default router;

