// Cấu hình kết nối PostgreSQL qua Sequelize
// - Đọc thông tin kết nối từ env vars
// - SECURITY: DB_PASSWORD is required in production
// - Logging SQL chỉ trong môi trường development

// Load environment variables từ .env.local (phải import trước khi dùng process.env)
import '../utils/loadEnv';

import { Sequelize } from 'sequelize';

// SECURITY: Validate DB_PASSWORD in production
if (process.env.NODE_ENV === 'production' && !process.env.DB_PASSWORD) {
  throw new Error(
    'DB_PASSWORD environment variable is required in production. ' +
    'Please set a strong database password in your .env.local file.'
  );
}

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'spa_cms_user',
  password: process.env.DB_PASSWORD || 'spa_cms_password', // Fallback only for development
  database: process.env.DB_NAME || 'banyco',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

export default sequelize;

