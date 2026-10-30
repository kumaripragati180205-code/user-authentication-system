import { query } from '../config/db.js';
import { logActivity } from '../utils/audit.js';

/**
 * Get all users with pagination and stats
 */
export async function getAllUsers(req, res) {
  try {
    const usersResult = await query(
      `SELECT id, name, email, role, is_verified, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );

    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as standard_users
      FROM users
    `);

    const activeTokensResult = await query(
      `SELECT COUNT(*) as active_sessions FROM refresh_tokens WHERE revoked = 0 AND expires_at > CURRENT_TIMESTAMP`
    );

    return res.json({
      success: true,
      stats: {
        totalUsers: Number(statsResult.rows[0]?.total_users || 0),
        totalAdmins: Number(statsResult.rows[0]?.total_admins || 0),
        standardUsers: Number(statsResult.rows[0]?.standard_users || 0),
        activeSessions: Number(activeTokensResult.rows[0]?.active_sessions || 0)
      },
      users: usersResult.rows
    });
  } catch (error) {
    console.error('Admin getAllUsers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users list.' });
  }
}

/**
 * Update user role (promote to admin or demote to user)
 */
export async function updateUserRole(req, res) {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be user or admin.' });
    }

    if (Number(userId) === req.user.id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Safety rule: You cannot demote yourself from admin role.'
      });
    }

    await query('UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [role, userId]);

    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      action: `UPDATED_USER_${userId}_ROLE_TO_${role.toUpperCase()}`,
      req
    });

    return res.json({
      success: true,
      message: `User role successfully updated to ${role}.`
    });
  } catch (error) {
    console.error('Admin updateUserRole error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user role.' });
  }
}

/**
 * Delete a user
 */
export async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    if (Number(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Safety rule: You cannot delete your own account from the admin panel.'
      });
    }

    // Check target exists
    const check = await query('SELECT email FROM users WHERE id = $1', [userId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await query('DELETE FROM users WHERE id = $1', [userId]);

    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      action: `DELETED_USER_${userId}_(${check.rows[0].email})`,
      req
    });

    return res.json({
      success: true,
      message: 'User account and associated tokens deleted successfully.'
    });
  } catch (error) {
    console.error('Admin deleteUser error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
}

/**
 * Get system activity audit logs
 */
export async function getActivityLogs(req, res) {
  try {
    const result = await query(
      `SELECT id, user_id, user_email, action, ip_address, user_agent, created_at
       FROM activity_logs
       ORDER BY created_at DESC
       LIMIT 100`
    );

    return res.json({
      success: true,
      logs: result.rows
    });
  } catch (error) {
    console.error('Admin getActivityLogs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
}

