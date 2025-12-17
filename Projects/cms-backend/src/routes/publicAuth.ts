// Public Auth Routes
// Customer authentication endpoints

import { Router } from 'express';
import * as authController from '../controllers/public/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public routes (no auth required)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

// Protected routes (auth required)
router.get('/me', authMiddleware, authController.me);
router.post('/logout', authMiddleware, authController.logout);

export default router;

