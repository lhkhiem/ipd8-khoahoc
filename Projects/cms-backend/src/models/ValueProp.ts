import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface ValuePropAttributes {
  id: string;
  title: string;
  subtitle?: string | null;
  icon_key?: string | null;
  icon_color?: string | null;
  icon_background?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type ValuePropCreationAttributes = Optional<
  ValuePropAttributes,
  'id' | 'subtitle' | 'icon_key' | 'icon_color' | 'icon_background' | 'sort_order' | 'is_active' | 'created_at' | 'updated_at'
>;

export class ValueProp extends Model<ValuePropAttributes, ValuePropCreationAttributes> implements ValuePropAttributes {
  public id!: string;
  public title!: string;
  public subtitle!: string | null;
  public icon_key!: string | null;
  public icon_color!: string | null;
  public icon_background!: string | null;
  public sort_order!: number;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ValueProp.init(
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
    subtitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    icon_key: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    icon_color: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    icon_background: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
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
    tableName: 'value_props',
    timestamps: true,
    underscored: true,
  }
);

export default ValueProp;



