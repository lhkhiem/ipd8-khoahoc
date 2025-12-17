// Load environment variables từ .env.local (phải import trước khi dùng process.env)
import '../utils/loadEnv';

import axios from 'axios';
import { hmacSHA256Hex } from '../utils/hmac';

async function testZaloPayCallback() {
  const app_trans_id = process.argv[2]; // Lấy từ command line
  const orderId = process.argv[3]; // Order ID trong database (optional)

  if (!app_trans_id) {
    console.error('❌ Usage: ts-node testZaloPayCallback.ts <app_trans_id> [order_id]');
    console.error('Example: ts-node testZaloPayCallback.ts "251129_ORDMIIF9UEUMKZVN"');
    process.exit(1);
  }

  const callbackKey = process.env.ZP_CALLBACK_KEY;
  const appId = Number(process.env.ZP_APP_ID);

  if (!callbackKey) {
    console.error('❌ ZP_CALLBACK_KEY not found in .env');
    process.exit(1);
  }

  if (!appId) {
    console.error('❌ ZP_APP_ID not found in .env');
    process.exit(1);
  }

  console.log('🧪 Testing ZaloPay Callback...');
  console.log('App ID:', appId);
  console.log('App Trans ID:', app_trans_id);
  console.log('');

  // Tạo callback data (giả lập từ ZaloPay)
  const callbackData = {
    app_id: appId,
    app_trans_id: app_trans_id,
    app_user: '0886939879', // Test user
    amount: 1000, // Test amount (có thể thay đổi)
    app_time: Date.now(),
    embed_data: '{}',
    item: '[]',
    zp_trans_id: Math.floor(Math.random() * 1000000000), // Random transaction ID
    server_time: Date.now(),
    channel: 38, // ZaloPay channel
    return_code: 1, // Success
  };

  // Tạo MAC
  const dataString = JSON.stringify(callbackData);
  const mac = hmacSHA256Hex(callbackKey, dataString);

  console.log('📦 Callback Data:');
  console.log(JSON.stringify(callbackData, null, 2));
  console.log('');
  console.log('🔐 MAC:', mac);
  console.log('');

  // Gửi callback
  const callbackUrl = process.env.ZP_CALLBACK_URL || 
    (process.env.BASE_URL || process.env.API_BASE_URL || 'http://localhost:3011') + '/api/payments/zalopay/callback';
  
  console.log('📤 Sending callback to:', callbackUrl);
  console.log('');

  try {
    const response = await axios.post(callbackUrl, {
      data: dataString,
      mac: mac,
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    console.log('✅ Callback sent successfully!');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    if (error.response) {
      console.error('❌ Callback failed!');
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('❌ Callback failed:', error.message);
    }
    process.exit(1);
  }
}

testZaloPayCallback();

