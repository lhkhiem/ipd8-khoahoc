// Inventory Controller
// Handles inventory management, stock tracking, and reporting

import { Request, Response } from 'express';
import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';
import { StockService } from '../services/stockService';

// Get inventory statistics for dashboard
export const getInventoryStats = async (req: Request, res: Response) => {
  try {
    // Total products
    const totalProductsQuery = `
      SELECT COUNT(*) as count
      FROM products
      WHERE status = 'published'
    `;
    const totalProducts: any[] = await sequelize.query(totalProductsQuery, {
      type: QueryTypes.SELECT,
    });

    // Low stock items (stock <= threshold)
    const lowStockQuery = `
      SELECT COUNT(DISTINCT p.id) as count
      FROM products p
      LEFT JOIN stock_settings ss ON ss.product_id = p.id AND ss.variant_id IS NULL
      WHERE p.status = 'published'
      AND p.stock <= COALESCE(ss.low_stock_threshold, 10)
      AND p.stock > 0
    `;
    const lowStock: any[] = await sequelize.query(lowStockQuery, {
      type: QueryTypes.SELECT,
    });

    // Out of stock items
    const outOfStockQuery = `
      SELECT COUNT(*) as count
      FROM products
      WHERE status = 'published'
      AND stock <= 0
    `;
    const outOfStock: any[] = await sequelize.query(outOfStockQuery, {
      type: QueryTypes.SELECT,
    });

    // Total stock value (sum of cost_price * stock)
    const totalValueQuery = `
      SELECT COALESCE(SUM(COALESCE(cost_price, price) * stock), 0) as value
      FROM products
      WHERE status = 'published'
    `;
    const totalValue: any[] = await sequelize.query(totalValueQuery, {
      type: QueryTypes.SELECT,
    });

    res.json({
      success: true,
      data: {
        totalProducts: parseInt(totalProducts[0]?.count || '0'),
        lowStockItems: parseInt(lowStock[0]?.count || '0'),
        outOfStockItems: parseInt(outOfStock[0]?.count || '0'),
        totalStockValue: parseFloat(totalValue[0]?.value || '0'),
      },
    });
  } catch (error: any) {
    console.error('[getInventoryStats] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory statistics',
      message: error.message,
    });
  }
};

// Get inventory products list with stock information
export const getInventoryProducts = async (req: Request, res: Response) => {
  try {
    const {
      filter = 'all', // 'all', 'low_stock', 'out_of_stock'
      search = '',
      sort = 'stock_asc', // 'stock_asc', 'stock_desc', 'name', 'sku'
      limit = 50,
      offset = 0,
    } = req.query;

    const conditions: string[] = ["p.status = 'published'"];
    const replacements: any = {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    };

    // Filter by stock status
    if (filter === 'low_stock') {
      conditions.push(`
        p.stock <= COALESCE(ss.low_stock_threshold, 10)
        AND p.stock > 0
      `);
    } else if (filter === 'out_of_stock') {
      conditions.push('p.stock <= 0');
    }

    // Search
    if (search) {
      conditions.push(`(p.name ILIKE :search OR p.sku ILIKE :search)`);
      replacements.search = `%${search}%`;
    }

    // Sort
    let orderBy = 'p.name ASC';
    switch (sort) {
      case 'stock_asc':
        orderBy = 'p.stock ASC';
        break;
      case 'stock_desc':
        orderBy = 'p.stock DESC';
        break;
      case 'name':
        orderBy = 'p.name ASC';
        break;
      case 'sku':
        orderBy = 'p.sku ASC';
        break;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.stock,
        p.price,
        p.cost_price,
        p.status,
        ss.low_stock_threshold,
        ss.reorder_point,
        CASE 
          WHEN p.stock <= 0 THEN 'out_of_stock'
          WHEN p.stock <= COALESCE(ss.low_stock_threshold, 10) THEN 'low_stock'
          ELSE 'in_stock'
        END as stock_status
      FROM products p
      LEFT JOIN stock_settings ss ON ss.product_id = p.id AND ss.variant_id IS NULL
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT :limit OFFSET :offset
    `;

    const products: any[] = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as count
      FROM products p
      LEFT JOIN stock_settings ss ON ss.product_id = p.id AND ss.variant_id IS NULL
      ${whereClause}
    `;
    const countResult: any[] = await sequelize.query(countQuery, {
      replacements: { ...replacements, limit: undefined, offset: undefined },
      type: QueryTypes.SELECT,
    });
    const total = parseInt(countResult[0]?.count || '0');

    res.json({
      success: true,
      data: products,
      pagination: {
        total,
        limit: replacements.limit,
        offset: replacements.offset,
        hasMore: replacements.offset + replacements.limit < total,
      },
    });
  } catch (error: any) {
    console.error('[getInventoryProducts] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory products',
      message: error.message,
    });
  }
};

