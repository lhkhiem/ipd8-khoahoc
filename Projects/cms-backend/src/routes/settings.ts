import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getNamespace, putNamespace, clearCache, resetDefaults } from '../controllers/settingsController';

const router = Router();

router.get('/:namespace', authMiddleware, getNamespace);
router.put('/:namespace', authMiddleware, putNamespace);
router.post('/clear-cache', authMiddleware, clearCache);
router.post('/reset-default', authMiddleware, resetDefaults);

export default router;
