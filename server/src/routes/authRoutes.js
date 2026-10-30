import { Router } from 'express';
import {
  register,
  login,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  getMailbox
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRegistration, validateLogin } from '../middleware/validator.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public routes
router.post('/register', authLimiter, validateRegistration, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Protected routes
router.get('/me', authenticateToken, getMe);

// Demo mailbox viewer (for easy visual testing of password reset emails)
router.get('/inbox', getMailbox);

export default router;

