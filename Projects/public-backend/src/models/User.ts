/**
 * User Model for Public Backend
 * - Separate from CMS Backend (different code, same database table)
 * - User-level authentication (not admin)
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class User extends Model {
  public id!: string;
  public email!: string;
  public password_hash!: string;
  public name!: string;
  public phone?: string;
  public address?: string;
  public gender?: string;
  public dob?: Date;
  public avatar_url?: string;
  public role!: string; // 'guest', 'student', 'instructor', 'admin' (theo DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md)
  public is_active!: boolean; // true = active, false = inactive
  public email_verified?: boolean;
  public phone_verified?: boolean;
  public last_login_at?: Date;
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
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    },
    dob: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'guest',
      validate: {
        isIn: [['guest', 'student', 'instructor', 'admin']], // Khớp với DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md
      },
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    phone_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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


