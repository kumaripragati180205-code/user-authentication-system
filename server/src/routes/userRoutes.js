import { Router } from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.post('/change-password', changePassword);

export default router;

