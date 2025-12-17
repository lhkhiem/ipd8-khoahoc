// Order Controller
// Handles order creation, retrieval, and management

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';
import { logActivity } from './activityLogController';

const numericOrderFields = [
  'subtotal',
  'tax_amount',
  'shipping_cost',
  'discount_amount',
  'total',
];

const normalizeOrderRow = (order: any) => {
  if (!order) return;
  
  // Normalize numeric fields
  numericOrderFields.forEach((field) => {
    if (order[field] !== undefined && order[field] !== null) {
      order[field] = Number(order[field]);
    }
  });
  
  // Normalize status fields
  if (order.payment_status) {
    order.payment_status = String(order.payment_status);
  }
  if (order.status) {
    order.status = String(order.status);
  }
  
  // Parse JSONB fields if they're strings
  if (order.shipping_address) {
    if (typeof order.shipping_address === 'string') {
      try {
        order.shipping_address = JSON.parse(order.shipping_address);
      } catch (error) {
        // keep original string if parse fails
        console.warn('[normalizeOrderRow] Failed to parse shipping_address:', error);
      }
    }
  }
  
  if (order.billing_address) {
    if (typeof order.billing_address === 'string') {
      try {
        order.billing_address = JSON.parse(order.billing_address);
      } catch (error) {
        // keep original string if parse fails
        console.warn('[normalizeOrderRow] Failed to parse billing_address:', error);
      }
    }
  }
  
  return order;
};

