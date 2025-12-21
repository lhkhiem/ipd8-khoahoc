/**
 * Public Payments Routes
 * Skeleton routes for payment management (user actions)
 * TODO: Implement controllers and business logic after models are ready
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authMiddleware } from '../middleware/auth';
import * as paymentController from '../controllers/paymentController';

const router = Router();

/**
 * POST /api/public/orders
 * Create order (requires authentication)
 * Body: { courseId, packageType, paymentMethod }
 */
router.post(
  '/orders',
  authMiddleware,
  asyncHandler(paymentController.createOrder)
);

/**
 * GET /api/public/orders/my
 * Get my orders (requires authentication)
 */
router.get(
  '/orders/my',
  authMiddleware,
  asyncHandler(paymentController.getMyOrders)
);

/**
 * POST /api/public/payments
 * Process payment (requires authentication)
 * Body: { orderId, paymentMethod, ... }
 */
router.post(
  '/payments',
  authMiddleware,
  asyncHandler(paymentController.processPayment)
);

/**
 * POST /api/public/payments/callback/zalopay
 * ZaloPay payment callback (no auth required)
 */
router.post(
  '/payments/callback/zalopay',
  asyncHandler(paymentController.zalopayCallback)
);

/**
 * POST /api/public/payments/callback/vnpay
 * VNPay payment callback (no auth required)
 */
router.post(
  '/payments/callback/vnpay',
  asyncHandler(paymentController.vnpayCallback)
);

/**
 * POST /api/public/payments/callback/momo
 * MoMo payment callback (no auth required)
 */
router.post(
  '/payments/callback/momo',
  asyncHandler(paymentController.momoCallback)
);

export default router;

