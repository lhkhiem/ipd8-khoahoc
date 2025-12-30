/**
 * Course APIs Test Script for CMS Backend
 * Test các API endpoints mới cho Course Management
 * 
 * Usage: ts-node src/tests/test-course-apis.ts
 */

import '../utils/loadEnv';
import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env.API_BASE_URL || process.env.BASE_URL || 'http://localhost:3103';
const API_URL = `${BASE_URL}/api`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  response?: any;
}

class CourseAPITester {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private results: TestResult[] = [];
  private testCourseId: string | null = null;
  private testModuleId: string | null = null;
  private testSessionId: string | null = null;
  private testMaterialId: string | null = null;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000, // 30s for file uploads
      validateStatus: () => true,
      withCredentials: true,
    });
  }

  private log(message: string, color: string = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  private async test(name: string, testFn: () => Promise<void>): Promise<void> {
    try {
      await testFn();
      this.results.push({ name, passed: true });
      this.log(`  ✓ ${name}`, colors.green);
    } catch (error: any) {
      this.results.push({
        name,
        passed: false,
        error: error.message || String(error),
      });
      this.log(`  ✗ ${name}: ${error.message || String(error)}`, colors.red);
    }
  }

  // ============================================
  // Authentication
  // ============================================
  async authenticate() {
    this.log('\n🔐 Authenticating...', colors.cyan);
    
    await this.test('Login as Admin', async () => {
      const loginData = {
        email: process.env.ADMIN_EMAIL || 'admin@ipd8.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
      };

      const response = await this.client.post('/auth/login', loginData, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status !== 200) {
        throw new Error(`Login failed: ${response.status} - ${JSON.stringify(response.data)}`);
      }

      // Get token from cookie or response
      if (response.data.token) {
        this.authToken = response.data.token;
        this.client.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
      } else if (response.headers['set-cookie']) {
        // Token might be in cookie
        const cookies = response.headers['set-cookie'];
        const tokenCookie = cookies.find((c: string) => c.startsWith('token='));
        if (tokenCookie) {
          this.authToken = tokenCookie.split('=')[1].split(';')[0];
          this.client.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
        }
      }

      if (!this.authToken) {
        // Try to use cookie-based auth
        this.client.defaults.headers.common = {};
      }
    });
  }

  // ============================================
  // Course Setup
  // ============================================
  async setupTestCourse() {
    this.log('\n📚 Setting up test course...', colors.cyan);

    await this.test('Create test course', async () => {
      const courseData = {
        slug: `test-course-${Date.now()}`,
        title: 'Test Course for API Testing',
        target_audience: 'pregnant-women',
        description: 'This is a test course created for API testing purposes',
        price: 100000,
        price_type: 'one-off',
        duration_minutes: 60,
        mode: 'group',
        status: 'draft',
        featured: false,
      };

      const response = await this.client.post('/courses', courseData, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status !== 201) {
        throw new Error(`Failed to create course: ${response.status} - ${JSON.stringify(response.data)}`);
      }

      this.testCourseId = response.data.data?.id || response.data.id;
      if (!this.testCourseId) {
        throw new Error('Course ID not returned');
      }

      this.log(`  Course ID: ${this.testCourseId}`, colors.blue);
    });
  }

  // ============================================
  // Modules Tests
  // ============================================
  async testModules() {
    this.log('\n📦 Testing Modules APIs...', colors.cyan);

    await this.test('Get course modules (empty)', async () => {
      const response = await this.client.get(`/courses/${this.testCourseId}/modules`);
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
      if (!Array.isArray(response.data.data)) {
        throw new Error('Response data should be an array');
      }
    });

    await this.test('Add module to course', async () => {
      const moduleData = {
        title: 'Module 1: Introduction',
        description: 'Introduction to the course',
        duration_minutes: 30,
        order: 1,
      };

      const response = await this.client.post(
        `/courses/${this.testCourseId}/modules`,
        moduleData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status !== 201) {
        throw new Error(`Expected 201, got ${response.status} - ${JSON.stringify(response.data)}`);
      }

      this.testModuleId = response.data.data?.id || response.data.id;
      if (!this.testModuleId) {
        throw new Error('Module ID not returned');
      }
    });

    await this.test('Update module', async () => {
      const updateData = {
        title: 'Module 1: Introduction (Updated)',
        description: 'Updated description',
      };

      const response = await this.client.put(
        `/courses/${this.testCourseId}/modules/${this.testModuleId}`,
        updateData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
      if (response.data.data?.title !== updateData.title) {
        throw new Error('Module title not updated');
      }
    });

    await this.test('Reorder modules', async () => {
      // Add another module first
      const module2 = await this.client.post(
        `/courses/${this.testCourseId}/modules`,
        { title: 'Module 2', order: 2 },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const module2Id = module2.data.data?.id || module2.data.id;

      // Reorder: swap order
      const response = await this.client.put(
        `/courses/${this.testCourseId}/modules/reorder`,
        { moduleIds: [module2Id, this.testModuleId!] },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
    });

    await this.test('Delete module', async () => {
      const response = await this.client.delete(
        `/courses/${this.testCourseId}/modules/${this.testModuleId}`
      );

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
    });
  }

  // ============================================
  // Sessions Tests
  // ============================================
  async testSessions() {
    this.log('\n📅 Testing Sessions APIs...', colors.cyan);

    await this.test('Get course sessions (empty)', async () => {
      const response = await this.client.get(`/courses/${this.testCourseId}/sessions`);
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
    });

    await this.test('Add session to course', async () => {
      const sessionData = {
        title: 'Session 1: First Class',
        description: 'First class of the course',
        start_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // +2 hours
        location: 'Online',
        capacity: 20,
        meeting_type: 'google-meet',
      };

      const response = await this.client.post(
        `/courses/${this.testCourseId}/sessions`,
        sessionData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status !== 201) {
        throw new Error(`Expected 201, got ${response.status} - ${JSON.stringify(response.data)}`);
      }

      this.testSessionId = response.data.data?.id || response.data.id;
      if (!this.testSessionId) {
        throw new Error('Session ID not returned');
      }
    });

    await this.test('Update session', async () => {
      const updateData = {
        title: 'Session 1: First Class (Updated)',
        capacity: 25,
      };

      const response = await this.client.put(
        `/courses/${this.testCourseId}/sessions/${this.testSessionId}`,
        updateData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
      if (response.data.data?.capacity !== 25) {
        throw new Error('Session capacity not updated');
      }
    });

    await this.test('Update session status', async () => {
      const response = await this.client.put(
        `/courses/${this.testCourseId}/sessions/${this.testSessionId}/status`,
        { status: 'full' },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
      if (response.data.data?.status !== 'full') {
        throw new Error('Session status not updated');
      }
    });

    await this.test('Delete session', async () => {
      const response = await this.client.delete(
        `/courses/${this.testCourseId}/sessions/${this.testSessionId}`
      );

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
    });
  }

  // ============================================
  // Materials Tests
  // ============================================
  async testMaterials() {
    this.log('\n📄 Testing Materials APIs...', colors.cyan);

    await this.test('Get course materials (empty)', async () => {
      const response = await this.client.get(`/courses/${this.testCourseId}/materials`);
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
    });

    await this.test('Add material (create test file)', async () => {
      // Create a test file
      const testFileContent = 'This is a test file for material upload';
      const testFilePath = path.join(__dirname, 'test-material.txt');
      fs.writeFileSync(testFilePath, testFileContent);

      // Use form-data package for Node.js
      const FormData = require('form-data');
      const form = new FormData();
      form.append('file', fs.createReadStream(testFilePath), {
        filename: 'test-material.txt',
        contentType: 'text/plain',
      });
      form.append('title', 'Test Material');
      form.append('visibility', 'enrolled');
      form.append('provider', 'local');

      const response = await this.client.post(
        `/courses/${this.testCourseId}/materials`,
        form,
        {
          headers: {
            ...form.getHeaders(),
          },
        }
      );

      // Clean up test file
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }

      if (response.status !== 201) {
        throw new Error(`Expected 201, got ${response.status} - ${JSON.stringify(response.data)}`);
      }

      this.testMaterialId = response.data.data?.id || response.data.id;
      if (!this.testMaterialId) {
        throw new Error('Material ID not returned');
      }
    });

    await this.test('Update material (title only)', async () => {
      const updateData = {
        title: 'Test Material (Updated)',
        visibility: 'public',
      };

      const response = await this.client.put(
        `/courses/${this.testCourseId}/materials/${this.testMaterialId}`,
        updateData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
      if (response.data.data?.title !== updateData.title) {
        throw new Error('Material title not updated');
      }
    });

    await this.test('Delete material', async () => {
      const response = await this.client.delete(
        `/courses/${this.testCourseId}/materials/${this.testMaterialId}`
      );

      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
    });
  }

  // ============================================
  // Cleanup
  // ============================================
  async cleanup() {
    this.log('\n🧹 Cleaning up test data...', colors.cyan);

    if (this.testCourseId) {
      await this.test('Delete test course', async () => {
        const response = await this.client.delete(`/courses/${this.testCourseId}`);
        if (response.status !== 200 && response.status !== 404) {
          throw new Error(`Failed to delete course: ${response.status}`);
        }
      });
    }
  }

  // ============================================
  // Run All Tests
  // ============================================
  async runAllTests() {
    this.log('\n🚀 Starting Course APIs Tests...\n', colors.magenta);
    this.log(`Base URL: ${BASE_URL}`, colors.blue);
    this.log(`API URL: ${API_URL}\n`, colors.blue);

    try {
      // 1. Authenticate
      await this.authenticate();

      if (!this.authToken && !this.client.defaults.withCredentials) {
        this.log('\n⚠️  Warning: Authentication may have failed. Tests may fail due to permissions.', colors.yellow);
      }

      // 2. Setup test course
      await this.setupTestCourse();

      if (!this.testCourseId) {
        this.log('\n❌ Cannot proceed without test course. Stopping tests.', colors.red);
        this.printSummary();
        return;
      }

      // 3. Test Modules
      await this.testModules();

      // 4. Test Sessions
      await this.testSessions();

      // 5. Test Materials
      await this.testMaterials();

      // 6. Cleanup
      await this.cleanup();

      // Summary
      this.printSummary();
    } catch (error: any) {
      this.log(`\n❌ Fatal error: ${error.message}`, colors.red);
      this.printSummary();
      process.exit(1);
    }
  }

  private printSummary() {
    this.log('\n' + '='.repeat(60), colors.cyan);
    this.log('📊 TEST SUMMARY', colors.cyan);
    this.log('='.repeat(60), colors.cyan);

    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;
    const total = this.results.length;

    this.log(`\nTotal Tests: ${total}`, colors.blue);
    this.log(`Passed: ${passed}`, colors.green);
    this.log(`Failed: ${failed}`, failed > 0 ? colors.red : colors.green);

    if (failed > 0) {
      this.log('\n❌ Failed Tests:', colors.red);
      this.results
        .filter((r) => !r.passed)
        .forEach((r) => {
          this.log(`  - ${r.name}`, colors.red);
          if (r.error) {
            this.log(`    Error: ${r.error}`, colors.yellow);
          }
        });
    }

    this.log('\n' + '='.repeat(60), colors.cyan);

    if (failed === 0) {
      this.log('\n✅ All tests passed!', colors.green);
      process.exit(0);
    } else {
      this.log('\n❌ Some tests failed', colors.red);
      process.exit(1);
    }
  }
}

// Run tests
const tester = new CourseAPITester(API_URL);
tester.runAllTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