const normalizeOrderItem = (item: any) => {
  if (!item) return item;
  const normalized: any = { ...item };
  if (normalized.quantity !== undefined && normalized.quantity !== null) {
    normalized.quantity = Number(normalized.quantity);
  }
  if (normalized.unit_price !== undefined && normalized.unit_price !== null) {
    normalized.unit_price = Number(normalized.unit_price);
  }
  const total =
    normalized.total_price !== undefined && normalized.total_price !== null
      ? normalized.total_price
      : normalized.subtotal ?? normalized.unit_price * normalized.quantity;
  if (total !== undefined && total !== null) {
    normalized.total_price = Number(total);
  }
  if (normalized.subtotal !== undefined && normalized.subtotal !== null) {
    normalized.subtotal = Number(normalized.subtotal);
  }
  if (normalized.variant_info) {
    if (typeof normalized.variant_info === 'string') {
      try {
        normalized.variant_info = JSON.parse(normalized.variant_info);
      } catch (error) {
        // keep original string
      }
    }
  }
  return normalized;
};

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// Get all orders (admin) or user's orders
export const getOrders = async (req: Request, res: Response) => {
  try {
    const { customer_id, status, page = 1, pageSize = 20 } = req.query;
    
    const whereConditions: string[] = [];
    const replacements: any = { 
      limit: Number(pageSize), 
      offset: (Number(page) - 1) * Number(pageSize) 
    };

    if (customer_id) {
      whereConditions.push('o.customer_id = :customer_id');
      replacements.customer_id = customer_id;
    }

    if (status) {
      whereConditions.push('o.status = :status');
      replacements.status = status;
    }

    // Only show non-deleted orders by default
    // To show deleted orders, pass ?include_deleted=true
    const includeDeleted = req.query.include_deleted === 'true';
    if (!includeDeleted) {
      whereConditions.push('o.deleted_at IS NULL');
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      ${whereClause}
    `;
    const countResult: any = await sequelize.query(countQuery, {
      replacements,
      type: QueryTypes.SELECT
    });
    const total = countResult[0].total;

    // Get orders
    const ordersQuery = `
      SELECT o.*
      FROM orders o
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT :limit OFFSET :offset
    `;
    const orders: any = await sequelize.query(ordersQuery, {
      replacements,
      type: QueryTypes.SELECT
    });

    // Get items for each order
    for (const order of orders) {
      const itemsQuery = `
        SELECT 
          id,
          product_id,
          product_name,
          product_sku as sku,
          quantity,
          unit_price,
          total_price,
          variant_info
        FROM order_items
        WHERE order_id = :order_id
        ORDER BY created_at ASC
      `;
      const items: any = await sequelize.query(itemsQuery, {
        replacements: { order_id: order.id },
        type: QueryTypes.SELECT
      });
      order.items = items.map((item: any) => normalizeOrderItem(item));
      normalizeOrderRow(order);
    }

    res.json({
      orders,
      pagination: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / Number(pageSize))
      }
    });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get single order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const orderQuery = `
      SELECT * FROM orders WHERE id = :id AND deleted_at IS NULL
    `;
    const orders: any = await sequelize.query(orderQuery, {
      replacements: { id },
      type: QueryTypes.SELECT
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];

    // Get order items
    const itemsQuery = `
      SELECT 
        id,
        product_id,
        product_name,
        product_sku as sku,
        quantity,
        unit_price,
        total_price,
        variant_info
      FROM order_items
      WHERE order_id = :order_id
      ORDER BY created_at ASC
    `;
    const items: any = await sequelize.query(itemsQuery, {
      replacements: { order_id: id },
      type: QueryTypes.SELECT
    });

    order.items = items.map((item: any) => normalizeOrderItem(item));
    normalizeOrderRow(order);

    res.json(order);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Get order by order number
export const getOrderByNumber = async (req: Request, res: Response) => {
  try {
    const { order_number } = req.params;

    const orderQuery = `
      SELECT * FROM orders WHERE order_number = :order_number AND deleted_at IS NULL
    `;
    const orders: any = await sequelize.query(orderQuery, {
      replacements: { order_number },
      type: QueryTypes.SELECT
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];

    // Get order items
    const itemsQuery = `
      SELECT 
        id,
        product_id,
        product_name,
        product_sku as sku,
        quantity,
        unit_price,
        total_price,
        variant_info
      FROM order_items
      WHERE order_id = :order_id
      ORDER BY created_at ASC
    `;
    const items: any = await sequelize.query(itemsQuery, {
      replacements: { order_id: order.id },
      type: QueryTypes.SELECT
    });

    order.items = items.map((item: any) => normalizeOrderItem(item));
    normalizeOrderRow(order);

    res.json(order);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Create new order from cart
export const createOrder = async (req: Request, res: Response) => {
  console.log('[createOrder] ========== NEW ORDER REQUEST ==========');
  console.log('[createOrder] Request received at:', new Date().toISOString());
  console.log('[createOrder] Request body:', {
    customer_email: req.body?.customer_email,
    customer_name: req.body?.customer_name,
    customer_phone: req.body?.customer_phone,
    payment_method: req.body?.payment_method,
    items_count: req.body?.items?.length,
  });
  
  try {
    const {
      customer_id,
      customer_email,
      customer_name,
      customer_phone, // Required for phone-based order lookup
      shipping_address,
      billing_address,
      shipping_method,
      payment_method,
      items, // Array of { product_id, quantity, variant_info }
      notes,
      subtotal: frontendSubtotal, // Optional: frontend calculated subtotal
      shipping_cost: frontendShippingCost, // Optional: frontend calculated shipping
      tax_amount: frontendTaxAmount, // Optional: frontend calculated tax
    } = req.body;

    // Validation
    if (!customer_email || !customer_name || !customer_phone || !shipping_address || !billing_address || !payment_method) {
      return res.status(400).json({ error: 'Missing required fields: customer_email, customer_name, customer_phone, shipping_address, billing_address, payment_method' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      const orderId = uuidv4();
      const orderNumber = generateOrderNumber();

      // Calculate totals from items
      let subtotal = 0;
      let taxAmount = 0;
      let shippingCost = 0;

      for (const item of items) {
        // Get product details
        const productQuery = `
          SELECT price, stock, name, sku, thumbnail_id
          FROM products
          WHERE id = :product_id AND status = 'published'
        `;
        const products: any = await sequelize.query(productQuery, {
          replacements: { product_id: item.product_id },
          type: QueryTypes.SELECT,
          transaction
        });

        if (!products || products.length === 0) {
          throw new Error(`Product ${item.product_id} not found or not available`);
        }

        const product = products[0];

        // Check stock
        if (product.stock < item.quantity) {
          const stockError: any = new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
          stockError.statusCode = 400;
          stockError.code = 'INSUFFICIENT_STOCK';
          stockError.productName = product.name;
          stockError.availableStock = product.stock;
          stockError.requestedQuantity = item.quantity;
          throw stockError;
        }

        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
      }

      // Use frontend calculated values if provided, otherwise calculate on backend
      // Frontend values take precedence for consistency with what user sees
      if (frontendSubtotal !== undefined && frontendSubtotal !== null) {
        subtotal = Number(frontendSubtotal);
      }
      if (frontendShippingCost !== undefined && frontendShippingCost !== null) {
        shippingCost = Number(frontendShippingCost);
      }
      if (frontendTaxAmount !== undefined && frontendTaxAmount !== null) {
        taxAmount = Number(frontendTaxAmount);
      }

      const total = subtotal + taxAmount + shippingCost;

      // customer_phone is required and provided separately (not in shipping_address)
      // Use customer_phone directly
      const phoneNumber = customer_phone;

      // Create order
      const orderQuery = `
        INSERT INTO orders (
          id, order_number, customer_id, customer_email, customer_name, customer_phone,
          shipping_address, billing_address,
          subtotal, tax_amount, shipping_cost, discount_amount, total,
          shipping_method, payment_method, payment_status, status, notes,
          created_at, updated_at
        )
        VALUES (
          :id, :order_number, :customer_id, :customer_email, :customer_name, :customer_phone,
          :shipping_address::jsonb, :billing_address::jsonb,
          :subtotal, :tax_amount, :shipping_cost, :discount_amount, :total,
          :shipping_method, :payment_method, 'pending', 'pending', :notes,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING *
      `;
      const newOrders: any = await sequelize.query(orderQuery, {
        replacements: {
          id: orderId,
          order_number: orderNumber,
          customer_id: customer_id || null,
          customer_email,
          customer_name,
          customer_phone: phoneNumber,
          shipping_address: JSON.stringify(shipping_address),
          billing_address: JSON.stringify(billing_address),
          subtotal,
          tax_amount: taxAmount,
          shipping_cost: shippingCost,
          discount_amount: 0,
          total,
          shipping_method: shipping_method || null,
          payment_method,
          notes: notes || null
        },
        type: QueryTypes.INSERT,
        transaction
      });

      const order = newOrders[0];

      // Create order items and update stock
      for (const item of items) {
        // Get product details again
        const productQuery = `
          SELECT id, name, sku, price, thumbnail_id
          FROM products
          WHERE id = :product_id
        `;
        const products: any = await sequelize.query(productQuery, {
          replacements: { product_id: item.product_id },
          type: QueryTypes.SELECT,
          transaction
        });
        const product = products[0];

        const lineTotal = product.price * item.quantity;

        // Get thumbnail URL
        let thumbnailUrl = null;
        if (product.thumbnail_id) {
          const assetQuery = `
            SELECT url FROM assets WHERE id = :asset_id
          `;
          const assets: any = await sequelize.query(assetQuery, {
            replacements: { asset_id: product.thumbnail_id },
            type: QueryTypes.SELECT,
            transaction
          });
          if (assets && assets.length > 0) {
            thumbnailUrl = assets[0].url;
          }
        }

        const itemQuery = `
          INSERT INTO order_items (
            id, order_id, product_id, product_name, product_sku, product_image_url,
            quantity, unit_price, total_price, variant_info, created_at
          )
          VALUES (
            :id, :order_id, :product_id, :product_name, :product_sku, :product_image_url,
            :quantity, :unit_price, :total_price, :variant_info::jsonb, CURRENT_TIMESTAMP
          )
        `;
        await sequelize.query(itemQuery, {
          replacements: {
            id: uuidv4(),
            order_id: orderId,
            product_id: item.product_id,
            product_name: product.name,
            product_sku: product.sku,
            product_image_url: thumbnailUrl,
            quantity: item.quantity,
            unit_price: product.price,
            total_price: lineTotal,
            variant_info: JSON.stringify(item.variant_info || {})
          },
          type: QueryTypes.INSERT,
          transaction
        });

        // Update product stock within transaction
        // CRITICAL: Only update stock once here, StockService will only record movement (not update stock again)
        const stockUpdateQuery = `
          UPDATE products
          SET stock = stock - :quantity,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = :product_id
        `;
        await sequelize.query(stockUpdateQuery, {
          replacements: {
            product_id: item.product_id,
            quantity: item.quantity
          },
          type: QueryTypes.UPDATE,
          transaction
        });
      }

      await transaction.commit();

      // Record stock movements after transaction commits (to track inventory changes)
      // NOTE: StockService.updateStock will try to update stock again, so we need to use a method that only records movement
      // For now, we'll manually insert stock movement record without updating stock again
      const userId = (req as any).user?.id;
      
      for (const item of items) {
        try {
          // Get current stock after the update
          const currentStockQuery = `
            SELECT stock FROM products WHERE id = :product_id
          `;
          const currentStockResult: any = await sequelize.query(currentStockQuery, {
            replacements: { product_id: item.product_id },
            type: QueryTypes.SELECT
          });
          const currentStock = currentStockResult[0]?.stock || 0;
          const previousStock = currentStock + item.quantity; // Stock before deduction
          
          // Record stock movement without updating stock (stock already updated in transaction)
          const movementQuery = `
            INSERT INTO stock_movements (
              id, product_id, variant_id, quantity, previous_stock, new_stock,
              reference_type, reference_id, notes, user_id, created_at
            )
            VALUES (
              gen_random_uuid(), :product_id, :variant_id, :quantity, :previous_stock, :new_stock,
              :reference_type, :reference_id, :notes, :user_id, CURRENT_TIMESTAMP
            )
          `;
          await sequelize.query(movementQuery, {
            replacements: {
              product_id: item.product_id,
              variant_id: item.variant_info?.variantId || null,
              quantity: -item.quantity, // negative for sale
              previous_stock: previousStock,
              new_stock: currentStock,
              reference_type: 'order',
              reference_id: orderId,
              notes: `Order ${orderNumber} - Sale`,
              user_id: userId || null
            },
            type: QueryTypes.INSERT
          });
        } catch (error: any) {
          // Log error but don't fail the order creation
          console.error(`[createOrder] Failed to record stock movement for product ${item.product_id}:`, error.message);
        }
      }

      // Get full order with items
      const fullOrderQuery = `
        SELECT * FROM orders WHERE id = :order_id AND deleted_at IS NULL
      `;
      const fullOrders: any = await sequelize.query(fullOrderQuery, {
        replacements: { order_id: orderId },
        type: QueryTypes.SELECT
      });
      const fullOrder = fullOrders[0];

      const itemsQuery = `
        SELECT * FROM order_items WHERE order_id = :order_id
      `;
      const orderItems: any = await sequelize.query(itemsQuery, {
        replacements: { order_id: orderId },
        type: QueryTypes.SELECT
      });
      fullOrder.items = orderItems.map((item: any) => normalizeOrderItem(item));
      normalizeOrderRow(fullOrder);

      // Send order confirmation email (for COD orders or when order is created)
      // For ZaloPay, email will be sent after payment is confirmed
      if (payment_method !== 'zalopay') {
        try {
          console.log('[createOrder] Attempting to send order confirmation email...');
          const { emailService } = await import('../services/email');
          const { getOrderConfirmationTemplate } = await import('../utils/emailTemplates');
          
          if (emailService.isEnabled()) {
            const shippingAddress = typeof fullOrder.shipping_address === 'string' 
              ? JSON.parse(fullOrder.shipping_address) 
              : fullOrder.shipping_address;

            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || process.env.WEBSITE_ORIGIN || 'https://banyco.vn';
            const orderUrl = `${siteUrl}/order-lookup`;

            const emailData = {
              customerName: fullOrder.customer_name,
              customerEmail: fullOrder.customer_email,
              orderNumber: fullOrder.order_number,
              orderDate: fullOrder.created_at || new Date(),
              total: Number(fullOrder.total),
              paymentMethod: fullOrder.payment_method,
              items: orderItems.map((item: any) => ({
                name: item.product_name,
                quantity: item.quantity,
                price: Number(item.unit_price),
                subtotal: Number(item.total_price),
              })),
              shippingAddress: {
                name: shippingAddress?.name || fullOrder.customer_name,
                phone: shippingAddress?.phone || fullOrder.customer_phone,
                address: shippingAddress?.address || shippingAddress?.street || '',
                city: shippingAddress?.city || '',
                district: shippingAddress?.district || '',
                ward: shippingAddress?.ward || '',
              },
              orderUrl,
            };

            console.log('[createOrder] Preparing to send email to:', fullOrder.customer_email);
            const emailHtml = getOrderConfirmationTemplate(emailData);
            const emailSent = await emailService.sendEmail({
              to: fullOrder.customer_email,
              subject: `Xác nhận đơn hàng ${fullOrder.order_number} - Banyco`,
              html: emailHtml,
            });

            if (emailSent) {
              console.log('[createOrder] ✅ Order confirmation email sent successfully');
            } else {
              console.error('[createOrder] ❌ Failed to send order confirmation email');
            }
          } else {
            console.warn('[createOrder] Email service is not enabled, skipping email send');
          }
        } catch (emailError: any) {
          // Don't fail order creation if email fails
          console.error('[createOrder] Error sending order confirmation email:', {
            message: emailError?.message,
            stack: emailError?.stack,
            error: emailError,
          });
        }
      } else {
        console.log('[createOrder] Payment method is ZaloPay, email will be sent after payment confirmation');
      }

      // If payment method is ZaloPay, return order with payment_redirect flag
      // Frontend should call /api/payments/zalopay/create to get order_url
      if (payment_method === 'zalopay') {
        return res.status(201).json({
          ...fullOrder,
          payment_redirect: true,
          payment_redirect_url: `/api/payments/zalopay/create`
        });
      }

      res.status(201).json(fullOrder);
    } catch (error: any) {
      await transaction.rollback();
      console.error('[createOrder] Transaction error:', {
        message: error?.message,
        code: error?.code,
        detail: error?.detail,
        stack: error?.stack,
        name: error?.name,
      });
      throw error;
    }
  } catch (error: any) {
    console.error('[createOrder] Failed to create order:', {
      message: error?.message,
      code: error?.code,
      detail: error?.detail,
      stack: error?.stack,
      name: error?.name,
      statusCode: error?.statusCode,
      requestBody: {
        customer_email: req.body?.customer_email,
        customer_name: req.body?.customer_name,
        customer_phone: req.body?.customer_phone,
        payment_method: req.body?.payment_method,
        items_count: req.body?.items?.length,
      },
    });

    // Handle specific error types with appropriate status codes
    const statusCode = error?.statusCode || 500;
    const isClientError = statusCode >= 400 && statusCode < 500;

    res.status(statusCode).json({ 
      error: error?.message || 'Failed to create order',
      code: error?.code,
      ...(error?.code === 'INSUFFICIENT_STOCK' && {
        productName: error?.productName,
        availableStock: error?.availableStock,
        requestedQuantity: error?.requestedQuantity,
      }),
      details: process.env.NODE_ENV === 'development' ? {
        code: error?.code,
        detail: error?.detail,
        message: error?.message,
        stack: isClientError ? undefined : error?.stack, // Don't expose stack for client errors
      } : undefined
    });
  }
};

// Get orders by phone number (public endpoint for order lookup)
export const getOrdersByPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.params;
    
    console.log('[getOrdersByPhone] Called with phone:', phone);

    if (!phone) {
      console.log('[getOrdersByPhone] Phone is missing');
      return res.status(400).json({ 
        success: false,
        error: 'Vui lòng nhập số điện thoại',
        message: 'Vui lòng nhập số điện thoại để tra cứu đơn hàng'
      });
    }

    // Normalize phone number (remove spaces, dashes, parentheses) - căn cứ vào customer_phone
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Simple query - căn cứ vào customer_phone với exact match và LIKE
    const orderQuery = `
      SELECT 
        o.id,
        o.order_number,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.subtotal,
        o.tax_amount,
        o.shipping_cost,
        o.discount_amount,
        o.total,
        o.status,
        o.payment_status,
        o.payment_method,
        o.tracking_number,
        o.shipping_address,
        o.created_at,
        o.shipped_at,
        o.delivered_at
      FROM orders o
      WHERE o.customer_phone IS NOT NULL
        AND o.deleted_at IS NULL
        AND (
          o.customer_phone = :phone 
          OR o.customer_phone LIKE :phone_like
        )
      ORDER BY o.created_at DESC
      LIMIT 50
    `;
    
    console.log('[getOrdersByPhone] Querying with phone:', phone, 'normalized:', normalizedPhone);
    
    const orders: any = await sequelize.query(orderQuery, {
      replacements: { 
        phone,
        phone_like: `%${normalizedPhone}%`
      },
      type: QueryTypes.SELECT
    });
    
    // Filter by normalized phone in code (more reliable than SQL REPLACE)
    const filteredOrders = orders.filter((order: any) => {
      if (!order.customer_phone) return false;
      const orderPhoneNormalized = order.customer_phone.replace(/[\s\-\(\)]/g, '');
      return order.customer_phone === phone || orderPhoneNormalized === normalizedPhone;
    });

    console.log('[getOrdersByPhone] Found orders before filter:', orders?.length || 0);
    console.log('[getOrdersByPhone] Found orders after filter:', filteredOrders?.length || 0);

    if (!filteredOrders || filteredOrders.length === 0) {
      console.log('[getOrdersByPhone] No orders found for phone:', phone);
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy đơn hàng nào với số điện thoại này',
        error: 'Không tìm thấy đơn hàng nào với số điện thoại này'
      });
    }

    // Get items for each order
    for (const order of filteredOrders) {
      try {
        // Normalize order row first (before adding items)
        normalizeOrderRow(order);
        
        const itemsQuery = `
          SELECT 
            oi.id,
            oi.product_id,
            oi.product_name,
            oi.product_sku as sku,
            oi.quantity,
            oi.unit_price,
            oi.total_price,
            oi.variant_info
          FROM order_items oi
          WHERE oi.order_id = :order_id
          ORDER BY oi.created_at ASC
        `;
        const items: any = await sequelize.query(itemsQuery, {
          replacements: { order_id: order.id },
          type: QueryTypes.SELECT
        });
        order.items = items.map((item: any) => normalizeOrderItem(item));
      } catch (itemError: any) {
        console.error(`[getOrdersByPhone] Error processing items for order ${order.id}:`, itemError);
        console.error(`[getOrdersByPhone] Item error message:`, itemError?.message);
        console.error(`[getOrdersByPhone] Item error stack:`, itemError?.stack);
        
        // Still normalize order even if items fail
        try {
          normalizeOrderRow(order);
        } catch (normalizeError: any) {
          console.error(`[getOrdersByPhone] Error normalizing order ${order.id}:`, normalizeError);
        }
        
        order.items = []; // Set empty items if error
      }
    }

    res.json({
      success: true,
      data: filteredOrders,
      count: filteredOrders.length
    });
  } catch (error: any) {
    console.error('[getOrdersByPhone] Error:', error);
    console.error('[getOrdersByPhone] Error message:', error?.message);
    console.error('[getOrdersByPhone] Error stack:', error?.stack);
    
    // Return detailed error for debugging
    res.status(500).json({ 
      success: false,
      error: 'Lỗi khi tìm kiếm đơn hàng',
      message: 'Đã xảy ra lỗi khi tra cứu đơn hàng. Vui lòng thử lại sau.',
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    });
  }
};

// Update order (admin only)
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, tracking_number, payment_status, admin_notes } = req.body;

    // Validation
    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const allowedPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (payment_status && !allowedPaymentStatuses.includes(payment_status)) {
      return res.status(400).json({ error: 'Invalid payment_status' });
    }

    // Build update query
    const updates: string[] = [];
    const replacements: any = { id };

    if (status) {
      updates.push('status = :status');
      replacements.status = status;
      
      // Set timestamp based on status
      if (status === 'shipped') {
        updates.push('shipped_at = CURRENT_TIMESTAMP');
      } else if (status === 'delivered') {
        updates.push('delivered_at = CURRENT_TIMESTAMP');
      } else if (status === 'cancelled') {
        updates.push('cancelled_at = CURRENT_TIMESTAMP');
        // Note: Stock restoration will happen AFTER order update succeeds
      }
    }

    if (tracking_number) {
      updates.push('tracking_number = :tracking_number');
      replacements.tracking_number = tracking_number;
    }

    if (payment_status) {
      updates.push('payment_status = :payment_status');
      replacements.payment_status = payment_status;
      
      // NOTE: Payment failed does NOT restore stock automatically
      // Stock will only be restored when order status is set to 'cancelled'
      // This allows users to retry payment without losing their reserved stock
      if (payment_status === 'failed') {
        console.log('[updateOrder] Payment status set to failed for order:', id, '- Stock remains reserved until order is cancelled');
      }
    }

    if (admin_notes) {
      updates.push('admin_notes = :admin_notes');
      replacements.admin_notes = admin_notes;
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');

    const updateQuery = `
      UPDATE orders
      SET ${updates.join(', ')}
      WHERE id = :id
      RETURNING *
    `;
    const updated: any = await sequelize.query(updateQuery, {
      replacements,
      type: QueryTypes.UPDATE
    });

    if (!updated || updated.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const normalized = Array.isArray(updated) ? updated[0] : updated;
    normalizeOrderRow(normalized);
    
    // CRITICAL: Restore stock AFTER order update succeeds (if order was cancelled)
    if (status === 'cancelled') {
      console.log('[updateOrder] Order cancelled, restoring stock for order:', id);
      
      try {
        // Get order items
        const itemsQuery = `SELECT product_id, quantity, variant_info FROM order_items WHERE order_id = :id`;
        const orderItems: any[] = await sequelize.query(itemsQuery, {
          replacements: { id },
          type: QueryTypes.SELECT
        });
        
        // Restore stock for each item
        const { StockService } = await import('../services/stockService');
        const userId = (req as any).user?.id;
        
        for (const item of orderItems) {
          try {
            const variantInfo = item.variant_info ? (typeof item.variant_info === 'string' ? JSON.parse(item.variant_info) : item.variant_info) : null;
            
            // Get current stock
            const currentStockQuery = variantInfo?.variantId
              ? `SELECT stock FROM product_variants WHERE id = :id`
              : `SELECT stock FROM products WHERE id = :id`;
            const currentStockResult: any = await sequelize.query(currentStockQuery, {
              replacements: { id: variantInfo?.variantId || item.product_id },
              type: QueryTypes.SELECT
            });
            const currentStock = currentStockResult[0]?.stock || 0;
            const previousStock = currentStock - item.quantity; // Stock before restoration
            
            // Update stock directly
            const stockUpdateQuery = variantInfo?.variantId
              ? `UPDATE product_variants SET stock = stock + :quantity, updated_at = CURRENT_TIMESTAMP WHERE id = :id`
              : `UPDATE products SET stock = stock + :quantity, updated_at = CURRENT_TIMESTAMP WHERE id = :id`;
            await sequelize.query(stockUpdateQuery, {
              replacements: {
                id: variantInfo?.variantId || item.product_id,
                quantity: item.quantity
              },
              type: QueryTypes.UPDATE
            });
            
            // Record stock movement
            const movementQuery = `
              INSERT INTO stock_movements (
                id, product_id, variant_id, movement_type, quantity, previous_stock, new_stock,
                reference_type, reference_id, notes, created_by, created_at
              )
              VALUES (
                gen_random_uuid(), :product_id, :variant_id, :movement_type, :quantity, :previous_stock, :new_stock,
                :reference_type, :reference_id, :notes, :user_id, CURRENT_TIMESTAMP
              )
            `;
            await sequelize.query(movementQuery, {
              replacements: {
                product_id: item.product_id,
                variant_id: variantInfo?.variantId || null,
                movement_type: 'return',
                quantity: item.quantity, // positive to restore
                previous_stock: previousStock,
                new_stock: currentStock + item.quantity,
                reference_type: 'order',
                reference_id: id,
                notes: `Order cancelled - Stock restored`,
                user_id: userId || null
              },
              type: QueryTypes.INSERT
            });
            
            console.log(`[updateOrder] Restored ${item.quantity} units for product ${item.product_id} (variant: ${variantInfo?.variantId || 'none'})`);
          } catch (error: any) {
            console.error(`[updateOrder] Failed to restore stock for product ${item.product_id}:`, error.message);
            // Continue with other items even if one fails
          }
        }
        
        console.log('[updateOrder] Stock restoration completed for order:', id);
      } catch (error: any) {
        console.error('[updateOrder] Failed to restore stock:', error);
        // Don't fail the order update if stock restoration fails
        // Log error but continue
      }
    }
    
    // Log activity
    const orderNumber = normalized.order_number || id;
    const statusChange = status ? `Status changed to "${status}"` : '';
    const paymentChange = payment_status ? `Payment status changed to "${payment_status}"` : '';
    const changes = [statusChange, paymentChange].filter(Boolean).join(', ') || 'Updated order';
    await logActivity(req, 'update', 'order', id, orderNumber, `${changes} - Order #${orderNumber}`);
    
    // Fetch complete order with items (same as getOrderById)
    // This ensures frontend receives full order data including items
    const completeOrderQuery = `
      SELECT 
        o.*,
        COALESCE(SUM(oi.total_price), 0) as calculated_subtotal
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = :id
      GROUP BY o.id
    `;
    const completeOrderResult: any = await sequelize.query(completeOrderQuery, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    
    if (!completeOrderResult || completeOrderResult.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const completeOrder = completeOrderResult[0];
    normalizeOrderRow(completeOrder);
    
    // Fetch order items
    const itemsQuery = `
      SELECT 
        oi.id,
        oi.product_id,
        oi.product_name,
        oi.product_sku as sku,
        oi.quantity,
        oi.unit_price,
        oi.total_price,
        oi.variant_info
      FROM order_items oi
      WHERE oi.order_id = :order_id
      ORDER BY oi.created_at ASC
    `;
    const items: any[] = await sequelize.query(itemsQuery, {
      replacements: { order_id: id },
      type: QueryTypes.SELECT
    });
    
    // Attach items to order
    completeOrder.items = items.map((item: any) => ({
      ...item,
      variant_info: item.variant_info ? (typeof item.variant_info === 'string' ? JSON.parse(item.variant_info) : item.variant_info) : null,
    }));
    
    res.json(completeOrder);
  } catch (error) {
    console.error('Failed to update order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

// Soft delete order (admin only) - sets deleted_at timestamp instead of hard delete
// This preserves order data for accounting, reporting, and audit purposes
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get order info before soft deleting
    const getOrderQuery = 'SELECT order_number, deleted_at FROM orders WHERE id = :id';
    const orderResult: any = await sequelize.query(getOrderQuery, {
      replacements: { id },
      type: QueryTypes.SELECT
    });
    
    if (!orderResult || orderResult.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult[0];
    const orderNumber = order.order_number || id;

    // Check if already deleted
    if (order.deleted_at) {
      return res.status(400).json({ error: 'Order is already deleted (archived)' });
    }
    
    // Soft delete: set deleted_at timestamp instead of hard delete
    const query = `
      UPDATE orders 
      SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = :id AND deleted_at IS NULL
      RETURNING id, deleted_at
    `;
    const updated: any = await sequelize.query(query, {
      replacements: { id },
      type: QueryTypes.UPDATE
    });

    if (!updated || updated.length === 0 || !updated[0]) {
      return res.status(404).json({ error: 'Order not found or already deleted' });
    }

    // Log activity
    await logActivity(req, 'delete', 'order', id, orderNumber, `Archived (soft deleted) order #${orderNumber}`);

    res.json({ 
      success: true, 
      message: 'Order archived successfully',
      deleted_at: updated[0].deleted_at
    });
  } catch (error) {
    console.error('Failed to archive order:', error);
    res.status(500).json({ error: 'Failed to archive order' });
  }
};

















