import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MenuLocationAttributes {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface MenuLocationCreationAttributes extends Optional<MenuLocationAttributes, 'id' | 'created_at' | 'updated_at' | 'description' | 'is_active'> {}

class MenuLocation extends Model<MenuLocationAttributes, MenuLocationCreationAttributes> implements MenuLocationAttributes {
  public id!: string;
  public name!: string;
  public slug!: string;
  public description?: string;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

MenuLocation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: 'menu_locations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default MenuLocation;






































