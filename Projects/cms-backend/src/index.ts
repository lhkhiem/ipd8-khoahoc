// Server entry: use app + ready()
// IMPORTANT: Disable dev logs in production - must be first import
import './utils/disableDevLogs';

// Load environment variables từ .env.local (phải import trước khi dùng process.env)
import './utils/loadEnv';
import { app, ready } from './app';

// Extract port from BASE_URL if available, otherwise use PORT env var or default
let PORT = 3011;
if (process.env.BASE_URL) {
  try {
    const url = new URL(process.env.BASE_URL);
    PORT = url.port ? parseInt(url.port) : (url.protocol === 'https:' ? 443 : 80);
  } catch {
    // Invalid URL, use PORT env var or default
    PORT = parseInt(process.env.PORT || '3011');
  }
} else {
  PORT = parseInt(process.env.PORT || '3011');
}

const startServer = async () => {
  try {
    await ready();
    console.log('App is ready');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

