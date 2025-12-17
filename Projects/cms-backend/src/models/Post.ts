// Model bài viết (Post)
// - Thuộc tính: title, slug, excerpt, content (JSONB), cover_asset, author...
// - Quan hệ:
//   + Belongs to User (author)
//   + Belongs to Asset (cover)
//   + Many-to-many với Topic và Tag (định nghĩa ở model tương ứng)

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Asset from './Asset';

class Post extends Model {
  public id!: string;          // UUID, primary key
  public title!: string;       // Tiêu đề bài viết
  public slug!: string;        // URL slug, unique
  public excerpt!: string;     // Tóm tắt ngắn
  public content!: any;        // Nội dung (JSONB)
  public cover_asset_id!: string; // ID ảnh cover
  public status!: string;      // draft/published
  public author_id!: string;   // ID tác giả
  public published_at!: Date;  // Ngày xuất bản
  public seo!: any;           // SEO metadata (JSONB)
  public header_code!: string; // Mã HTML thêm vào header
  public is_featured!: boolean; // Featured content flag
  public read_time!: string | null; // Estimated read time (e.g. "5 min read")
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
    },
    content: {
      type: DataTypes.JSONB,
    },
    cover_asset_id: {
      type: DataTypes.UUID,
      references: {
        model: Asset,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'draft',
    },
    author_id: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: 'id',
      },
    },
    published_at: {
      type: DataTypes.DATE,
    },
    seo: {
      type: DataTypes.JSONB,
    },
    header_code: {
      type: DataTypes.TEXT,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    read_time: {
      type: DataTypes.STRING(50),
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

