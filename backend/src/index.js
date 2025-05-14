import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always resolve to backend/data, regardless of CWD
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_PATH = path.join(DATA_DIR, 'dwwm.db');

export async function getDatabase() {
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Open the database (will create if not exists)
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });

  // Create tables if they do not exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      address TEXT,
      business_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

    CREATE TABLE IF NOT EXISTS service_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      service_types TEXT,
      device_types TEXT,
      device_details TEXT,
      scheduling_details TEXT,
      problem_description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      assigned_technician INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (assigned_technician) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
    CREATE INDEX IF NOT EXISTS idx_service_requests_priority ON service_requests(priority);
    CREATE INDEX IF NOT EXISTS idx_service_requests_client_id ON service_requests(client_id);

    CREATE TABLE IF NOT EXISTS technician_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      location TEXT,
      specializations TEXT,
      years_experience INTEGER,
      availability TEXT,
      tools_equipment TEXT,
      reference_contacts TEXT,
      skills TEXT,
      languages TEXT,
      transport_available BOOLEAN,
      cv_path TEXT,
      diplomas_path TEXT,
      motivation_letter_path TEXT,
      status TEXT DEFAULT 'pending',
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_technician_applications_email ON technician_applications(email);
    CREATE INDEX IF NOT EXISTS idx_technician_applications_status ON technician_applications(status);

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_request_id INTEGER NOT NULL,
      author_id INTEGER NOT NULL,
      note TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_request_id) REFERENCES service_requests(id),
      FOREIGN KEY (author_id) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_notes_service_request_id ON notes(service_request_id);

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT,
      title TEXT,
      body TEXT,
      message TEXT,
      read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
  `);

  // Log schema of each table
  await logDatabaseSchema(db);

  return db;
}

// Log the schema of each table (columns and foreign keys)
async function logDatabaseSchema(db) {
  // Get all user tables
  const tables = await db.all(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';`
  );

  for (const { name: tableName } of tables) {
    console.log(`\nTable: ${tableName}`);
    // Columns
    const columns = await db.all(`PRAGMA table_info(${tableName});`);
    columns.forEach(col => {
      console.log(
        `  - ${col.name} (${col.type})${col.pk ? ' PRIMARY KEY' : ''}${col.notnull ? ' NOT NULL' : ''}${col.dflt_value !== null ? ` DEFAULT ${col.dflt_value}` : ''}`
      );
    });
    // Foreign keys
    const fks = await db.all(`PRAGMA foreign_key_list(${tableName});`);
    if (fks.length > 0) {
      console.log('  Foreign Keys:');
      fks.forEach(fk => {
        console.log(
          `    - ${fk.from} → ${fk.table}(${fk.to}) [on update: ${fk.on_update}, on delete: ${fk.on_delete}]`
        );
      });
    }
  }
}
