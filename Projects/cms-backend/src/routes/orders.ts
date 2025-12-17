import express from 'express';
import * as orderController from '../controllers/orderController';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Public routes - create order and lookup
// IMPORTANT: Specific routes (/phone/:phone, /number/:order_number) must come before generic routes (/:id)
router.post('/', orderController.createOrder);
router.get('/number/:order_number', orderController.getOrderByNumber);
router.get('/phone/:phone', (req, res, next) => {
  console.log('[Orders Router] /phone/:phone route matched, phone:', req.params.phone);
  next();
}, orderController.getOrdersByPhone); // Lookup orders by phone number

// Protected routes - require auth (admin only)
router.get('/', authMiddleware, orderController.getOrders);
router.get('/:id', authMiddleware, orderController.getOrderById);
router.put('/:id', authMiddleware, orderController.updateOrder);
router.delete('/:id', authMiddleware, orderController.deleteOrder);

export default router;

















