import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface MediaFolderAttributes {
  id: string;
  name: string;
  parent_id?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

interface MediaFolderCreationAttributes extends Optional<MediaFolderAttributes, 'id' | 'created_at' | 'updated_at' | 'parent_id'> {}

class MediaFolder extends Model<MediaFolderAttributes, MediaFolderCreationAttributes> implements MediaFolderAttributes {
  public id!: string;
  public name!: string;
  public parent_id?: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

MediaFolder.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'media_folders',
        key: 'id',
      },
      onDelete: 'CASCADE',
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
    tableName: 'media_folders',
    timestamps: false,
  }
);

export default MediaFolder;
