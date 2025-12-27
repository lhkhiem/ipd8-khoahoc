import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getPayments,
  getPaymentById,
  handlePaymentCallback,
} from '../controllers/paymentController';

const router = Router();

router.get('/', authMiddleware, getPayments);
router.get('/:id', authMiddleware, getPaymentById);
router.post('/callback', handlePaymentCallback); // No auth required for payment gateway callbacks

export default router;












