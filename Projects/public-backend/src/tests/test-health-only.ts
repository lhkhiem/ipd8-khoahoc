/**
 * Simple Health Check Test
 * Test health endpoint only
 */

import '../utils/loadEnv';
import axios from 'axios';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3101';

async function testHealth() {
  try {
    console.log(`Testing health endpoint: ${BASE_URL}/health`);
    const response = await axios.get(`${BASE_URL}/health`, {
      timeout: 5000,
      validateStatus: () => true,
    });

    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(response.data, null, 2));

    if (response.status === 200 && response.data.status === 'ok') {
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
      console.error('   cd Projects/public-backend');
      console.error('   npm run dev');
    }
    process.exit(1);
  }
}

testHealth();

