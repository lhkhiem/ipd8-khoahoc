import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class AssetFolder extends Model {
  public id!: string;
  public name!: string;
  public parent_id?: string | null;
  public path?: string | null;
  public readonly created_at!: Date;
}

AssetFolder.init(
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
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    path: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'asset_folders',
    timestamps: false,
  }
);

export default AssetFolder;
