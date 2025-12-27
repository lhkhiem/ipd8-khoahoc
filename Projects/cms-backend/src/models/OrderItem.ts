/**
 * OrderItem Model for CMS Backend
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class OrderItem extends Model {
  public id!: string;
  public order_id!: string;
  public course_id!: string;
  public enrollment_type!: 'trial' | 'standard' | 'combo' | '3m' | '6m' | '12m' | '24m';
  public price!: number;
  public quantity!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

OrderItem.init(
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
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id',
      },
    },
    enrollment_type: {
      type: DataTypes.ENUM('trial', 'standard', 'combo', '3m', '6m', '12m', '24m'),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
    tableName: 'order_items',
    timestamps: false,
  }
);

export default OrderItem;











