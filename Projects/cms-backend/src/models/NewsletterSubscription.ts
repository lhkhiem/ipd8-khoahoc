import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface NewsletterSubscriptionAttributes {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  subscribed_at?: Date;
  unsubscribed_at?: Date | null;
  source?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

interface NewsletterSubscriptionCreationAttributes
  extends Optional<
    NewsletterSubscriptionAttributes,
    'id' | 'status' | 'subscribed_at' | 'unsubscribed_at' | 'source' | 'ip_address' | 'user_agent' | 'created_at' | 'updated_at'
  > {}

class NewsletterSubscription
  extends Model<NewsletterSubscriptionAttributes, NewsletterSubscriptionCreationAttributes>
  implements NewsletterSubscriptionAttributes
{
  public id!: string;
  public email!: string;
  public status!: 'active' | 'unsubscribed' | 'bounced';
  public subscribed_at!: Date;
  public unsubscribed_at!: Date | null;
  public source!: string | null;
  public ip_address!: string | null;
  public user_agent!: string | null;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

NewsletterSubscription.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    status: {
      type: DataTypes.ENUM('active', 'unsubscribed', 'bounced'),
      allowNull: false,
      defaultValue: 'active',
    },
    subscribed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    unsubscribed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING(255),
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
    tableName: 'newsletter_subscriptions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default NewsletterSubscription;








