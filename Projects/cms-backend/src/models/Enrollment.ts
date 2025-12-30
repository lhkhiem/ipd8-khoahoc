/**
 * Enrollment Model for CMS Backend
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Enrollment extends Model {
  public id!: string;
  public user_id!: string;
  public course_id!: string;
  public type!: 'trial' | 'standard' | 'combo' | '3m' | '6m' | '12m' | '24m';
  public status!: 'pending' | 'active' | 'cancelled' | 'completed';
  public start_date?: Date;
  public end_date?: Date;
  public progress_percent!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Enrollment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
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
    type: {
      type: DataTypes.ENUM('trial', 'standard', 'combo', '3m', '6m', '12m', '24m'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    progress_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.0,
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
    tableName: 'enrollments',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'course_id'],
      },
    ],
  }
);

export default Enrollment;
















