// Public Orders Routes
// Customer order endpoints

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as orderController from '../controllers/orderController';

const router = Router();

// Get orders (auth required)
router.get('/', authMiddleware, orderController.getOrders);

// Get order by ID (auth required)
router.get('/:id', authMiddleware, orderController.getOrderById);

// Create order (public, but can include customer_id if authenticated)
router.post('/', orderController.createOrder);

// Get order by order number (public, for tracking)
router.get('/number/:order_number', orderController.getOrderByNumber);

export default router;

