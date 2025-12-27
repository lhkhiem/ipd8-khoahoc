/**
 * Instructor Model for Public Backend
 * - Separate from CMS Backend (different code, same database table)
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Instructor extends Model {
  public id!: string;
  public user_id!: string;
  public title?: string; // 'TS.', 'BS.', 'ThS.', 'CN.'
  public credentials!: string;
  public bio?: string;
  public specialties?: string; // JSON array as string
  public achievements?: string; // JSON array as string
  public rating!: number;
  public total_courses!: number;
  public is_featured!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Instructor.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    credentials: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    specialties: {
      type: DataTypes.TEXT,
      allowNull: true,
      // Store as JSON string, parse when needed
    },
    achievements: {
      type: DataTypes.TEXT,
      allowNull: true,
      // Store as JSON string, parse when needed
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    total_courses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'instructors',
    timestamps: false,
  }
);

export default Instructor;



















