import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface SliderAttributes {
  id: string;
  title: string;
  description?: string | null;
  button_text?: string | null;
  button_link?: string | null;
  image_id?: string | null;
  image_url?: string | null;
  order_index: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface SliderCreationAttributes extends Optional<SliderAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class Slider extends Model<SliderAttributes, SliderCreationAttributes> implements SliderAttributes {
  public id!: string;
  public title!: string;
  public description!: string | null;
  public button_text!: string | null;
  public button_link!: string | null;
  public image_id!: string | null;
  public image_url!: string | null;
  public order_index!: number;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Slider.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    button_text: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    button_link: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    image_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'assets',
        key: 'id',
      },
    },
    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    order_index: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
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
    tableName: 'sliders',
    timestamps: true,
    underscored: true,
  }
);

