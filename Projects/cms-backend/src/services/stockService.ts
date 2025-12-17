import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export interface StockMovement {
  id: string;
  product_id: string;
  variant_id?: string | null;
  movement_type: string;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reference_type?: string | null;
  reference_id?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at: Date;
}

export interface StockSettings {
  id: string;
  product_id: string;
  variant_id?: string | null;
  low_stock_threshold: number;
  reorder_point: number;
  reorder_quantity: number;
  track_inventory: boolean;
  created_at: Date;
  updated_at: Date;
}

export class StockService {
  /**
   * Get current stock for a product or variant
   */
  static async getStock(productId: string, variantId?: string | null): Promise<number> {
    if (variantId) {
      const result: any[] = await sequelize.query(
        `SELECT stock FROM product_variants WHERE id = :variantId`,
        {
          replacements: { variantId },
          type: QueryTypes.SELECT,
        }
      );
      return result.length > 0 ? result[0].stock : 0;
    } else {
      const result: any[] = await sequelize.query(
        `SELECT stock FROM products WHERE id = :productId`,
        {
          replacements: { productId },
          type: QueryTypes.SELECT,
        }
      );
      return result.length > 0 ? result[0].stock : 0;
    }
  }

  /**
   * Update stock with movement tracking
   * @param quantity - positive for increase, negative for decrease
   */
  static async updateStock(
    productId: string,
    variantId: string | null,
    quantity: number,
    movementType: 'sale' | 'purchase' | 'adjustment' | 'return' | 'transfer' | 'damage',
    referenceType?: string,
    referenceId?: string,
    notes?: string,
    userId?: string
  ): Promise<StockMovement> {
    const transaction = await sequelize.transaction();

    try {
      // Get current stock
      const stockQuery = variantId
        ? `SELECT stock FROM product_variants WHERE id = :id`
        : `SELECT stock FROM products WHERE id = :id`;

      const currentStock: any[] = await sequelize.query(stockQuery, {
        replacements: { id: variantId || productId },
        type: QueryTypes.SELECT,
        transaction,
      });

      if (!currentStock || currentStock.length === 0) {
        throw new Error(`Product or variant not found: ${variantId || productId}`);
      }

      const previousStock = currentStock[0].stock;
      const newStock = previousStock + quantity;

      if (newStock < 0) {
        throw new Error(
          `Insufficient stock. Current: ${previousStock}, Requested change: ${quantity}`
        );
      }

      // Update stock
      const updateQuery = variantId
        ? `UPDATE product_variants SET stock = :stock, updated_at = CURRENT_TIMESTAMP WHERE id = :id`
        : `UPDATE products SET stock = :stock, updated_at = CURRENT_TIMESTAMP WHERE id = :id`;

      await sequelize.query(updateQuery, {
        replacements: { stock: newStock, id: variantId || productId },
        type: QueryTypes.UPDATE,
        transaction,
      });

      // Record movement
      const movementId = uuidv4();
      const movementQuery = `
        INSERT INTO stock_movements (
          id, product_id, variant_id, movement_type, quantity,
          previous_stock, new_stock, reference_type, reference_id,
          notes, created_by, created_at
        ) VALUES (
          :id, :product_id, :variant_id, :movement_type, :quantity,
          :previous_stock, :new_stock, :reference_type, :reference_id,
          :notes, :created_by, CURRENT_TIMESTAMP
        )
      `;

      await sequelize.query(movementQuery, {
        replacements: {
          id: movementId,
          product_id: productId,
          variant_id: variantId,
          movement_type: movementType,
          quantity,
          previous_stock: previousStock,
          new_stock: newStock,
          reference_type: referenceType || null,
          reference_id: referenceId || null,
          notes: notes || null,
          created_by: userId || null,
        },
        type: QueryTypes.INSERT,
        transaction,
      });

      await transaction.commit();

      // Return the created movement
      const movement: any[] = await sequelize.query(
        `SELECT * FROM stock_movements WHERE id = :id`,
        {
          replacements: { id: movementId },
          type: QueryTypes.SELECT,
        }
      );

      return movement[0] as StockMovement;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get stock movements history
   */
  static async getStockMovements(
    productId?: string,
    variantId?: string | null,
    movementType?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<StockMovement[]> {
    const conditions: string[] = [];
    const replacements: any = { limit, offset };

    if (productId) {
      conditions.push('product_id = :product_id');
      replacements.product_id = productId;
    }
    if (variantId) {
      conditions.push('variant_id = :variant_id');
      replacements.variant_id = variantId;
    } else if (variantId === null) {
      conditions.push('variant_id IS NULL');
    }
    if (movementType) {
      conditions.push('movement_type = :movement_type');
      replacements.movement_type = movementType;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT * FROM stock_movements
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT :limit OFFSET :offset
    `;

    return (await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    })) as StockMovement[];
  }

  /**
   * Check if stock is low based on settings
   */
  static async checkLowStock(productId: string, variantId?: string | null): Promise<boolean> {
    const stock = await this.getStock(productId, variantId);

    // Get stock settings
    const settingsQuery = `
      SELECT low_stock_threshold 
      FROM stock_settings 
      WHERE product_id = :product_id 
      AND (variant_id = :variant_id OR (variant_id IS NULL AND :variant_id IS NULL))
    `;

    const settings: any[] = await sequelize.query(settingsQuery, {
      replacements: {
        product_id: productId,
        variant_id: variantId || null,
      },
      type: QueryTypes.SELECT,
    });

    const threshold = settings.length > 0 ? settings[0].low_stock_threshold : 10; // default
    return stock <= threshold;
  }

  /**
   * Get stock settings for a product/variant
   */
  static async getStockSettings(
    productId: string,
    variantId?: string | null
  ): Promise<StockSettings | null> {
    const query = `
      SELECT * FROM stock_settings
      WHERE product_id = :product_id
      AND (variant_id = :variant_id OR (variant_id IS NULL AND :variant_id IS NULL))
    `;

    const settings: any[] = await sequelize.query(query, {
      replacements: {
        product_id: productId,
        variant_id: variantId || null,
      },
      type: QueryTypes.SELECT,
    });

    return settings.length > 0 ? (settings[0] as StockSettings) : null;
  }

  /**
   * Update or create stock settings
   */
  static async updateStockSettings(
    productId: string,
    variantId: string | null,
    settings: {
      low_stock_threshold?: number;
      reorder_point?: number;
      reorder_quantity?: number;
      track_inventory?: boolean;
    }
  ): Promise<StockSettings> {
    const existing = await this.getStockSettings(productId, variantId);

    if (existing) {
      // Update existing
      const updates: string[] = [];
      const replacements: any = {
        product_id: productId,
        variant_id: variantId || null,
      };

      if (settings.low_stock_threshold !== undefined) {
        updates.push('low_stock_threshold = :low_stock_threshold');
        replacements.low_stock_threshold = settings.low_stock_threshold;
      }
      if (settings.reorder_point !== undefined) {
        updates.push('reorder_point = :reorder_point');
        replacements.reorder_point = settings.reorder_point;
      }
      if (settings.reorder_quantity !== undefined) {
        updates.push('reorder_quantity = :reorder_quantity');
        replacements.reorder_quantity = settings.reorder_quantity;
      }
      if (settings.track_inventory !== undefined) {
        updates.push('track_inventory = :track_inventory');
        replacements.track_inventory = settings.track_inventory;
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');

      const updateQuery = `
        UPDATE stock_settings
        SET ${updates.join(', ')}
        WHERE product_id = :product_id
        AND (variant_id = :variant_id OR (variant_id IS NULL AND :variant_id IS NULL))
        RETURNING *
      `;

      const updated: any[] = await sequelize.query(updateQuery, {
        replacements,
        type: QueryTypes.SELECT,
      });

      return updated[0] as StockSettings;
    } else {
      // Create new
      const insertQuery = `
        INSERT INTO stock_settings (
          id, product_id, variant_id, low_stock_threshold, reorder_point,
          reorder_quantity, track_inventory, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), :product_id, :variant_id, :low_stock_threshold,
          :reorder_point, :reorder_quantity, :track_inventory, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING *
      `;

      const created: any[] = await sequelize.query(insertQuery, {
        replacements: {
          product_id: productId,
          variant_id: variantId || null,
          low_stock_threshold: settings.low_stock_threshold ?? 10,
          reorder_point: settings.reorder_point ?? 5,
          reorder_quantity: settings.reorder_quantity ?? 20,
          track_inventory: settings.track_inventory ?? true,
        },
        type: QueryTypes.SELECT,
      });

      return created[0] as StockSettings;
    }
  }
}

