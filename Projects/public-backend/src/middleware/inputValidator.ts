/**
 * Input validation middleware
 * Basic input sanitization and validation
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Sanitize string input
 * Removes potentially dangerous characters
 */
function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return input;
  }
  // Remove null bytes and other control characters
  return input.replace(/\0/g, '').trim();
}

/**
 * Sanitize object recursively
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Sanitize key
        const sanitizedKey = sanitizeString(key);
        sanitized[sanitizedKey] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Basic input sanitization middleware
 * Sanitizes req.body, req.query, and req.params
 */
export const inputSanitizer = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query) as any;
  }

  // Sanitize params
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params) as any;
  }

  next();
};

/**
 * Validate required fields
 * Usage: validateRequired(['email', 'password'])
 */
export const validateRequired = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missing: string[] = [];

    for (const field of fields) {
      if (!req.body || req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(', ')}`,
        missing,
      });
      return;
    }

    next();
  };
};

/**
 * Validate email format
 */
export const validateEmail = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body?.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
      return;
    }
  }
  next();
};

/**
 * Validate password strength
 * Password must:
 * - Be at least 8 characters long
 * - Contain at least one lowercase letter
 * - Contain at least one uppercase letter
 * - Contain at least one number
 * - Optionally contain special characters
 */
export const validatePassword = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body?.password) {
    const password = req.body.password;
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Password does not meet requirements',
        errors,
      });
      return;
    }
  }
  next();
};








