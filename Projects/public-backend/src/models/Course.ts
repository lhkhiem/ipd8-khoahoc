/**
 * Course Model for Public Backend
 * - Separate from CMS Backend (different code, same database table)
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Course extends Model {
  public id!: string;
  public slug!: string;
  public title!: string;
  public target_audience!: string;
  public description!: string;
  public benefits_mom?: string;
  public benefits_baby?: string;
  public price!: number;
  public price_type!: 'one-off' | 'subscription';
  public duration_minutes!: number;
  public mode!: 'group' | 'one-on-one';
  public status!: 'draft' | 'published';
  public featured!: boolean;
  public thumbnail_url?: string;
  public video_url?: string;
  public instructor_id?: string;
  public seo_title?: string;
  public seo_description?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Course.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    target_audience: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    benefits_mom: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    benefits_baby: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    price_type: {
      type: DataTypes.ENUM('one-off', 'subscription'),
      allowNull: false,
      defaultValue: 'one-off',
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mode: {
      type: DataTypes.ENUM('group', 'one-on-one'),
      allowNull: false,
      defaultValue: 'group',
    },
    status: {
      type: DataTypes.ENUM('draft', 'published'),
      allowNull: false,
      defaultValue: 'draft',
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    thumbnail_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    video_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    instructor_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'instructors',
        key: 'id',
      },
    },
    seo_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    seo_description: {
      type: DataTypes.TEXT,
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
    tableName: 'courses',
    timestamps: false,
  }
);

export default Course;











