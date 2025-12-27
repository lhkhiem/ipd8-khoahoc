/**
 * Security headers middleware
 * Sets security headers to protect against common attacks
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Security headers middleware
 * Sets various security headers for protection
 */
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Remove headers that leak server information
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // HSTS (only for HTTPS)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Content Security Policy (CSP)
  // Simplified for public API - no need for script-src, style-src, etc.
  const cspDirectives = [
    "default-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
  ];

  // Add public frontend URL to connect-src if available
  if (process.env.PUBLIC_FRONTEND_URL) {
    const frontendUrl = process.env.PUBLIC_FRONTEND_URL.replace(/\/$/, '');
    cspDirectives[1] = `connect-src 'self' ${frontendUrl}`;
  }

  // Add localhost for development
  if (process.env.NODE_ENV === 'development') {
    cspDirectives[1] += ' http://localhost:* http://127.0.0.1:*';
  }

  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));

  // Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );

  // Prevent caching of sensitive data (auth endpoints)
  if (req.path.startsWith('/api/public/auth') || req.path.startsWith('/api/public/profile')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }

  next();
};


















