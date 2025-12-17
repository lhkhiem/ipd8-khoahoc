import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class ConsultationSubmission extends Model {
  public id!: string;
  public name!: string;
  public phone!: string;
  public email!: string | null;
  public province!: string;
  public message!: string | null;
  public status!: string;
  public assigned_to!: string | null;
  public replied_at!: Date | null;
  public replied_by!: string | null;
  public reply_message!: string | null;
  public ip_address!: string | null;
  public user_agent!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ConsultationSubmission.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    province: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'new',
    },
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    replied_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    replied_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reply_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'consultation_submissions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default ConsultationSubmission;