// Get stock movements for a product
export const getProductMovements = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { variantId, movementType, limit = 50, offset = 0 } = req.query;

    const movements = await StockService.getStockMovements(
      productId,
      variantId as string | null | undefined,
      movementType as string | undefined,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      data: movements,
    });
  } catch (error: any) {
    console.error('[getProductMovements] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock movements',
      message: error.message,
    });
  }
};

// Manual stock adjustment
export const adjustStock = async (req: Request, res: Response) => {
  try {
    const { productId, variantId, quantity, notes } = req.body;
    const userId = (req as any).user?.id;

    if (!productId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: productId, quantity',
      });
    }

    if (quantity === 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity cannot be zero',
      });
    }

    const movement = await StockService.updateStock(
      productId,
      variantId || null,
      quantity,
      'adjustment',
      'adjustment',
      undefined,
      notes || 'Manual stock adjustment',
      userId
    );

    res.json({
      success: true,
      data: movement,
      message: `Stock ${quantity > 0 ? 'increased' : 'decreased'} by ${Math.abs(quantity)}`,
    });
  } catch (error: any) {
    console.error('[adjustStock] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to adjust stock',
      message: error.message,
    });
  }
};

// Bulk stock adjustment
export const bulkAdjustStock = async (req: Request, res: Response) => {
  try {
    const { adjustments } = req.body; // Array of { productId, variantId?, quantity, notes? }
    const userId = (req as any).user?.id;

    if (!Array.isArray(adjustments) || adjustments.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'adjustments must be a non-empty array',
      });
    }

    const results: any[] = [];
    const errors: any[] = [];

    for (const adj of adjustments) {
      try {
        const movement = await StockService.updateStock(
          adj.productId,
          adj.variantId || null,
          adj.quantity,
          'adjustment',
          'adjustment',
          undefined,
          adj.notes || 'Bulk stock adjustment',
          userId
        );
        results.push(movement);
      } catch (error: any) {
        errors.push({
          productId: adj.productId,
          variantId: adj.variantId,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      data: {
        successful: results.length,
        failed: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error: any) {
    console.error('[bulkAdjustStock] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform bulk stock adjustment',
      message: error.message,
    });
  }
};

// Get low stock alerts
export const getLowStockAlerts = async (req: Request, res: Response) => {
  try {
    const { limit = 50 } = req.query;

    const query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.stock,
        ss.low_stock_threshold,
        ss.reorder_point,
        ss.reorder_quantity
      FROM products p
      LEFT JOIN stock_settings ss ON ss.product_id = p.id AND ss.variant_id IS NULL
      WHERE p.status = 'published'
      AND p.stock <= COALESCE(ss.low_stock_threshold, 10)
      ORDER BY p.stock ASC
      LIMIT :limit
    `;

    const alerts: any[] = await sequelize.query(query, {
      replacements: { limit: parseInt(limit as string) },
      type: QueryTypes.SELECT,
    });

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error: any) {
    console.error('[getLowStockAlerts] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch low stock alerts',
      message: error.message,
    });
  }
};

// Update stock settings for a product
export const updateStockSettings = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { variantId, low_stock_threshold, reorder_point, reorder_quantity, track_inventory } =
      req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: productId',
      });
    }

    const settings = await StockService.updateStockSettings(productId, variantId || null, {
      low_stock_threshold,
      reorder_point,
      reorder_quantity,
      track_inventory,
    });

    res.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error('[updateStockSettings] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update stock settings',
      message: error.message,
    });
  }
};

// Get stock settings for a product
export const getStockSettings = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { variantId } = req.query;

    const settings = await StockService.getStockSettings(productId, (variantId as string) || null);

    if (!settings) {
      // Return default settings if not found
      return res.json({
        success: true,
        data: {
          product_id: productId,
          variant_id: variantId || null,
          low_stock_threshold: 10,
          reorder_point: 5,
          reorder_quantity: 20,
          track_inventory: true,
        },
      });
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error('[getStockSettings] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock settings',
      message: error.message,
    });
  }
};

