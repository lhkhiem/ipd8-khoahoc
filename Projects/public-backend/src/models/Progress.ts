/**
 * Progress Model for Public Backend
 * - Separate from CMS Backend (different code, same database table)
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Progress extends Model {
  public id!: string;
  public enrollment_id!: string;
  public module_id?: string;
  public session_id?: string;
  public progress_percent!: number;
  public feedback?: string;
  public completed_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Progress.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    enrollment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'enrollments',
        key: 'id',
      },
    },
    module_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'course_modules',
        key: 'id',
      },
    },
    session_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'course_sessions',
        key: 'id',
      },
    },
    progress_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    completed_at: {
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
    tableName: 'progress',
    timestamps: false,
  }
);

export default Progress;











