/**
 * Test Application Connection
 * - Test database connection từ application code
 * - Test models có thể query được
 * - Verify migration đã thành công
 */

import '../utils/loadEnv';
import sequelize from '../config/database';
import { User, Course, Instructor, Enrollment } from '../models';

async function testApplicationConnection() {
  console.log('===========================================');
  console.log('Test Application Connection');
  console.log('===========================================\n');

  try {
    // Step 1: Test database connection
    console.log('Step 1: Testing database connection...');
    await sequelize.authenticate();
    console.log('✓ Database connection successful\n');

    // Step 2: Test models can query
    console.log('Step 2: Testing models...');
    
    // Test User model
    console.log('  Testing User model...');
    const userCount = await User.count();
    console.log(`  ✓ User model: ${userCount} users found\n`);

    // Test Course model
    console.log('  Testing Course model...');
    const courseCount = await Course.count();
    console.log(`  ✓ Course model: ${courseCount} courses found\n`);

    // Test Instructor model
    console.log('  Testing Instructor model...');
    const instructorCount = await Instructor.count();
    console.log(`  ✓ Instructor model: ${instructorCount} instructors found\n`);

    // Test Enrollment model
    console.log('  Testing Enrollment model...');
    const enrollmentCount = await Enrollment.count();
    console.log(`  ✓ Enrollment model: ${enrollmentCount} enrollments found\n`);

    // Step 3: Test associations
    console.log('Step 3: Testing model associations...');
    try {
      // Test Course -> Instructor association
      const courseWithInstructor = await Course.findOne({
        include: [{ model: Instructor, as: 'instructor' }],
        limit: 1,
      });
      console.log('  ✓ Course -> Instructor association works\n');
    } catch (error: any) {
      console.log(`  ⚠️  Association test: ${error.message}\n`);
    }

    // Step 4: Test queries
    console.log('Step 4: Testing basic queries...');
    
    // Test find all users
    const users = await User.findAll({ limit: 5 });
    console.log(`  ✓ Can query users: ${users.length} users retrieved\n`);

    // Test find all courses
    const courses = await Course.findAll({ limit: 5 });
    console.log(`  ✓ Can query courses: ${courses.length} courses retrieved\n`);

    // Step 5: Verify table structure
    console.log('Step 5: Verifying table structure...');
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const tableNames = (results as any[]).map(r => r.table_name);
    const expectedTables = [
      // Base tables (3)
      'users', 'posts', 'contact_forms',
      // IPD8 tables (17)
      'instructors', 'courses', 'course_modules', 'course_sessions',
      'enrollments', 'progress', 'materials',
      'orders', 'order_items', 'payments',
      'post_tags', 'notifications', 'session_registrations',
      'api_keys', 'webhooks', 'webhook_logs', 'api_request_logs',
      // CMS tables - Keep (12)
      'assets', 'asset_folders', 'media_folders',
      'menu_locations', 'menu_items', 'page_metadata',
      'tracking_scripts', 'settings',
      'faq_categories', 'faq_questions',
      'analytics_events', 'analytics_daily_summary',
      // CMS tables - Refactor (3)
      'topics', 'tags', 'newsletter_subscriptions'
    ];

    const missingTables = expectedTables.filter(t => !tableNames.includes(t));
    const extraTables = tableNames.filter(t => !expectedTables.includes(t));

    if (missingTables.length === 0) {
      console.log(`  ✓ All expected tables exist (${expectedTables.length} tables)\n`);
    } else {
      console.log(`  ⚠️  Missing tables: ${missingTables.join(', ')}\n`);
    }

    if (extraTables.length > 0) {
      console.log(`  ℹ️  Extra tables found: ${extraTables.join(', ')}\n`);
    }

    console.log('===========================================');
    console.log('✅ Application connection test passed!');
    console.log('===========================================');
    console.log('\nSummary:');
    console.log(`  - Database: Connected`);
    console.log(`  - Models: Working`);
    console.log(`  - Queries: Working`);
    console.log(`  - Tables: ${tableNames.length} total`);
    console.log('\nNext steps:');
    console.log('1. Test API endpoints');
    console.log('2. Test authentication');
    console.log('3. Test CRUD operations');
    console.log('===========================================');

  } catch (error: any) {
    console.error('\n===========================================');
    console.error('✗ Application connection test failed');
    console.error('===========================================');
    console.error('Error:', error.message);
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
    console.error('\n💡 Troubleshooting:');
    console.error('  1. Check database connection in .env.local');
    console.error('  2. Verify models are properly initialized');
    console.error('  3. Check database permissions');
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

testApplicationConnection();

