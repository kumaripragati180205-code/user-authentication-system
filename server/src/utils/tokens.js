import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret_12345';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_12345';

/**
 * Generate short-lived JWT Access Token (15 minutes default)
 */
export function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
  );
}

/**
 * Verify JWT Access Token
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

/**
 * Generate cryptographically secure random token (e.g. for refresh or password reset)
 */
export function generateRandomToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a token using SHA-256 for safe DB storage
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

