// Model User 
// - Lưu thông tin người dùng: email, password hash, name...
// - is_active: true/false (thay thế status)
// - Có quan hệ One-to-Many với Post (author)
// - Khớp với database schema

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
  public id!: string;           // UUID, primary key
  public email!: string;        // Email, unique
  public password_hash!: string; // Mật khẩu đã hash
  public name!: string;         // Tên hiển thị
  public role!: string;         // 'guest', 'student', 'instructor', 'admin' (theo DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md)
  public phone?: string;        // Số điện thoại
  public address?: string;       // Địa chỉ
  public gender?: string;        // 'male', 'female', 'other'
  public dob?: Date;            // Ngày sinh
  public avatar_url?: string;   // URL ảnh đại diện
  public email_verified?: boolean; // Email đã xác thực
  public phone_verified?: boolean;  // SĐT đã xác thực
  public is_active!: boolean;   // true = active, false = inactive (thay thế status)
  public last_login_at?: Date;  // Lần đăng nhập cuối
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
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'guest',
      validate: {
        isIn: [['guest', 'student', 'instructor', 'admin']], // Khớp với DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        isIn: [['male', 'female', 'other']],
      },
    },
    dob: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    phone_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    last_login_at: {
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
    tableName: 'users',
    timestamps: false,
  }
);

export default User;

