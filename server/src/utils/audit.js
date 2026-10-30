import { query } from '../config/db.js';

export async function logActivity({ userId = null, userEmail = null, action, req }) {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    await query(
      `INSERT INTO activity_logs (user_id, user_email, action, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, userEmail, action, ipAddress.toString().substring(0, 50), userAgent.substring(0, 255)]
    );
  } catch (error) {
    console.error('Failed to write activity log:', error.message);
  }
}

