// Initialize all models and their associations
import Post from './Post';
import sequelize from '../config/database';
import Asset from './Asset';
import User from './User';
import Topic from './Topic';
import Tag from './Tag';
import { Product } from './Product';
import { ProductCategory } from './ProductCategory';
import { Brand } from './Brand';
import AssetFolder from './AssetFolder';
import MediaFolder from './MediaFolder';
import MenuLocation from './MenuLocation';
import MenuItem from './MenuItem';
import EducationResource from './EducationResource';
import Testimonial from './Testimonial';
import ValueProp from './ValueProp';
import { ProductOption } from './ProductOption';
import Address from './Address';
import ContactMessage from './ContactMessage';
import ConsultationSubmission from './ConsultationSubmission';
import AboutSection from './AboutSection';
import PageMetadata from './PageMetadata';
import NewsletterSubscription from './NewsletterSubscription';
import FAQCategory from './FAQCategory';
import FAQQuestion from './FAQQuestion';

// Define all associations here
// Define explicit through models (no timestamps) for many-to-many junctions
const PostTopic = sequelize.define('post_topics', {}, { 
  tableName: 'post_topics', 
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});
const PostTag = sequelize.define('post_tags', {}, { 
  tableName: 'post_tags', 
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});
// Post associations
Post.belongsTo(Asset, {
  foreignKey: 'cover_asset_id',
  as: 'cover_asset',
});

Post.belongsTo(User, {
  foreignKey: 'author_id',
  as: 'author',
});

// Many-to-many for Post-Topic and Post-Tag
Post.belongsToMany(Topic, {
  through: PostTopic,
  foreignKey: 'post_id',
  otherKey: 'topic_id',
  as: 'topics',
});

Topic.belongsToMany(Post, {
  through: PostTopic,
  foreignKey: 'topic_id',
  otherKey: 'post_id',
  as: 'posts',
});

Post.belongsToMany(Tag, {
  through: PostTag,
  foreignKey: 'post_id',
  otherKey: 'tag_id',
  as: 'tags',
});

Tag.belongsToMany(Post, {
  through: PostTag,
  foreignKey: 'tag_id',
  otherKey: 'post_id',
  as: 'posts',
});

// Menu associations
MenuLocation.hasMany(MenuItem, {
  foreignKey: 'menu_location_id',
  as: 'items',
});

MenuItem.belongsTo(MenuLocation, {
  foreignKey: 'menu_location_id',
  as: 'location',
});

MenuItem.hasMany(MenuItem, {
  foreignKey: 'parent_id',
  as: 'children',
});

MenuItem.belongsTo(MenuItem, {
  foreignKey: 'parent_id',
  as: 'parent',
});

// Address associations
Address.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasMany(Address, {
  foreignKey: 'user_id',
  as: 'addresses',
});

// Contact Message associations
ContactMessage.belongsTo(User, {
  foreignKey: 'assigned_to',
  as: 'assignedUser',
});

ContactMessage.belongsTo(User, {
  foreignKey: 'replied_by',
  as: 'repliedByUser',
});

User.hasMany(ContactMessage, {
  foreignKey: 'assigned_to',
  as: 'assignedMessages',
});

User.hasMany(ContactMessage, {
  foreignKey: 'replied_by',
  as: 'repliedMessages',
});

// Consultation Submission associations
ConsultationSubmission.belongsTo(User, {
  foreignKey: 'assigned_to',
  as: 'assignedUser',
});

ConsultationSubmission.belongsTo(User, {
  foreignKey: 'replied_by',
  as: 'repliedByUser',
});

User.hasMany(ConsultationSubmission, {
  foreignKey: 'assigned_to',
  as: 'assignedConsultations',
});

User.hasMany(ConsultationSubmission, {
  foreignKey: 'replied_by',
  as: 'repliedConsultations',
});

// FAQ associations
FAQCategory.hasMany(FAQQuestion, {
  foreignKey: 'category_id',
  as: 'questions',
});

FAQQuestion.belongsTo(FAQCategory, {
  foreignKey: 'category_id',
  as: 'category',
});

// Export all models
export {
  Post,
  Asset,
  User,
  Topic,
  Tag,
  Product,
  ProductCategory,
  Brand,
  AssetFolder,
  MediaFolder,
  MenuLocation,
  MenuItem,
  EducationResource,
  Testimonial,
  ValueProp,
  ProductOption,
  Address,
  ContactMessage,
  ConsultationSubmission,
  AboutSection,
  PageMetadata,
  NewsletterSubscription,
  FAQCategory,
  FAQQuestion,
};

