// Initialize all models and their associations
import Post from './Post';
import sequelize from '../config/database';
import Asset from './Asset';
import User from './User';
import Topic from './Topic';
import Tag from './Tag';
import AssetFolder from './AssetFolder';
import MediaFolder from './MediaFolder';
import MenuLocation from './MenuLocation';
import MenuItem from './MenuItem';
import EducationResource from './EducationResource';
import Testimonial from './Testimonial';
import ValueProp from './ValueProp';
import ContactMessage from './ContactMessage';
import ConsultationSubmission from './ConsultationSubmission';
import AboutSection from './AboutSection';
import PageMetadata from './PageMetadata';
import NewsletterSubscription from './NewsletterSubscription';
import FAQCategory from './FAQCategory';
import FAQQuestion from './FAQQuestion';
// IPD8 Models
import Instructor from './Instructor';
import Course from './Course';
import CourseModule from './CourseModule';
import CourseSession from './CourseSession';
import Material from './Material';
import Enrollment from './Enrollment';
import Progress from './Progress';
import Order from './Order';
import OrderItem from './OrderItem';
import Payment from './Payment';
import Notification from './Notification';

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

// IPD8 Associations
// Instructor associations
Instructor.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasOne(Instructor, {
  foreignKey: 'user_id',
  as: 'instructor',
});

Instructor.hasMany(Course, {
  foreignKey: 'instructor_id',
  as: 'courses',
});

// Course associations
Course.belongsTo(Instructor, {
  foreignKey: 'instructor_id',
  as: 'instructor',
});

Course.hasMany(CourseModule, {
  foreignKey: 'course_id',
  as: 'modules',
});

Course.hasMany(CourseSession, {
  foreignKey: 'course_id',
  as: 'sessions',
});

Course.hasMany(Material, {
  foreignKey: 'course_id',
  as: 'materials',
});

Course.hasMany(Enrollment, {
  foreignKey: 'course_id',
  as: 'enrollments',
});

// CourseModule associations
CourseModule.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course',
});

// CourseSession associations
CourseSession.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course',
});

CourseSession.belongsTo(Instructor, {
  foreignKey: 'instructor_id',
  as: 'instructor',
});

// Material associations
Material.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course',
});

// Enrollment associations
Enrollment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Enrollment.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course',
});

Enrollment.hasMany(Progress, {
  foreignKey: 'enrollment_id',
  as: 'progresses',
});

// Progress associations
Progress.belongsTo(Enrollment, {
  foreignKey: 'enrollment_id',
  as: 'enrollment',
});

Progress.belongsTo(CourseModule, {
  foreignKey: 'module_id',
  as: 'module',
});

Progress.belongsTo(CourseSession, {
  foreignKey: 'session_id',
  as: 'session',
});

// Order associations
Order.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Order.hasMany(OrderItem, {
  foreignKey: 'order_id',
  as: 'items',
});

Order.hasMany(Payment, {
  foreignKey: 'order_id',
  as: 'payments',
});

// OrderItem associations
OrderItem.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order',
});

OrderItem.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course',
});

// Payment associations
Payment.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order',
});

// Notification associations
Notification.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasMany(Notification, {
  foreignKey: 'user_id',
  as: 'notifications',
});

// Export all models
export {
  Post,
  Asset,
  User,
  Topic,
  Tag,
  AssetFolder,
  MediaFolder,
  MenuLocation,
  MenuItem,
  EducationResource,
  Testimonial,
  ValueProp,
  ContactMessage,
  ConsultationSubmission,
  AboutSection,
  PageMetadata,
  NewsletterSubscription,
  FAQCategory,
  FAQQuestion,
  // IPD8 Models
  Instructor,
  Course,
  CourseModule,
  CourseSession,
  Material,
  Enrollment,
  Progress,
  Order,
  OrderItem,
  Payment,
  Notification,
};

