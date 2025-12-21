/**
 * Simple Health Check Test for CMS Backend
 * Test health endpoint only
 */

import '../utils/loadEnv';
import axios from 'axios';

const BASE_URL = process.env.API_BASE_URL || process.env.BASE_URL || 'http://localhost:3103';

async function testHealth() {
  try {
    console.log(`Testing health endpoint: ${BASE_URL}/api/health`);
    const response = await axios.get(`${BASE_URL}/api/health`, {
      timeout: 5000,
      validateStatus: () => true,
    });

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      console.log('✅ Health check passed!');
      process.exit(0);
    } else {
      console.log('❌ Health check failed!');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Server is not running. Please start server first:');
      console.error('   cd Projects/cms-backend');
      console.error('   npm run dev');
    }
    process.exit(1);
  }
}

testHealth();

