/**
 * Models Index for Public Backend
 * - Initialize all models and their associations
 * - Separate from CMS Backend (different code, same database)
 */

import sequelize from '../config/database';

// Import all models
import User from './User';
import Instructor from './Instructor';
import Course from './Course';
import CourseModule from './CourseModule';
import CourseSession from './CourseSession';
import Enrollment from './Enrollment';
import Progress from './Progress';
import Material from './Material';
import Order from './Order';
import OrderItem from './OrderItem';
import Payment from './Payment';
import Notification from './Notification';
import Post from './Post';

// Define associations

// User - Instructor (One-to-One)
User.hasOne(Instructor, {
  foreignKey: 'user_id',
  as: 'instructor',
});

Instructor.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Instructor - Course (One-to-Many)
Instructor.hasMany(Course, {
  foreignKey: 'instructor_id',
  as: 'courses',
});

Course.belongsTo(Instructor, {
  foreignKey: 'instructor_id',
  as: 'instructor',
});

// Course - CourseModule (One-to-Many)
Course.hasMany(CourseModule, {
  foreignKey: 'course_id',
  as: 'modules',
});

CourseModule.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course',
});

// Course - CourseSession (One-to-Many)
Course.hasMany(CourseSession, {
  foreignKey: 'course_id',
  as: 'sessions',
});

CourseSession.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course',
});

CourseSession.belongsTo(Instructor, {
  foreignKey: 'instructor_id',
  as: 'instructor',
});

// Course - Material (One-to-Many)
Course.hasMany(Material, {
  foreignKey: 'course_id',
  as: 'materials',
});

Material.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course',
});

// User - Enrollment (One-to-Many)
User.hasMany(Enrollment, {
  foreignKey: 'user_id',
  as: 'enrollments',
});

Enrollment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Course - Enrollment (One-to-Many)
Course.hasMany(Enrollment, {
  foreignKey: 'course_id',
  as: 'enrollments',
});

Enrollment.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course',
});

// Enrollment - Progress (One-to-Many)
Enrollment.hasMany(Progress, {
  foreignKey: 'enrollment_id',
  as: 'progresses',
});

Progress.belongsTo(Enrollment, {
  foreignKey: 'enrollment_id',
  as: 'enrollment',
});

// Progress - CourseModule (Many-to-One)
Progress.belongsTo(CourseModule, {
  foreignKey: 'module_id',
  as: 'module',
});

CourseModule.hasMany(Progress, {
  foreignKey: 'module_id',
  as: 'progresses',
});

// Progress - CourseSession (Many-to-One)
Progress.belongsTo(CourseSession, {
  foreignKey: 'session_id',
  as: 'session',
});

CourseSession.hasMany(Progress, {
  foreignKey: 'session_id',
  as: 'progresses',
});

// User - Order (One-to-Many)
User.hasMany(Order, {
  foreignKey: 'user_id',
  as: 'orders',
});

Order.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Order - OrderItem (One-to-Many)
Order.hasMany(OrderItem, {
  foreignKey: 'order_id',
  as: 'items',
});

OrderItem.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order',
});

// OrderItem - Course (Many-to-One)
OrderItem.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course',
});

Course.hasMany(OrderItem, {
  foreignKey: 'course_id',
  as: 'orderItems',
});

// Order - Payment (One-to-Many)
Order.hasMany(Payment, {
  foreignKey: 'order_id',
  as: 'payments',
});

Payment.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order',
});

// User - Notification (One-to-Many)
User.hasMany(Notification, {
  foreignKey: 'user_id',
  as: 'notifications',
});

Notification.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// Post - User (Many-to-One) - Author
Post.belongsTo(User, {
  foreignKey: 'author_id',
  as: 'author',
});

User.hasMany(Post, {
  foreignKey: 'author_id',
  as: 'posts',
});

// Post - Instructor (Many-to-One) - Expert
Post.belongsTo(Instructor, {
  foreignKey: 'expert_id',
  as: 'expert',
});

Instructor.hasMany(Post, {
  foreignKey: 'expert_id',
  as: 'posts',
});

// Export all models
export {
  User,
  Instructor,
  Course,
  CourseModule,
  CourseSession,
  Enrollment,
  Progress,
  Material,
  Order,
  OrderItem,
  Payment,
  Notification,
  Post,
};



















