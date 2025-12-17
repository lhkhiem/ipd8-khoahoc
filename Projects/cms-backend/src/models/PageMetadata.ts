import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface PageMetadataAttributes {
  id: string;
  path: string;
  title: string | null;
  description: string | null;
  og_image: string | null;
  keywords: string[] | null;
  enabled: boolean;
  auto_generated: boolean;
  created_at: Date;
  updated_at: Date;
}

interface PageMetadataCreationAttributes
  extends Optional<
    PageMetadataAttributes,
    'id' | 'title' | 'description' | 'og_image' | 'keywords' | 'enabled' | 'auto_generated' | 'created_at' | 'updated_at'
  > {}

export class PageMetadata
  extends Model<PageMetadataAttributes, PageMetadataCreationAttributes>
  implements PageMetadataAttributes
{
  public id!: string;
  public path!: string;
  public title!: string | null;
  public description!: string | null;
  public og_image!: string | null;
  public keywords!: string[] | null;
  public enabled!: boolean;
  public auto_generated!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

PageMetadata.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    path: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    og_image: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    keywords: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    auto_generated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: 'page_metadata',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default PageMetadata;








