import { query } from '../config/db.js';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/passwords.js';
import { logActivity } from '../utils/audit.js';

/**
 * Get user profile and their own recent security activity
 */
export async function getProfile(req, res) {
  try {
    const userResult = await query(
      'SELECT id, name, email, role, is_verified, created_at, updated_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const activityResult = await query(
      `SELECT id, action, ip_address, user_agent, created_at
       FROM activity_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [req.user.id]
    );

    const activeSessionsResult = await query(
      `SELECT id, created_at, expires_at
       FROM refresh_tokens
       WHERE user_id = $1 AND revoked = 0 AND expires_at > CURRENT_TIMESTAMP`,
      [req.user.id]
    );

    return res.json({
      success: true,
      user: userResult.rows[0],
      recentActivity: activityResult.rows,
      activeSessionsCount: activeSessionsResult.rows.length
    });
  } catch (error) {
    console.error('getProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

/**
 * Update user profile details
 */
export async function updateProfile(req, res) {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters long.' });
    }

    await query(
      'UPDATE users SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [name.trim(), req.user.id]
    );

    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'USER_PROFILE_UPDATED',
      req
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      name: name.trim()
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

/**
 * Change password when logged in (requires current password verification)
 */
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        success: false,
        message: passwordCheck.message
      });
    }

    // Get current hash
    const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await comparePassword(currentPassword, userResult.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);

    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newHash, req.user.id]
    );

    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'PASSWORD_CHANGED_BY_USER',
      req
    });

    return res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('changePassword error:', error);
    return res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
}

