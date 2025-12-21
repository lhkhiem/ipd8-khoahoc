// Cấu hình kết nối PostgreSQL qua Sequelize
// - Đọc thông tin kết nối từ env vars (từ .env.local)
// - SECURITY: Tất cả thông tin database phải được set trong .env.local, không hardcode
// - Logging SQL chỉ trong môi trường development

// Load environment variables từ .env.local (phải import trước khi dùng process.env)
import '../utils/loadEnv';

import { Sequelize } from 'sequelize';

// SECURITY: Validate tất cả database config variables (theo yêu cầu kiến trúc)
// Tất cả thông tin database phải từ .env.local, không hardcode
if (!process.env.DB_HOST) {
  throw new Error('DB_HOST environment variable is required. Please set it in .env.local file.');
}
if (!process.env.DB_PORT) {
  throw new Error('DB_PORT environment variable is required. Please set it in .env.local file.');
}
if (!process.env.DB_USER) {
  throw new Error('DB_USER environment variable is required. Please set it in .env.local file.');
}
if (!process.env.DB_PASSWORD) {
  throw new Error('DB_PASSWORD environment variable is required. Please set it in .env.local file.');
}
if (!process.env.DB_NAME) {
  throw new Error('DB_NAME environment variable is required. Please set it in .env.local file.');
}

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

export default sequelize;

