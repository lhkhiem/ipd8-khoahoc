/**
 * Post Model for Public Backend
 * - Separate from CMS Backend (different code, same database table)
 * - Used for displaying content (articles, events)
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Post extends Model {
  public id!: string;
  public slug!: string;
  public title!: string;
  public content!: string; // TEXT (not JSONB)
  public excerpt?: string;
  public thumbnail_url?: string;
  public type!: 'article' | 'event';
  public category?: string;
  public expert_id?: string;
  public event_date?: Date;
  public event_location?: string;
  public view_count!: number;
  public is_featured!: boolean;
  public seo_title?: string;
  public seo_description?: string;
  public author_id?: string;
  public status!: 'draft' | 'published' | 'archived';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Post.init(
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    thumbnail_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'article',
      validate: {
        isIn: [['article', 'event']],
      },
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    expert_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'instructors',
        key: 'id',
      },
    },
    event_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    event_location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    view_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    seo_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    seo_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    author_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'draft',
      validate: {
        isIn: [['draft', 'published', 'archived']],
      },
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
    tableName: 'posts',
    timestamps: false,
  }
);

export default Post;


