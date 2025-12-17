import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { testEmailConfig, sendTestEmail } from '../controllers/emailController';

const router = Router();

// Test email configuration
router.get('/test', authMiddleware, testEmailConfig);

// Send test email
router.post('/test-send', authMiddleware, sendTestEmail);

export default router;







