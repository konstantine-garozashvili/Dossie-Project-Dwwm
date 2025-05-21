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
      cloudinary_secure_url TEXT NOT NULL,
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
      surname TEXT NOT NULL,
      phone_number TEXT,
      specialization TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'pending_approval')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

  // Seed default technicians if they don't exist
  const sampleTechnicians = [
    { email: 'tech1@it13.com', name: 'Jean', surname: 'Technicien', password: 'password1', phone_number: '0102030401', specialization: 'Réparation Matérielle', status: 'active' },
    { email: 'tech2@it13.com', name: 'Alice', surname: 'Depan', password: 'password2', phone_number: '0102030402', specialization: 'Dépannage Logiciel', status: 'active' },
    { email: 'tech3@it13.com', name: 'Bob', surname: 'Reseau', password: 'password3', phone_number: '0102030403', specialization: 'Configuration Réseau', status: 'pending_approval' },
    { email: 'tech4@it13.com', name: 'Carla', surname: 'Mobile', password: 'password4', phone_number: '0102030404', specialization: 'Réparation d\'Appareils Mobiles', status: 'inactive' },
    { email: 'tech5@it13.com', name: 'David', surname: 'Securite', password: 'password5', phone_number: '0102030405', specialization: 'Systèmes de Sécurité', status: 'active' }
  ];

  const techCheckStmt = db.prepare('SELECT id FROM technicians WHERE email = ?');
  const insertTechStmt = db.prepare(
    'INSERT INTO technicians (name, surname, email, password_hash, phone_number, specialization, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const saltRounds = 10;

  for (const tech of sampleTechnicians) {
    const existingTech = techCheckStmt.get(tech.email);
    if (!existingTech) {
      const hashedPassword = bcrypt.hashSync(tech.password, saltRounds);
      insertTechStmt.run(tech.name, tech.surname, tech.email, hashedPassword, tech.phone_number, tech.specialization, tech.status);
      console.log(`Sample technician '${tech.email}' created.`);
    } else {
      console.log(`Sample technician '${tech.email}' already exists.`);
    }
  }

  console.log('Database initialization complete.');
}

export { dbPath };