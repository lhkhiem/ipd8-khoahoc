/**
 * API Endpoints Test Script for CMS Backend
 * Test các API endpoints của CMS Backend
 * 
 * Usage: ts-node src/tests/test-api-endpoints.ts
 */

import '../utils/loadEnv';
import axios, { AxiosInstance } from 'axios';

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
  private results: TestResult[] = [];

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
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
      const response = await this.client.get('/health');
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
      if (response.data.status !== 'ok') {
        throw new Error(`Expected status 'ok', got '${response.data.status}'`);
      }
    });
  }

  // ============================================
  // 2. Database Health
  // ============================================
  async testDatabaseHealth() {
    await this.test('Database Health Check', async () => {
      const response = await this.client.get('/health/db');
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
      if (!response.data.ok) {
        throw new Error('Database connection failed');
      }
    });
  }

  // ============================================
  // 3. Authentication Endpoints
  // ============================================
  async testAuthEndpoints() {
    // Test Login (requires existing admin user)
    await this.test('Login (Admin)', async () => {
      // Try to login - may fail if no admin user exists
      const response = await this.client.post('/auth/login', {
        email: 'admin@example.com',
        password: 'Admin123!',
      });

      // Accept 200 (success) or 401 (invalid credentials) - both mean endpoint works
      if (response.status === 200) {
        if (response.data.token || response.data.accessToken) {
          this.authToken = response.data.token || response.data.accessToken;
          this.client.defaults.headers.common['Authorization'] = `Bearer ${this.authToken}`;
        }
      } else if (response.status !== 401) {
        throw new Error(`Expected 200 or 401, got ${response.status}`);
      }
    });
  }

  // ============================================
  // 4. Public Endpoints (no auth required)
  // ============================================
  async testPublicEndpoints() {
    // Test Public Posts
    await this.test('List Public Posts', async () => {
      const response = await this.client.get('/public/posts');
      if (response.status !== 200) {
        throw new Error(`Expected 200, got ${response.status}`);
      }
      // Should return array or object with data
      if (!Array.isArray(response.data) && !response.data.data) {
        throw new Error('Expected array or object with data property');
      }
    });

    // Test Public Homepage
    await this.test('Public Homepage', async () => {
      const response = await this.client.get('/public/homepage');
      if (response.status !== 200 && response.status !== 404) {
        throw new Error(`Expected 200 or 404, got ${response.status}`);
      }
    });
  }

  // ============================================
  // 5. Models Connection Test
  // ============================================
  async testModelsConnection() {
    await this.test('Database Models Connection', async () => {
      // Try to query through an endpoint that uses models
      const response = await this.client.get('/health/db');
      if (response.status >= 500) {
        throw new Error('Database connection or models issue');
      }
    });
  }

  // ============================================
  // Run All Tests
  // ============================================
  async runAllTests() {
    this.log('\n🚀 Starting CMS Backend API Endpoints Tests...\n', colors.cyan);
    this.log(`Base URL: ${BASE_URL}`, colors.blue);
    this.log(`API URL: ${API_URL}\n`, colors.blue);

    try {
      // 1. Health Check
      this.log('\n📋 1. Health Check', colors.cyan);
      await this.testHealthCheck();

      // 2. Database Health
      this.log('\n📋 2. Database Health', colors.cyan);
      await this.testDatabaseHealth();

      // 3. Models Connection
      this.log('\n📋 3. Models Connection', colors.cyan);
      await this.testModelsConnection();

      // 4. Authentication
      this.log('\n📋 4. Authentication Endpoints', colors.cyan);
      await this.testAuthEndpoints();

      // 5. Public Endpoints
      this.log('\n📋 5. Public Endpoints', colors.cyan);
      await this.testPublicEndpoints();

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










