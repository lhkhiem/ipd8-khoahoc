import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface AboutSectionAttributes {
  id: string;
  section_key: string; // 'welcome' or 'giving_back'
  title?: string | null;
  content?: string | null; // HTML content
  image_url?: string | null;
  button_text?: string | null;
  button_link?: string | null;
  list_items?: any | null; // JSONB for list items
  order_index: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type AboutSectionCreationAttributes = Optional<
  AboutSectionAttributes,
  'id' | 'title' | 'content' | 'image_url' | 'button_text' | 'button_link' | 'list_items' | 'order_index' | 'is_active' | 'created_at' | 'updated_at'
>;

export class AboutSection extends Model<AboutSectionAttributes, AboutSectionCreationAttributes> implements AboutSectionAttributes {
  public id!: string;
  public section_key!: string;
  public title!: string | null;
  public content!: string | null;
  public image_url!: string | null;
  public button_text!: string | null;
  public button_link!: string | null;
  public list_items!: any | null;
  public order_index!: number;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

AboutSection.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    section_key: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    button_text: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    button_link: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    list_items: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    order_index: {
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
    tableName: 'about_sections',
    timestamps: true,
    underscored: true,
  }
);

export default AboutSection;




