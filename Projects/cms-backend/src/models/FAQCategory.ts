import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface FAQCategoryAttributes {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type FAQCategoryCreationAttributes = Optional<
  FAQCategoryAttributes,
  'id' | 'sort_order' | 'is_active' | 'created_at' | 'updated_at'
>;

export class FAQCategory extends Model<FAQCategoryAttributes, FAQCategoryCreationAttributes> implements FAQCategoryAttributes {
  public id!: string;
  public name!: string;
  public slug!: string;
  public sort_order!: number;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

FAQCategory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
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
    tableName: 'faq_categories',
    timestamps: true,
    underscored: true,
  }
);

export default FAQCategory;




