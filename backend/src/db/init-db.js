import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get database path from environment variable or use default path
const dataDir = process.env.DB_DIR || path.join(__dirname, '..', '..', 'data');
const dbPath = process.env.DB_PATH || path.join(dataDir, 'service.db');

let db;

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath, { verbose: console.log });
  }
  return db;
}

export function initializeDatabase() {
  // Ensure data directory exists
  const dbDirectory = path.dirname(dbPath);
  if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
    console.log(`Created directory: ${dbDirectory}`);
  }

  db = new Database(dbPath, { verbose: console.log });
  console.log(`Connected to database at ${dbPath}`);

  // Create profile_pictures table with updated schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile_pictures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      user_type TEXT NOT NULL CHECK(user_type IN ('admin', 'technician')),
      cloudinary_public_id TEXT NOT NULL,
      cloudinary_url TEXT NOT NULL,
      cloudinary_secure_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, user_type)
    );
  `);
  console.log('Checked/created profile_pictures table.');

  // Create admins table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Checked/created admins table.');

  // Create technicians table
  db.exec(`
    CREATE TABLE IF NOT EXISTS technicians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Checked/created technicians table.');

  // Seed default admin if not exists
  const defaultAdminEmail = 'admin@it13.com';
  const stmt = db.prepare('SELECT * FROM admins WHERE email = ?');
  const admin = stmt.get(defaultAdminEmail);

  if (!admin) {
    const saltRounds = 10;
    const defaultPassword = 'admin123'; // Store this securely, e.g., in env vars for setup
    const hashedPassword = bcrypt.hashSync(defaultPassword, saltRounds);
    
    const insert = db.prepare('INSERT INTO admins (email, password_hash, name, surname) VALUES (?, ?, ?, ?)');
    insert.run(defaultAdminEmail, hashedPassword, 'Admin', 'IT13');
    console.log(`Default admin user '${defaultAdminEmail}' created.`);
  } else {
    console.log(`Admin user '${defaultAdminEmail}' already exists.`);
  }

  console.log('Database initialization complete.');
}

export { dbPath };