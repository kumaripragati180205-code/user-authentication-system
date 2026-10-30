import { query } from '../config/db.js';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/passwords.js';
import { generateAccessToken, generateRandomToken, hashToken } from '../utils/tokens.js';
import { sendPasswordResetEmail, getInbox } from '../utils/mailer.js';
import { logActivity } from '../utils/audit.js';

/**
 * Register a new user
 */
export async function register(req, res) {
  try {
    const { name, email, password, role = 'user' } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    // Hash password with bcrypt
    const passwordHash = await hashPassword(password);

    // Insert user into database
    await query(
      `INSERT INTO users (name, email, password_hash, role, is_verified)
       VALUES ($1, $2, $3, $4, $5)`,
      [name.trim(), normalizedEmail, passwordHash, role, 1]
    );

    // Retrieve created user
    const newUserResult = await query(
      'SELECT id, name, email, role, is_verified, created_at FROM users WHERE email = $1',
      [normalizedEmail]
    );
    const user = newUserResult.rows[0];

    // Generate JWT access token
    const accessToken = generateAccessToken(user);

    // Generate Refresh Token
    const rawRefreshToken = generateRandomToken();
    const hashedRefreshToken = hashToken(rawRefreshToken);
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, hashedRefreshToken, refreshExpiresAt.toISOString()]
    );

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await logActivity({
      userId: user.id,
      userEmail: user.email,
      action: 'USER_REGISTERED',
      req
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user,
      accessToken,
      refreshToken: rawRefreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.'
    });
  }
}

/**
 * Login user
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email
    const result = await query(
      'SELECT id, name, email, password_hash, role, is_verified, created_at FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = result.rows[0];

    // Verify password with timing-safe bcrypt compare
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      await logActivity({
        userId: user.id,
        userEmail: user.email,
        action: 'FAILED_LOGIN_ATTEMPT',
        req
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate short-lived access token (JWT)
    const accessToken = generateAccessToken(user);

    // Generate long-lived refresh token
    const rawRefreshToken = generateRandomToken();
    const hashedRefreshToken = hashToken(rawRefreshToken);
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, hashedRefreshToken, refreshExpiresAt.toISOString()]
    );

    // Set HTTP-only cookie
    res.cookie('refreshToken', rawRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await logActivity({
      userId: user.id,
      userEmail: user.email,
      action: 'USER_LOGIN',
      req
    });

    const { password_hash, ...safeUser } = user;

    return res.json({
      success: true,
      message: 'Logged in successfully!',
      user: safeUser,
      accessToken,
      refreshToken: rawRefreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    });
  }
}

/**
 * Refresh access token using valid refresh token
 */
export async function refreshAccessToken(req, res) {
  try {
    const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!rawRefreshToken) {
      return res.status(401).json({
        success: false,
        code: 'REFRESH_TOKEN_MISSING',
        message: 'No refresh token provided.'
      });
    }

    const hashed = hashToken(rawRefreshToken);
    const tokenResult = await query(
      `SELECT rt.id, rt.user_id, rt.expires_at, rt.revoked, u.id as u_id, u.name, u.email, u.role
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1`,
      [hashed]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token does not exist or has been invalidated.'
      });
    }

    const tokenRecord = tokenResult.rows[0];

    // Check revocation
    if (tokenRecord.revoked) {
      return res.status(403).json({
        success: false,
        code: 'REVOKED_REFRESH_TOKEN',
        message: 'Refresh token has been revoked.'
      });
    }

    // Check expiration
    if (new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(403).json({
        success: false,
        code: 'EXPIRED_REFRESH_TOKEN',
        message: 'Refresh token has expired. Please log in again.'
      });
    }

    const user = {
      id: tokenRecord.u_id,
      name: tokenRecord.name,
      email: tokenRecord.email,
      role: tokenRecord.role
    };

    // Issue fresh access token
    const newAccessToken = generateAccessToken(user);

    return res.json({
      success: true,
      accessToken: newAccessToken,
      user
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to refresh token.'
    });
  }
}

/**
 * Logout user - Revoke refresh token and clear cookie
 */
export async function logout(req, res) {
  try {
    const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (rawRefreshToken) {
      const hashed = hashToken(rawRefreshToken);
      await query('UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = $1', [hashed]);
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    if (req.user) {
      await logActivity({
        userId: req.user.id,
        userEmail: req.user.email,
        action: 'USER_LOGOUT',
        req
      });
    }

    return res.json({
      success: true,
      message: 'Successfully logged out.'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during logout.'
    });
  }
}

/**
 * Initiate Forgot Password Flow
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userResult = await query('SELECT id, name, email FROM users WHERE email = $1', [normalizedEmail]);

    // Production Security Practice: Always return generic success message to prevent user enumeration
    if (userResult.rows.length === 0) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been dispatched.'
      });
    }

    const user = userResult.rows[0];

    // Generate secure reset token
    const rawResetToken = generateRandomToken();
    const hashedResetToken = hashToken(rawResetToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    // Invalidate any previous unused reset tokens for this user
    await query('UPDATE password_resets SET used = 1 WHERE user_id = $1 AND used = 0', [user.id]);

    // Store hashed token
    await query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, hashedResetToken, expiresAt.toISOString()]
    );

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${rawResetToken}&email=${encodeURIComponent(user.email)}`;

    // Dispatch email
    const mail = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
      rawToken: rawResetToken
    });

    await logActivity({
      userId: user.id,
      userEmail: user.email,
      action: 'PASSWORD_RESET_REQUESTED',
      req
    });

    return res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.',
      // Providing preview metadata for effortless demo/learning testing in browser
      preview: {
        resetUrl,
        rawToken: rawResetToken,
        expiresInMinutes: 15,
        emailId: mail.id
      }
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process password reset request.'
    });
  }
}

/**
 * Complete Password Reset Flow
 */
export async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required.'
      });
    }

    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        success: false,
        message: passwordCheck.message
      });
    }

    const hashedToken = hashToken(token);

    // Find matching unused token
    const tokenResult = await query(
      `SELECT pr.id, pr.user_id, pr.expires_at, pr.used, u.email
       FROM password_resets pr
       JOIN users u ON u.id = pr.user_id
       WHERE pr.token_hash = $1`,
      [hashedToken]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unrecognized password reset token.'
      });
    }

    const resetRecord = tokenResult.rows[0];

    if (resetRecord.used) {
      return res.status(400).json({
        success: false,
        message: 'This reset token has already been used. Please request a new one.'
      });
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This password reset link has expired (15m limit). Please request a new one.'
      });
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);

    // Update password in database
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newHash, resetRecord.user_id]
    );

    // Mark reset token as used
    await query('UPDATE password_resets SET used = 1 WHERE id = $1', [resetRecord.id]);

    // Security best practice: Revoke all active refresh tokens for this user on password change!
    await query('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = $1', [resetRecord.user_id]);

    await logActivity({
      userId: resetRecord.user_id,
      userEmail: resetRecord.email,
      action: 'PASSWORD_RESET_COMPLETED',
      req
    });

    return res.json({
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while resetting your password.'
    });
  }
}

/**
 * Get current authenticated user profile
 */
export async function getMe(req, res) {
  try {
    const userResult = await query(
      'SELECT id, name, email, role, is_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      user: userResult.rows[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

/**
 * Return in-memory mailbox for demo & learning
 */
export async function getMailbox(req, res) {
  return res.json({
    success: true,
    emails: getInbox()
  });
}

