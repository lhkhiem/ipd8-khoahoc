/**
 * Payment Model for Public Backend
 * - Separate from CMS Backend (different code, same database table)
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Payment extends Model {
  public id!: string;
  public order_id!: string;
  public amount!: number;
  public payment_method!: 'zalopay' | 'vnpay' | 'momo' | 'bank_transfer';
  public status!: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  public transaction_id?: string;
  public gateway_response?: string; // JSON string
  public paid_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Payment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM('zalopay', 'vnpay', 'momo', 'bank_transfer'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    transaction_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    gateway_response: {
      type: DataTypes.TEXT,
      allowNull: true,
      // Store gateway response as JSON string
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'payments',
    timestamps: false,
  }
);

export default Payment;



















