import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MenuItemAttributes {
  id: string;
  menu_location_id: string;
  parent_id?: string;
  title: string;
  url?: string;
  icon?: string;
  type: string;
  entity_id?: string;
  target: string;
  rel?: string;
  css_classes?: string;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface MenuItemCreationAttributes extends Optional<MenuItemAttributes, 'id' | 'created_at' | 'updated_at' | 'parent_id' | 'url' | 'icon' | 'entity_id' | 'rel' | 'css_classes' | 'sort_order' | 'is_active' | 'target' | 'type'> {}

class MenuItem extends Model<MenuItemAttributes, MenuItemCreationAttributes> implements MenuItemAttributes {
  public id!: string;
  public menu_location_id!: string;
  public parent_id?: string;
  public title!: string;
  public url?: string;
  public icon?: string;
  public type!: string;
  public entity_id?: string;
  public target!: string;
  public rel?: string;
  public css_classes?: string;
  public sort_order!: number;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;
}

MenuItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    menu_location_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'custom',
    },
    entity_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    target: {
      type: DataTypes.STRING(20),
      defaultValue: '_self',
    },
    rel: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    css_classes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    tableName: 'menu_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default MenuItem;






































