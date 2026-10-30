import { verifyAccessToken } from '../utils/tokens.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <TOKEN>

  if (!token) {
    return res.status(401).json({
      success: false,
      code: 'AUTH_TOKEN_MISSING',
      message: 'Access denied. No authentication token provided in Authorization header.'
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // { id, email, name, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Your session token has expired. Please refresh your token or log in again.',
        expiredAt: err.expiredAt
      });
    }
    return res.status(403).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: 'Invalid authentication token provided.'
    });
  }
}

