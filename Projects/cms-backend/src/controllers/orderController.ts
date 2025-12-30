import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Order from '../models/Order';
import OrderItem from '../models/OrderItem';
import User from '../models/User';
import Course from '../models/Course';

// Generate order number
const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

// List orders
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', status, user_id } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (user_id) where.user_id = user_id;

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
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
    console.error('[getOrders] Error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get order by ID
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'title', 'slug'],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ data: order });
  } catch (err) {
    console.error('[getOrderById] Error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Create order
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { user_id, items, payment_method, notes } = req.body;

    if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: user_id, items' });
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += parseFloat(item.price) * parseInt(item.quantity || 1);
    }

    const order = await Order.create({
      user_id,
      order_number: generateOrderNumber(),
      total_amount: totalAmount,
      status: 'pending',
      payment_method,
      notes,
    });

    // Create order items
    const orderItems = await Promise.all(
      items.map((item: any) =>
        OrderItem.create({
          order_id: order.id,
          course_id: item.course_id,
          enrollment_type: item.enrollment_type,
          price: item.price,
          quantity: item.quantity || 1,
        })
      )
    );

    res.status(201).json({
      data: {
        ...order.toJSON(),
        items: orderItems,
      },
    });
  } catch (err) {
    console.error('[createOrder] Error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Update order
export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id } = req.params;
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.update(req.body);
    res.json({ data: order });
  } catch (err) {
    console.error('[updateOrder] Error:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

// Process payment for order
export const payOrder = async (req: AuthRequest, res: Response) => {
  try {
    const actor = req.user as any;
    if (!actor || actor.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permission' });
    }

    const { id } = req.params;
    const { payment_method } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // TODO: Integrate with payment gateway (ZaloPay, VNPay, MoMo)
    // For now, just update order status
    await order.update({
      status: 'paid',
      payment_method,
    });

    res.json({ data: order, message: 'Payment processed (mock - payment gateway integration pending)' });
  } catch (err) {
    console.error('[payOrder] Error:', err);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};
















