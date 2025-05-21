import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', '..', 'data');
const dbPath = path.join(dataDir, 'service.db');

let db;

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath, { verbose: console.log });
  }
  return db;
}

export function initializeDatabase() {
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`Created directory: ${dataDir}`);
  }

  db = new Database(dbPath, { verbose: console.log });
  console.log(`Connected to database at ${dbPath}`);

  // Create profile_pictures table
  db.exec(`
    CREATE TABLE IF NOT EXISTS profile_pictures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      user_type TEXT NOT NULL CHECK(user_type IN ('admin', 'technician')),
      file_path TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES admins(id) ON DELETE CASCADE,
      UNIQUE(user_id, user_type)
    );
  `);
  console.log('Checked/created profile_pictures table.');

  // Create admins table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
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
  const defaultAdminUsername = 'admin@it13.com';
  const stmt = db.prepare('SELECT * FROM admins WHERE username = ?');
  const admin = stmt.get(defaultAdminUsername);

  if (!admin) {
    const saltRounds = 10;
    const defaultPassword = 'admin123'; // Store this securely, e.g., in env vars for setup
    const hashedPassword = bcrypt.hashSync(defaultPassword, saltRounds);
    
    const insert = db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)');
    insert.run(defaultAdminUsername, hashedPassword);
    console.log(`Default admin user '${defaultAdminUsername}' created.`);
  } else {
    console.log(`Admin user '${defaultAdminUsername}' already exists.`);
  }

  console.log('Database initialization complete.');
}

export { dbPath };