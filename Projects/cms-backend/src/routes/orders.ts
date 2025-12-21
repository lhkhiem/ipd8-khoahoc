import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  payOrder,
} from '../controllers/orderController';

const router = Router();

router.get('/', authMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrderById);
router.post('/', authMiddleware, createOrder);
router.put('/:id', authMiddleware, updateOrder);
router.post('/:id/pay', authMiddleware, payOrder);

export default router;
