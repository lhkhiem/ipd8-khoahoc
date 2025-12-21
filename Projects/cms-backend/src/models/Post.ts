// Model bài viết (Post)
// - Thuộc tính: title, slug, excerpt, content (TEXT), thumbnail_url, author...
// - Quan hệ:
//   + Belongs to User (author)
//   + Belongs to Instructor (expert_id)
//   + Many-to-many với Topic và Tag (định nghĩa ở model tương ứng)
// - Khớp với database schema

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Post extends Model {
  public id!: string;          // UUID, primary key
  public title!: string;       // Tiêu đề bài viết
  public slug!: string;        // URL slug, unique
  public excerpt?: string;      // Tóm tắt ngắn
  public content!: string;      // Nội dung (TEXT, không phải JSONB)
  public thumbnail_url?: string; // URL ảnh đại diện (thay thế cover_asset_id)
  public type!: string;        // 'article' | 'event' (khớp với database)
  public category?: string;     // Danh mục
  public expert_id?: string;    // ID chuyên gia (instructor)
  public event_date?: Date;     // Ngày sự kiện (cho EVENT)
  public event_location?: string; // Địa điểm (cho EVENT)
  public view_count!: number;   // Số lượt xem
  public is_featured!: boolean; // Featured content flag
  public seo_title?: string;    // SEO title (thay thế seo JSONB)
  public seo_description?: string; // SEO description (thay thế seo JSONB)
  public seo?: any;             // SEO JSONB (backward compatibility)
  public cover_asset_id?: string; // Asset ID cho cover image
  public read_time?: string;     // Read time (e.g., "5 min read")
  public header_code?: string;   // Header code (HTML/JS)
  public published_at?: Date;    // Published date
  public status!: string;       // 'draft' | 'published' | 'archived'
  public author_id?: string;    // ID tác giả
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    thumbnail_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'BLOG',
      validate: {
        isIn: [['NEWS', 'EVENT', 'BLOG', 'FAQ', 'POLICY']], // Khớp với database CHECK constraint
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
    seo: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    cover_asset_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'assets',
        key: 'id',
      },
    },
    read_time: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    header_code: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'draft',
      validate: {
        isIn: [['draft', 'published', 'archived']], // Khớp với database CHECK constraint
      },
    },
    author_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: User,
        key: 'id',
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

