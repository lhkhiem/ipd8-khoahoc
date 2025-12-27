/**
 * Utility để load environment variables từ .env.local
 * Đảm bảo .env.local được load trước khi sử dụng process.env
 * 
 * Usage:
 *   import './utils/loadEnv';
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

let envLoaded = false;

/**
 * Load environment variables từ .env.local (ưu tiên) hoặc .env
 * Tự động tìm file trong thư mục backend root
 */
export function loadEnv(): void {
  if (envLoaded) {
    return; // Đã load rồi, không load lại
  }

  // Tìm thư mục backend root (2 levels up từ src/utils)
  const backendRoot = path.resolve(__dirname, '../..');
  
  // Ưu tiên .env.local, sau đó mới đến .env
  const envLocalPath = path.join(backendRoot, '.env.local');
  const envPath = path.join(backendRoot, '.env');

  // Load .env.local nếu tồn tại
  if (fs.existsSync(envLocalPath)) {
    const result = dotenv.config({ path: envLocalPath });
    if (result.error) {
      console.warn(`[loadEnv] Warning: Could not load .env.local:`, result.error.message);
    } else {
      console.log(`[loadEnv] Loaded .env.local from ${envLocalPath}`);
      envLoaded = true;
      return;
    }
  }

  // Fallback: Load .env nếu .env.local không tồn tại
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      console.warn(`[loadEnv] Warning: Could not load .env:`, result.error.message);
    } else {
      console.log(`[loadEnv] Loaded .env from ${envPath}`);
      envLoaded = true;
      return;
    }
  }

  // Nếu không tìm thấy file nào, dùng dotenv.config() mặc định
  dotenv.config();
  envLoaded = true;
  console.log(`[loadEnv] Using default dotenv.config() (no .env.local or .env found in ${backendRoot})`);
}

/**
 * Force reload environment variables
 */
export function reloadEnv(): void {
  envLoaded = false;
  loadEnv();
}

// Auto-load khi import module này
loadEnv();


















