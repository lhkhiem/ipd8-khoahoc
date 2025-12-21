// Server entry: use app + ready()
// IMPORTANT: Disable dev logs in production - must be first import
import './utils/disableDevLogs';

// Load environment variables từ .env.local (phải import trước khi dùng process.env)
import './utils/loadEnv';
import { app, ready } from './app';

// SECURITY: PORT must be set in .env.local (theo yêu cầu kiến trúc)
if (!process.env.PORT) {
  throw new Error('PORT environment variable is required. Please set it in .env.local file.');
}

const PORT = parseInt(process.env.PORT);

const startServer = async () => {
  try {
    await ready();
    console.log('App is ready');
    app.listen(PORT, () => {
      console.log(`Public Backend server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


