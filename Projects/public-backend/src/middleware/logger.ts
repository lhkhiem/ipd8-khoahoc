/**
 * Logging middleware
 * Logs requests for debugging and monitoring
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Request logger middleware
 * Logs request method, path, IP, and response status
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Only log in development or for non-health endpoints
  if (process.env.NODE_ENV === 'production' && (req.path === '/health' || req.path === '/api/public/health')) {
    return next();
  }

  const startTime = Date.now();
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

  // Log request
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${ip}`);
  }

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      const statusColor =
        statusCode >= 500 ? '\x1b[31m' : // Red for 5xx
        statusCode >= 400 ? '\x1b[33m' : // Yellow for 4xx
        statusCode >= 300 ? '\x1b[36m' : // Cyan for 3xx
        '\x1b[32m'; // Green for 2xx
      const resetColor = '\x1b[0m';

      console.log(
        `${statusColor}${statusCode}${resetColor} ${req.method} ${req.path} - ${duration}ms`
      );
    }

    // Log errors in production
    if (process.env.NODE_ENV === 'production' && statusCode >= 400) {
      console.error(`[${new Date().toISOString()}] ${statusCode} ${req.method} ${req.path} - IP: ${ip} - ${duration}ms`);
    }
  });

  next();
};











