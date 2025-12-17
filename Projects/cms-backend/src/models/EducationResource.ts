import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface EducationResourceAttributes {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  image_url: string;
  link_url: string;
  link_text?: string | null;
  duration?: string | null;
  ceus?: string | null;
  level?: string | null;
  resource_type?: string | null;
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type EducationResourceCreationAttributes = Optional<
  EducationResourceAttributes,
  'id' | 'slug' | 'description' | 'link_text' | 'duration' | 'ceus' | 'level' | 'resource_type' | 'is_featured' | 'sort_order' | 'is_active' | 'created_at' | 'updated_at'
>;

export class EducationResource
  extends Model<EducationResourceAttributes, EducationResourceCreationAttributes>
  implements EducationResourceAttributes
{
  public id!: string;
  public title!: string;
  public slug!: string;
  public description!: string | null;
  public image_url!: string;
  public link_url!: string;
  public link_text!: string | null;
  public duration!: string | null;
  public ceus!: string | null;
  public level!: string | null;
  public resource_type!: string | null;
  public is_featured!: boolean;
  public sort_order!: number;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

EducationResource.init(
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
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
    link_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    link_text: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Learn More',
    },
    duration: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ceus: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    level: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    resource_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'course',
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
    tableName: 'education_resources',
    timestamps: true,
    underscored: true,
  }
);

export default EducationResource;



