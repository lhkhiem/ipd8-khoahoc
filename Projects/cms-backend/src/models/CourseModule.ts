/**
 * CourseModule Model for CMS Backend
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CourseModule extends Model {
  public id!: string;
  public course_id!: string;
  public order!: number;
  public title!: string;
  public description?: string;
  public duration_minutes?: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CourseModule.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id',
      },
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
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
    tableName: 'course_modules',
    timestamps: false,
  }
);

export default CourseModule;




