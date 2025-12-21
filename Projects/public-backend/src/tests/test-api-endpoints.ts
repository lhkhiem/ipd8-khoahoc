/**
 * API Endpoints Test Script
 * Test các API endpoints của Public Backend
 * 
 * Usage: ts-node src/tests/test-api-endpoints.ts
 */

import '../utils/loadEnv';
import axios, { AxiosInstance } from 'axios';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3101';
const API_URL = `${BASE_URL}/api/public`;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  response?: any;
}

class APITester {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private testUser: { email: string; password: string; name: string } | null = null;
  private results: TestResult[] = [];

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      validateStatus: () => true, // Don't throw on any status
      withCredentials: true, // Include cookies
    });
  }

  private log(message: string, color: string = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  private async test(name: string, testFn: () => Promise<void>): Promise<void> {
    try {
      await testFn();
      this.results.push({ name, passed: true });
      this.log(`✓ ${name}`, colors.green);
    } catch (error: any) {
      this.results.push({
        name,
        passed: false,
        error: error.message || String(error),
      });
      this.log(`✗ ${name}: ${error.message || String(error)}`, colors.red);
    }
  }

  // ============================================
  // 1. Health Check
  // ============================================
  async testHealthCheck() {
    await this.test('Health Check', async () => {
      // Health check is at root, not under /api/public
      const response = await axios.get(`${BASE_URL}/health`, {
        timeout: 5000,
        validateStatus: () => true,
      });
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
      if (response.data.status !== 'ok') {
        throw new Error(`Expected status 'ok', got '${response.data.status}'`);
      }
    });
  }

  // ============================================
  // 2. Authentication Endpoints
  // ============================================
  async testAuthEndpoints() {
    // Generate unique test user
    const timestamp = Date.now();
    this.testUser = {
      email: `test${timestamp}@example.com`,
      password: 'Test123!@#',
      name: `Test User ${timestamp}`,
    };

    // Test Register
    await this.test('Register User', async () => {
      const response = await this.client.post('/auth/register', {
        email: this.testUser!.email,
        password: this.testUser!.password,
        name: this.testUser!.name,
      });

      if (response.status !== 201 && response.status !== 200) {
        throw new Error(
          `Expected 201/200, got ${response.status}. Response: ${JSON.stringify(response.data)}`
        );
      }

      // Check if token is returned
      if (response.data.token || response.data.accessToken) {
        this.authToken = response.data.token || response.data.accessToken;
      }
    });

    // Test Login
    await this.test('Login User', async () => {
      const response = await this.client.post('/auth/login', {
        email: this.testUser!.email,
        password: this.testUser!.password,
      });

      if (response.status !== 200) {
        throw new Error(
          `Expected 200, got ${response.status}. Response: ${JSON.stringify(response.data)}`
        );
      }

      // Store token for authenticated requests
      if (response.data.token || response.data.accessToken) {
        this.authToken = response.data.token || response.data.accessToken;
        this.client.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
      }
    });

    // Test Verify Session (if authenticated)
    if (this.authToken) {
      await this.test('Verify Session', async () => {
        const response = await this.client.get('/auth/verify');
        if (response.status !== 200) {
          throw new Error(
            `Expected 200, got ${response.status}. Response: ${JSON.stringify(response.data)}`
          );
        }
      });
    }
  }

  // ============================================
  // 3. Courses Endpoints
  // ============================================
  async testCoursesEndpoints() {
    // Test List Courses (public, no auth required)
    await this.test('List Courses (Public)', async () => {
      const response = await this.client.get('/courses');
      if (response.status !== 200) {
        throw new Error(
          `Expected 200, got ${response.status}. Response: ${JSON.stringify(response.data)}`
        );
      }
      // Response format: { success: true, data: [...], pagination: {...} }
      if (!response.data.success) {
        throw new Error('Expected success: true in response');
      }
      if (!Array.isArray(response.data.data)) {
        throw new Error('Expected data to be an array');
      }
    });

    // Test Get Course Detail (public, no auth required)
    await this.test('Get Course Detail (Public)', async () => {
      // Try to get first course if available
      const listResponse = await this.client.get('/courses');
      const courses = Array.isArray(listResponse.data?.data)
        ? listResponse.data.data
        : [];

      if (courses.length > 0) {
        const courseId = courses[0].id || courses[0].slug;
        const response = await this.client.get(`/courses/${courseId}`);
        if (response.status !== 200 && response.status !== 404) {
          throw new Error(
            `Expected 200 or 404, got ${response.status}. Response: ${JSON.stringify(response.data)}`
          );
        }
      } else {
        this.log('  ⚠ No courses found, skipping detail test', colors.yellow);
      }
    });
  }

  // ============================================
  // 4. Instructors Endpoints
  // ============================================
  async testInstructorsEndpoints() {
    // Test List Instructors (public, no auth required)
    await this.test('List Instructors (Public)', async () => {
      const response = await this.client.get('/instructors');
      if (response.status !== 200) {
        throw new Error(
          `Expected 200, got ${response.status}. Response: ${JSON.stringify(response.data)}`
        );
      }
      // Response format: { success: true, data: [...], pagination: {...} }
      if (!response.data.success) {
        throw new Error('Expected success: true in response');
      }
      if (!Array.isArray(response.data.data)) {
        throw new Error('Expected data to be an array');
      }
    });
  }

  // ============================================
  // 5. Profile Endpoints (requires auth)
  // ============================================
  async testProfileEndpoints() {
    if (!this.authToken) {
      this.log('  ⚠ No auth token, skipping profile tests', colors.yellow);
      return;
    }

    // Test Get Profile
    await this.test('Get Profile (Authenticated)', async () => {
      const response = await this.client.get('/profile');
      if (response.status !== 200) {
        throw new Error(
          `Expected 200, got ${response.status}. Response: ${JSON.stringify(response.data)}`
        );
      }
    });

    // Test Update Profile
    await this.test('Update Profile (Authenticated)', async () => {
      const response = await this.client.put('/profile', {
        name: 'Updated Test User',
      });
      if (response.status !== 200) {
        throw new Error(
          `Expected 200, got ${response.status}. Response: ${JSON.stringify(response.data)}`
        );
      }
    });
  }

  // ============================================
  // 6. Enrollments Endpoints (requires auth)
  // ============================================
  async testEnrollmentsEndpoints() {
    if (!this.authToken) {
      this.log('  ⚠ No auth token, skipping enrollment tests', colors.yellow);
      return;
    }

    // Test Get My Enrollments
    await this.test('Get My Enrollments (Authenticated)', async () => {
      const response = await this.client.get('/enrollments');
      if (response.status !== 200) {
        throw new Error(
          `Expected 200, got ${response.status}. Response: ${JSON.stringify(response.data)}`
        );
      }
      // Should return array
      if (!Array.isArray(response.data) && !Array.isArray(response.data.enrollments)) {
        throw new Error('Expected array of enrollments');
      }
    });
  }

  // ============================================
  // 7. Models Connection Test
  // ============================================
  async testModelsConnection() {
    await this.test('Database Models Connection', async () => {
      // Try to query users table through an endpoint that uses models
      const response = await this.client.get('/auth/verify');
      // If we get any response (even 401), models are working
      if (response.status >= 500) {
        throw new Error('Database connection or models issue');
      }
    });
  }

  // ============================================
  // Run All Tests
  // ============================================
  async runAllTests() {
    this.log('\n🚀 Starting API Endpoints Tests...\n', colors.cyan);
    this.log(`Base URL: ${BASE_URL}`, colors.blue);
    this.log(`API URL: ${API_URL}\n`, colors.blue);

    try {
      // 1. Health Check
      this.log('\n📋 1. Health Check', colors.cyan);
      await this.testHealthCheck();

      // 2. Models Connection
      this.log('\n📋 2. Models Connection', colors.cyan);
      await this.testModelsConnection();

      // 3. Authentication
      this.log('\n📋 3. Authentication Endpoints', colors.cyan);
      await this.testAuthEndpoints();

      // 4. Courses
      this.log('\n📋 4. Courses Endpoints', colors.cyan);
      await this.testCoursesEndpoints();

      // 5. Instructors
      this.log('\n📋 5. Instructors Endpoints', colors.cyan);
      await this.testInstructorsEndpoints();

      // 6. Profile (requires auth)
      this.log('\n📋 6. Profile Endpoints', colors.cyan);
      await this.testProfileEndpoints();

      // 7. Enrollments (requires auth)
      this.log('\n📋 7. Enrollments Endpoints', colors.cyan);
      await this.testEnrollmentsEndpoints();

      // Summary
      this.printSummary();
    } catch (error: any) {
      this.log(`\n❌ Fatal error: ${error.message}`, colors.red);
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
          this.log(`  - ${r.name}: ${r.error}`, colors.red);
        });
    }

    this.log('\n' + '='.repeat(60) + '\n', colors.cyan);

    if (failed === 0) {
      this.log('✅ All tests passed!', colors.green);
      process.exit(0);
    } else {
      this.log('❌ Some tests failed. Please check the errors above.', colors.red);
      process.exit(1);
    }
  }
}

// Run tests
const tester = new APITester(API_URL);
tester.runAllTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

