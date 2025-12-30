/**
 * JWT Secret utility
 * Gets JWT secret from environment variables
 * Different from CMS Backend (uses JWT_SECRET_PUBLIC)
 */

import './loadEnv';

/**
 * Get JWT secret for Public Backend
 * Uses JWT_SECRET_PUBLIC environment variable
 */
export function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET_PUBLIC;
  
  if (!secret) {
    throw new Error(
      'JWT_SECRET_PUBLIC environment variable is required. ' +
      'Please set it in your .env.local file.'
    );
  }

  if (secret.length < 32) {
    console.warn(
      '[JWT] Warning: JWT_SECRET_PUBLIC should be at least 32 characters long for security.'
    );
  }

  return secret;
}























