/**
 * Payment Controller for Public Backend
 * - Order and payment management
 * - Create order, my orders, process payment, callbacks
 */

import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import Payment from '../models/Payment';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import { AuthRequest } from '../middleware/auth';

/**
 * Create order
 * POST /api/public/payments/orders
 * Body: { courseId, enrollmentType, paymentMethod }
 * Requires authentication
 */
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const { courseId, enrollmentType, paymentMethod } = req.body;

    if (!courseId || !enrollmentType || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'courseId, enrollmentType, and paymentMethod are required',
      });
    }

    // Check if course exists and is published
    const course = await Course.findByPk(courseId);
    if (!course || course.status !== 'published') {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create order
    const order = await Order.create({
      user_id: req.user.id,
      order_number: orderNumber,
      total_amount: course.price,
      status: 'pending',
      payment_method: paymentMethod,
    });

    // Create order item
    await OrderItem.create({
      order_id: order.id,
      course_id: courseId,
      enrollment_type: enrollmentType,
      price: course.price,
      quantity: 1,
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error('[PaymentController] CreateOrder error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

/**
 * Get my orders
 * GET /api/public/payments/orders/my
 * Requires authentication
 */
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          association: 'items',
          include: [
            {
              association: 'course',
              attributes: ['id', 'title', 'slug', 'thumbnail_url'],
            },
          ],
        },
        {
          association: 'payments',
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    console.error('[PaymentController] GetMyOrders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

/**
 * Process payment
 * POST /api/public/payments/payments
 * Body: { orderId, paymentMethod, ... }
 * Requires authentication
 */
export const processPayment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const { orderId, paymentMethod } = req.body;

    if (!orderId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'orderId and paymentMethod are required',
      });
    }

    // Find order
    const order = await Order.findOne({
      where: {
        id: orderId,
        user_id: req.user.id,
      },
      include: [{ association: 'items' }],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    // Create payment record
    const payment = await Payment.create({
      order_id: orderId,
      amount: order.total_amount,
      payment_method: paymentMethod,
      status: 'pending',
    });

    // TODO: Integrate with payment gateways (ZaloPay, VNPay, MoMo)
    // For now, return payment record

    res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment processing - TODO: Integrate with payment gateway',
    });
  } catch (error: any) {
    console.error('[PaymentController] ProcessPayment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
  }
};

/**
 * ZaloPay payment callback
 * POST /api/public/payments/callback/zalopay
 * No auth required (called by payment gateway)
 */
export const zalopayCallback = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Implement ZaloPay callback handling
    res.json({
      success: true,
      message: 'ZaloPay callback - TODO: Implement',
    });
  } catch (error: any) {
    console.error('[PaymentController] ZaloPayCallback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process callback',
    });
  }
};

/**
 * VNPay payment callback
 * POST /api/public/payments/callback/vnpay
 * No auth required (called by payment gateway)
 */
export const vnpayCallback = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Implement VNPay callback handling
    res.json({
      success: true,
      message: 'VNPay callback - TODO: Implement',
    });
  } catch (error: any) {
    console.error('[PaymentController] VNPayCallback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process callback',
    });
  }
};

/**
 * MoMo payment callback
 * POST /api/public/payments/callback/momo
 * No auth required (called by payment gateway)
 */
export const momoCallback = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Implement MoMo callback handling
    res.json({
      success: true,
      message: 'MoMo callback - TODO: Implement',
    });
  } catch (error: any) {
    console.error('[PaymentController] MoMoCallback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process callback',
    });
  }
};


















