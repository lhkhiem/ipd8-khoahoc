import crypto from 'crypto';

/**
 * HMAC SHA256 Hex for ZaloPay
 * Used for creating order, querying order, and refund operations
 */
export function hmacSHA256Hex(key: string, data: string): string {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest('hex');
}





