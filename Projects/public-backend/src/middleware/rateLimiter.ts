/**
 * Rate limiting middleware
 * Stricter than CMS Backend for public API
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked?: boolean;
  blockUntil?: number;
}

// In-memory store for rate limiting
// TODO: Consider using Redis for production (distributed rate limiting)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup function to remove expired entries
function cleanupRateLimitStore() {
  if (rateLimitStore.size === 0) {
    setTimeout(cleanupRateLimitStore, 5 * 60 * 1000); // Check again in 5 minutes
    return;
  }

  const now = Date.now();
  let cleaned = 0;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now && (!entry.blockUntil || entry.blockUntil < now)) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }

  // Schedule next cleanup (sooner if we cleaned many entries)
  const nextInterval = cleaned > 100 ? 1 * 60 * 1000 : 5 * 60 * 1000;
  setTimeout(cleanupRateLimitStore, nextInterval);
}

// Start cleanup cycle
cleanupRateLimitStore();

/**
 * Get client IP address
 */
function getClientIp(req: Request): string {
  return (
    req.ip ||
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.connection.remoteAddress ||
    'unknown'
  );
}

/**
 * Check if IP is localhost
 */
function isLocalhost(ip: string): boolean {
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.startsWith('127.') ||
    ip === 'localhost'
  );
}

/**
 * General rate limiter (stricter than CMS Backend)
 * Default: 100 requests per 15 minutes (stricter than CMS's 5000/hour)
 */
export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Exclude health check endpoint
  if (req.path === '/health' || req.path === '/api/public/health') {
    return next();
  }

  const ip = getClientIp(req);

  // Exclude localhost IPs from rate limiting in development
  if (process.env.NODE_ENV === 'development' && isLocalhost(ip)) {
    return next();
  }

  // Get rate limit config from environment variables
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes default
  const blockDuration = 10 * 60 * 1000; // Block 10 minutes if exceeded

  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // Check if IP is blocked
  if (entry?.blocked && entry.blockUntil && entry.blockUntil > now) {
    const remainingTime = Math.ceil((entry.blockUntil - now) / 1000 / 60);
    console.warn(`[RateLimit] Blocked IP ${ip} - ${remainingTime} minutes remaining`);
    res.status(429).json({
      success: false,
      error: 'Too many requests. Your IP has been temporarily blocked.',
      retryAfter: remainingTime,
    });
    return;
  }

  // Reset if block expired
  if (entry?.blocked && entry.blockUntil && entry.blockUntil <= now) {
    rateLimitStore.delete(ip);
  }

  // Check rate limit
  if (entry && entry.resetTime > now) {
    if (entry.count >= maxRequests) {
      // Exceeded limit - block IP
      entry.blocked = true;
      entry.blockUntil = now + blockDuration;
      console.warn(
        `[RateLimit] IP ${ip} exceeded limit (${maxRequests} requests) - blocked for ${blockDuration / 1000 / 60} minutes`
      );
      res.status(429).json({
        success: false,
        error: 'Too many requests. Your IP has been temporarily blocked.',
        retryAfter: Math.ceil(blockDuration / 1000 / 60),
      });
      return;
    }
    entry.count++;
  } else {
    // Create new entry or reset expired entry
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
  }

  // Add rate limit headers
  const currentEntry = rateLimitStore.get(ip);
  if (currentEntry) {
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - currentEntry.count));
    res.setHeader('X-RateLimit-Reset', new Date(currentEntry.resetTime).toISOString());
  }

  next();
};

/**
 * Stricter rate limiter for auth endpoints
 * Default: 10 requests per 15 minutes
 */
export const authRateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const ip = getClientIp(req);

  // Exclude localhost in development
  if (process.env.NODE_ENV === 'development' && isLocalhost(ip)) {
    return next();
  }

  const maxRequests = 10; // Stricter for auth endpoints
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const blockDuration = 30 * 60 * 1000; // Block 30 minutes if exceeded

  const now = Date.now();
  const entry = rateLimitStore.get(`auth:${ip}`);

  // Check if IP is blocked
  if (entry?.blocked && entry.blockUntil && entry.blockUntil > now) {
    const remainingTime = Math.ceil((entry.blockUntil - now) / 1000 / 60);
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts. Please try again later.',
      retryAfter: remainingTime,
    });
    return;
  }

  // Check rate limit
  if (entry && entry.resetTime > now) {
    if (entry.count >= maxRequests) {
      entry.blocked = true;
      entry.blockUntil = now + blockDuration;
      console.warn(`[RateLimit] IP ${ip} exceeded auth limit - blocked for ${blockDuration / 1000 / 60} minutes`);
      res.status(429).json({
        success: false,
        error: 'Too many authentication attempts. Please try again later.',
        retryAfter: Math.ceil(blockDuration / 1000 / 60),
      });
      return;
    }
    entry.count++;
  } else {
    rateLimitStore.set(`auth:${ip}`, { count: 1, resetTime: now + windowMs });
  }

  // Add rate limit headers
  const currentEntry = rateLimitStore.get(`auth:${ip}`);
  if (currentEntry) {
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - currentEntry.count));
    res.setHeader('X-RateLimit-Reset', new Date(currentEntry.resetTime).toISOString());
  }

  next();
};


