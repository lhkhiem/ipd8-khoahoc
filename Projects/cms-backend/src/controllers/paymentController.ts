import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Payment from '../models/Payment';
import Order from '../models/Order';

// List payments
export const getPayments = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', status, payment_method, order_id } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (payment_method) where.payment_method = payment_method;
    if (order_id) where.order_id = order_id;

    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_number', 'total_amount'],
        },
      ],
      limit: limitNum,
      offset,
      order: [['created_at', 'DESC']],
    });

    res.json({
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (err) {
    console.error('[getPayments] Error:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// Get payment by ID
export const getPaymentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Order,
          as: 'order',
        },
      ],
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ data: payment });
  } catch (err) {
    console.error('[getPaymentById] Error:', err);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
};

// Handle payment callback (from payment gateway)
export const handlePaymentCallback = async (req: AuthRequest, res: Response) => {
  try {
    const { gateway, order_id, transaction_id, status, amount, gateway_response } = req.body;

    if (!order_id || !transaction_id || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const order = await Order.findByPk(order_id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Find or create payment record
    const [payment] = await Payment.findOrCreate({
      where: {
        order_id,
        transaction_id,
      },
      defaults: {
        order_id,
        amount: amount || order.total_amount,
        payment_method: gateway || 'bank_transfer',
        status: status === 'success' || status === 'completed' ? 'completed' : 'failed',
        transaction_id,
        gateway_response: gateway_response ? JSON.stringify(gateway_response) : null,
        paid_at: status === 'success' || status === 'completed' ? new Date() : null,
      },
    });

    // Update payment if exists
    if (!payment.isNewRecord) {
      await payment.update({
        status: status === 'success' || status === 'completed' ? 'completed' : 'failed',
        gateway_response: gateway_response ? JSON.stringify(gateway_response) : payment.gateway_response,
        paid_at: status === 'success' || status === 'completed' ? new Date() : payment.paid_at,
      });
    }

    // Update order status if payment completed
    if (payment.status === 'completed' && order.status === 'pending') {
      await order.update({ status: 'paid' });
    }

    res.json({ data: payment, message: 'Payment callback processed' });
  } catch (err) {
    console.error('[handlePaymentCallback] Error:', err);
    res.status(500).json({ error: 'Failed to process payment callback' });
  }
};
















