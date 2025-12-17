import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface FAQQuestionAttributes {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type FAQQuestionCreationAttributes = Optional<
  FAQQuestionAttributes,
  'id' | 'sort_order' | 'is_active' | 'created_at' | 'updated_at'
>;

export class FAQQuestion extends Model<FAQQuestionAttributes, FAQQuestionCreationAttributes> implements FAQQuestionAttributes {
  public id!: string;
  public category_id!: string;
  public question!: string;
  public answer!: string;
  public sort_order!: number;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

FAQQuestion.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'faq_categories',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    tableName: 'faq_questions',
    timestamps: true,
    underscored: true,
  }
);

export default FAQQuestion;




