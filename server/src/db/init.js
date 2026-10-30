import bcrypt from 'bcryptjs';
import { query, getDbType } from '../config/db.js';

export async function initDb() {
  console.log(`🚀 Initializing database schema (${getDbType()})...`);

  // Table: users
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      is_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Table: refresh_tokens
  await query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      revoked INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Table: password_resets
  await query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Table: activity_logs
  await query(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_email TEXT,
      action TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // Seed default admin and user if not already present
  const adminCheck = await query('SELECT id FROM users WHERE email = $1', ['admin@authshield.io']);
  if (adminCheck.rows.length === 0) {
    const salt = await bcrypt.genSalt(12);
    const adminHash = await bcrypt.hash('Admin@123', salt);
    await query(
      'INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, $5)',
      ['System Administrator', 'admin@authshield.io', adminHash, 'admin', 1]
    );
    console.log('✨ Seeded default Admin account: admin@authshield.io (Password: Admin@123)');
  }

  const userCheck = await query('SELECT id FROM users WHERE email = $1', ['user@authshield.io']);
  if (userCheck.rows.length === 0) {
    const salt = await bcrypt.genSalt(12);
    const userHash = await bcrypt.hash('User@123', salt);
    await query(
      'INSERT INTO users (name, email, password_hash, role, is_verified) VALUES ($1, $2, $3, $4, $5)',
      ['Alex Johnson', 'user@authshield.io', userHash, 'user', 1]
    );
    console.log('✨ Seeded default User account: user@authshield.io (Password: User@123)');
  }

  console.log('✅ Database initialized successfully.');
}

