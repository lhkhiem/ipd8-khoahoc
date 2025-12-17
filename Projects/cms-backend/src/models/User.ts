// Model User 
// - Lưu thông tin người dùng: email, password hash, name...
// - Status: active/inactive
// - Có quan hệ One-to-Many với Post (author)

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
  public id!: string;           // UUID, primary key
  public email!: string;        // Email, unique
  public password_hash!: string; // Mật khẩu đã hash
  public name!: string;         // Tên hiển thị
  public status!: string;       // active/inactive
  public role!: string;         // owner/admin/editor/author
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'active',
    },
    role: {
      type: DataTypes.STRING(50),
      defaultValue: 'admin',
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
    tableName: 'users',
    timestamps: false,
  }
);

export default User;

