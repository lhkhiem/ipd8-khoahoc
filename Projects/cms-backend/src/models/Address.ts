// Address model
// Customer shipping and billing addresses

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Address extends Model {
  public id!: string;
  public user_id!: string;
  public first_name!: string;
  public last_name!: string;
  public company?: string;
  public address_line1!: string;
  public address_line2?: string;
  public city!: string;
  public state!: string;
  public postal_code!: string;
  public country!: string;
  public phone?: string;
  public is_default!: boolean;
  public type!: 'shipping' | 'billing' | 'both';
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Address.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    company: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    address_line1: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address_line2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'United States',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    type: {
      type: DataTypes.STRING(20),
      defaultValue: 'both',
      validate: {
        isIn: [['shipping', 'billing', 'both']],
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
    tableName: 'addresses',
    timestamps: false,
  }
);

export default Address;

