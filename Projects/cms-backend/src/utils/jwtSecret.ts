/**
 * JWT Secret validation utility
 * Ensures JWT_SECRET is set and not using default weak value
 */

import './loadEnv';

/**
 * Get and validate JWT_SECRET from environment
 * Throws error if JWT_SECRET is missing or using default weak value
 */
export function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error(
      'JWT_SECRET environment variable is required. ' +
      'Please set a strong JWT_SECRET (at least 32 characters) in your .env.local file.'
    );
  }
  
  if (secret === 'secret' || secret.length < 32) {
    throw new Error(
      'JWT_SECRET must be a strong secret (at least 32 characters). ' +
      'Using default or weak secret is a security risk. ' +
      'Generate a new secret: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  
  return secret;
}

/**
 * Get and validate JWT_REFRESH_SECRET from environment
 * Throws error if JWT_REFRESH_SECRET is missing or using default weak value
 */
export function getJWTRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET; // Fallback to JWT_SECRET if refresh secret not set
  
  if (!secret) {
    throw new Error(
      'JWT_REFRESH_SECRET or JWT_SECRET environment variable is required. ' +
      'Please set a strong JWT_REFRESH_SECRET (at least 32 characters) in your .env.local file.'
    );
  }
  
  if (secret === 'refresh-secret' || secret === 'secret' || secret.length < 32) {
    throw new Error(
      'JWT_REFRESH_SECRET must be a strong secret (at least 32 characters). ' +
      'Using default or weak secret is a security risk. ' +
      'Generate a new secret: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  
  return secret;
}






