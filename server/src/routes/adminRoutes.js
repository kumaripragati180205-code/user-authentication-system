import { Router } from 'express';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getActivityLogs
} from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Require both valid JWT AND Admin role
router.use(authenticateToken);
router.use(requireRole('admin'));

router.get('/users', getAllUsers);
router.patch('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);
router.get('/audit-logs', getActivityLogs);

export default router;

