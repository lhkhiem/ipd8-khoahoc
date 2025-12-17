// Model Asset (Media)
// - Quản lý files/media: ảnh, video...
// - Hỗ trợ nhiều provider (local, s3...)
// - Lưu thông tin kích thước và các phiên bản đã resize
// - Có quan hệ One-to-Many với Post (cover image)

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Asset extends Model {
  public id!: string;         // UUID, primary key
  public type!: string;       // Loại file (image, video...)
  public provider!: string;   // Provider lưu trữ (local, s3...)
  public url!: string;        // URL gốc
  public cdn_url!: string;    // URL qua CDN (nếu có) 
  public width!: number;      // Chiều rộng (với ảnh)
  public height!: number;     // Chiều cao (với ảnh)
  public format!: string;     // Định dạng file
  public sizes!: any;        // Các size đã resize (JSONB)
  public folder_id?: string | null; // Thư mục chứa asset
  public readonly created_at!: Date;
}

Asset.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING(50),
      defaultValue: 's3',
    },
    url: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
    cdn_url: {
      type: DataTypes.STRING(1024),
    },
    width: {
      type: DataTypes.INTEGER,
    },
    height: {
      type: DataTypes.INTEGER,
    },
    format: {
      type: DataTypes.STRING(50),
    },
    sizes: {
      type: DataTypes.JSONB,
    },
    folder_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'assets',
    timestamps: false,
  }
);

export default Asset;

