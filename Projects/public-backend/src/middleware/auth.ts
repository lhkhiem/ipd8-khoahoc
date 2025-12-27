/**
 * Authentication middleware for Public Backend
 * - Verifies JWT token from Authorization header or cookie
 * - Attaches user info to request object
 * - Returns 401 if token is invalid or missing
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '../utils/jwtSecret';

// Extend Request interface to include user
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role?: string;
  };
}

/**
 * Parse cookie string into object
 */
function parseCookie(header?: string): Record<string, string> {
  if (!header) return {};
  
  return header.split(';').reduce((acc: Record<string, string>, part) => {
    const [k, ...v] = part.trim().split('=');
    if (k) {
      acc[k] = decodeURIComponent(v.join('='));
    }
    return acc;
  }, {});
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 * Returns 401 if token is missing or invalid
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header or cookie
    const bearer = req.headers.authorization?.split(' ')[1];
    const cookies = parseCookie(req.headers.cookie);
    const token = bearer || cookies['token'] || cookies['authToken'];

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid token.',
      });
      return;
    }

    // Verify token
    const jwtSecret = getJWTSecret();
    const decoded = jwt.verify(token, jwtSecret) as any;

    // Attach user info to request
    // TODO: Optionally fetch user from database to get latest role/permissions
    // For now, we trust the token payload
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired',
      });
      return;
    }

    // Other errors
    console.error('[AuthMiddleware] Error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

/**
 * Optional authentication middleware
 * Tries to authenticate but doesn't fail if token is missing
 * Useful for endpoints that work both with and without auth
 */
export const optionalAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const bearer = req.headers.authorization?.split(' ')[1];
    const cookies = parseCookie(req.headers.cookie);
    const token = bearer || cookies['token'] || cookies['authToken'];

    if (!token) {
      // No token, continue without user
      return next();
    }

    // Try to verify token
    const jwtSecret = getJWTSecret();
    const decoded = jwt.verify(token, jwtSecret) as any;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    // Token invalid, but continue without user (optional auth)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[OptionalAuth] Invalid token, continuing without authentication');
    }
    next();
  }
};



















