import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface TestimonialAttributes {
  id: string;
  customer_name: string;
  customer_title?: string | null;
  customer_initials?: string | null;
  testimonial_text: string;
  rating?: number | null;
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type TestimonialCreationAttributes = Optional<
  TestimonialAttributes,
  'id' | 'customer_title' | 'customer_initials' | 'rating' | 'is_featured' | 'sort_order' | 'is_active' | 'created_at' | 'updated_at'
>;

export class Testimonial
  extends Model<TestimonialAttributes, TestimonialCreationAttributes>
  implements TestimonialAttributes
{
  public id!: string;
  public customer_name!: string;
  public customer_title!: string | null;
  public customer_initials!: string | null;
  public testimonial_text!: string;
  public rating!: number | null;
  public is_featured!: boolean;
  public sort_order!: number;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Testimonial.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customer_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    customer_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    customer_initials: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    testimonial_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'testimonials',
    timestamps: true,
    underscored: true,
  }
);

export default Testimonial;



