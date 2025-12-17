import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class ContactMessage extends Model {
  public id!: string;
  public first_name!: string;
  public last_name!: string;
  public email!: string;
  public phone!: string | null;
  public subject!: string;
  public message!: string;
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

ContactMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tableName: 'contact_messages',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default ContactMessage;







