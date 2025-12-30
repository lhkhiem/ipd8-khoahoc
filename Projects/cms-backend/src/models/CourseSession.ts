/**
 * CourseSession Model for CMS Backend
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class CourseSession extends Model {
  public id!: string;
  public course_id!: string;
  public instructor_id?: string;
  public order?: number;
  public title!: string;
  public description?: string;
  public start_time!: Date;
  public end_time!: Date;
  public location?: string;
  public capacity!: number;
  public enrolled_count!: number;
  public status!: 'scheduled' | 'full' | 'cancelled' | 'done';
  public meeting_link?: string;
  public meeting_type?: 'google-meet' | 'zoom' | 'offline';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

CourseSession.init(
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
    instructor_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'instructors',
        key: 'id',
      },
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    enrolled_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'full', 'cancelled', 'done'),
      allowNull: false,
      defaultValue: 'scheduled',
    },
    meeting_link: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    meeting_type: {
      type: DataTypes.ENUM('google-meet', 'zoom', 'offline'),
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
    tableName: 'course_sessions',
    timestamps: false,
  }
);

export default CourseSession;
















