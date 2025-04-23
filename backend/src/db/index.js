import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

// Ensure the data directory exists
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Database file path
const dbPath = process.env.DATABASE_URL || path.join(dataDir, 'mydb.db');

/**
 * Initialize the database connection and create tables if they don't exist
 * @returns {Promise<sqlite.Database>} The database connection
 */
export async function initializeDatabase() {
  console.log(`Initializing database at ${dbPath}`);
  
  // Open the database connection
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  // Enable foreign keys
  await db.exec('PRAGMA foreign_keys = ON');
  
  // Create tables if they don't exist
  await createTables(db);
  
  return db;
}

/**
 * Create all required tables in the database
 * @param {sqlite.Database} db - The database connection
 */
async function createTables(db) {
  // Clients table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      client_id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT,
      is_business BOOLEAN NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Client contacts table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS client_contacts (
      contact_id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      preferred_contact TEXT DEFAULT 'email',
      address TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients (client_id) ON DELETE CASCADE
    )
  `);

  // Technicians table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS technicians (
      technician_id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      skills TEXT, -- JSON array of skills
      certifications TEXT, -- JSON array of certifications
      availability TEXT, -- JSON object of availability
      location TEXT, -- JSON object of location
      performance TEXT, -- JSON object of performance metrics
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Service requests table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS service_requests (
      request_id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      service_type TEXT NOT NULL,
      device_type TEXT NOT NULL,
      device_details TEXT, -- JSON object of device details
      description TEXT NOT NULL,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'pending',
      scheduled_date TEXT,
      scheduled_time TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients (client_id) ON DELETE CASCADE
    )
  `);

  // Assignments table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS assignments (
      assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      technician_id INTEGER NOT NULL,
      priority TEXT DEFAULT 'medium',
      notes TEXT,
      status TEXT DEFAULT 'assigned',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES service_requests (request_id) ON DELETE CASCADE,
      FOREIGN KEY (technician_id) REFERENCES technicians (technician_id) ON DELETE CASCADE
    )
  `);

  // Service notes table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS service_notes (
      note_id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id INTEGER NOT NULL,
      technician_id INTEGER,
      note_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (request_id) REFERENCES service_requests (request_id) ON DELETE CASCADE,
      FOREIGN KEY (technician_id) REFERENCES technicians (technician_id) ON DELETE SET NULL
    )
  `);

  console.log('Database tables created successfully');
}

// Singleton database connection
let dbInstance = null;

/**
 * Get the database connection
 * @returns {Promise<sqlite.Database>} The database connection
 */
export async function getDatabase() {
  if (!dbInstance) {
    dbInstance = await initializeDatabase();
  }
  return dbInstance;
}