import Database from 'better-sqlite3';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_TYPE = process.env.DB_TYPE || 'sqlite';
let sqliteDb = null;
let pgPool = null;

if (DB_TYPE === 'postgres' && process.env.DATABASE_URL) {
  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  console.log('📦 Using PostgreSQL database connection');
} else {
  const dataDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, 'authshield.sqlite');
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('foreign_keys = ON');
  console.log(`📦 Using local SQLite database at: ${dbPath}`);
}

/**
 * Universal query runner:
 * Accepts SQL queries and parameter arrays.
 * Automatically translates parameter bindings ($1, $2 vs ?) between PostgreSQL and SQLite.
 */
export async function query(sql, params = []) {
  if (pgPool) {
    // PostgreSQL execution
    const res = await pgPool.query(sql, params);
    return {
      rows: res.rows,
      rowCount: res.rowCount,
      insertId: res.rows[0]?.id
    };
  } else {
    // SQLite execution
    // Convert $1, $2, ... placeholders to ?
    let convertedSql = sql.replace(/\$(\d+)/g, '?');
    
    // SQLite doesn't natively support RETURNING in older versions, but better-sqlite3 8+ does!
    const trimmed = convertedSql.trim().toUpperCase();
    
    if (trimmed.startsWith('SELECT') || trimmed.includes('RETURNING')) {
      const stmt = sqliteDb.prepare(convertedSql);
      const rows = stmt.all(params);
      return {
        rows,
        rowCount: rows.length,
        insertId: rows[0]?.id
      };
    } else {
      const stmt = sqliteDb.prepare(convertedSql);
      const info = stmt.run(params);
      return {
        rows: [],
        rowCount: info.changes,
        insertId: info.lastInsertRowid
      };
    }
  }
}

export function getDbType() {
  return pgPool ? 'PostgreSQL' : 'SQLite (Zero-config local DB)';
}

export default { query, getDbType };

