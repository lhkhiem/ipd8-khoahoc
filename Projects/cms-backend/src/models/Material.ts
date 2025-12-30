/**
 * Material Model for CMS Backend
 */

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Material extends Model {
  public id!: string;
  public course_id!: string;
  public title!: string;
  public file_key!: string;
  public file_url!: string;
  public mime_type!: string;
  public size!: number;
  public visibility!: 'public' | 'private' | 'enrolled';
  public provider!: string;
  public download_count!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Material.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    file_key: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    visibility: {
      type: DataTypes.ENUM('public', 'private', 'enrolled'),
      allowNull: false,
      defaultValue: 'enrolled',
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    download_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'materials',
    timestamps: false,
  }
);

export default Material;
















