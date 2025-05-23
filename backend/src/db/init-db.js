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

  // Create technicians table with extended fields
  db.exec(`
    CREATE TABLE IF NOT EXISTS technicians (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone_number TEXT,
      specialization TEXT,
      years_experience INTEGER DEFAULT 0,
      certifications TEXT, -- JSON array of certifications
      education TEXT,
      work_history TEXT,
      skills TEXT, -- JSON array of skills
      languages TEXT, -- JSON array of languages
      transport_available BOOLEAN DEFAULT 0,
      location TEXT, -- JSON object with address details
      availability TEXT, -- Availability schedule
      tools_equipment TEXT, -- Tools and equipment description
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'pending_approval')),
      is_temporary_password BOOLEAN DEFAULT 0, -- Flag for temporary password
      temporary_password_expires TIMESTAMP NULL, -- Expiration time for temporary password
      password_reset_token TEXT NULL, -- Token for password reset
      password_reset_expires TIMESTAMP NULL, -- Expiration time for reset token
      must_change_password BOOLEAN DEFAULT 0, -- Force password change on next login
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Checked/created technicians table.');

  // Create technician_applications table if not exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS technician_applications (
      application_id INTEGER PRIMARY KEY AUTOINCREMENT,
      personal_info TEXT NOT NULL, -- JSON with name, email, phone, location
      professional_info TEXT NOT NULL, -- JSON with specialization, years experience, etc.
      background TEXT, -- JSON with education, work history, etc.
      additional_info TEXT, -- JSON with skills, languages, transport, etc.
      documents TEXT NOT NULL, -- JSON with Cloudinary URLs for CV, diplomas, motivation letter
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewing', 'approved', 'rejected'
      admin_notes TEXT, -- Notes from admin about the application
      technician_id INTEGER, -- ID of the created technician if approved
      submitted_at TEXT NOT NULL, -- ISO date string
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (technician_id) REFERENCES technicians (id)
    );
  `);
  console.log('Checked/created technician_applications table.');

  // Create index for faster status lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_technician_applications_status ON technician_applications (status);
  `);

  // Create notifications table for admin notifications
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL, -- 'technician_application', 'system', 'alert'
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT, -- JSON data related to the notification
      is_read BOOLEAN DEFAULT 0,
      priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
      recipient_type TEXT NOT NULL, -- 'admin', 'technician'
      recipient_id INTEGER, -- NULL for all admins, specific ID for targeted notifications
      related_entity_type TEXT, -- 'technician_application', 'technician', 'service_request'
      related_entity_id INTEGER, -- ID of the related entity
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      read_at TIMESTAMP NULL
    );
  `);
  console.log('Checked/created notifications table.');

  // Create index for faster notification lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications (recipient_type, recipient_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (type);
  `);

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
    { 
      email: 'tech1@it13.com', 
      name: 'Jean', 
      surname: 'Technicien', 
      password: 'password1', 
      phone_number: '0102030401', 
      specialization: 'Réparation Matérielle', 
      years_experience: 5,
      certifications: JSON.stringify(['CompTIA A+', 'Certification Réparation PC']),
      education: 'BTS Informatique',
      work_history: '5 ans d\'expérience en réparation matérielle',
      skills: JSON.stringify(['Diagnostic matériel', 'Soudure', 'Assemblage PC']),
      languages: JSON.stringify(['Français', 'Anglais']),
      transport_available: 1,
      location: JSON.stringify({ city: 'Paris', postalCode: '75001', address: '1 Rue de la Paix' }),
      status: 'active' 
    },
    { 
      email: 'tech2@it13.com', 
      name: 'Alice', 
      surname: 'Depan', 
      password: 'password2', 
      phone_number: '0102030402', 
      specialization: 'Dépannage Logiciel', 
      years_experience: 3,
      certifications: JSON.stringify(['Microsoft Certified', 'Linux Professional']),
      education: 'Licence Informatique',
      work_history: '3 ans en support technique',
      skills: JSON.stringify(['Windows', 'Linux', 'Antivirus']),
      languages: JSON.stringify(['Français']),
      transport_available: 0,
      location: JSON.stringify({ city: 'Lyon', postalCode: '69001', address: '2 Place Bellecour' }),
      status: 'active' 
    },
    { 
      email: 'tech3@it13.com', 
      name: 'Bob', 
      surname: 'Reseau', 
      password: 'password3', 
      phone_number: '0102030403', 
      specialization: 'Configuration Réseau', 
      years_experience: 7,
      certifications: JSON.stringify(['CCNA', 'Network+']),
      education: 'Master Réseaux et Télécommunications',
      work_history: '7 ans en administration réseau',
      skills: JSON.stringify(['Cisco', 'Routage', 'Switching', 'WiFi']),
      languages: JSON.stringify(['Français', 'Anglais', 'Espagnol']),
      transport_available: 1,
      location: JSON.stringify({ city: 'Marseille', postalCode: '13001', address: '3 Vieux Port' }),
      status: 'pending_approval' 
    },
    { 
      email: 'tech4@it13.com', 
      name: 'Carla', 
      surname: 'Mobile', 
      password: 'password4', 
      phone_number: '0102030404', 
      specialization: 'Réparation d\'Appareils Mobiles', 
      years_experience: 2,
      certifications: JSON.stringify(['Réparation iPhone', 'Samsung Certified']),
      education: 'Formation professionnelle réparation mobile',
      work_history: '2 ans en boutique de réparation',
      skills: JSON.stringify(['Écrans tactiles', 'Batteries', 'Cartes mères']),
      languages: JSON.stringify(['Français', 'Italien']),
      transport_available: 0,
      location: JSON.stringify({ city: 'Nice', postalCode: '06000', address: '4 Promenade des Anglais' }),
      status: 'inactive' 
    },
    { 
      email: 'tech5@it13.com', 
      name: 'David', 
      surname: 'Securite', 
      password: 'password5', 
      phone_number: '0102030405', 
      specialization: 'Systèmes de Sécurité', 
      years_experience: 10,
      certifications: JSON.stringify(['CISSP', 'CEH', 'Security+']),
      education: 'Ingénieur Cybersécurité',
      work_history: '10 ans en sécurité informatique',
      skills: JSON.stringify(['Pentesting', 'Firewall', 'Antivirus', 'Audit sécurité']),
      languages: JSON.stringify(['Français', 'Anglais']),
      transport_available: 1,
      location: JSON.stringify({ city: 'Toulouse', postalCode: '31000', address: '5 Place du Capitole' }),
      status: 'active' 
    }
  ];

  const techCheckStmt = db.prepare('SELECT id FROM technicians WHERE email = ?');
  const insertTechStmt = db.prepare(`
    INSERT INTO technicians (
      name, surname, email, password_hash, phone_number, specialization, 
      years_experience, certifications, education, work_history, skills, 
      languages, transport_available, location, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const saltRounds = 10;

  for (const tech of sampleTechnicians) {
    const existingTech = techCheckStmt.get(tech.email);
    if (!existingTech) {
      const hashedPassword = bcrypt.hashSync(tech.password, saltRounds);
      insertTechStmt.run(
        tech.name, tech.surname, tech.email, hashedPassword, tech.phone_number, 
        tech.specialization, tech.years_experience, tech.certifications, 
        tech.education, tech.work_history, tech.skills, tech.languages, 
        tech.transport_available, tech.location, tech.status
      );
      console.log(`Sample technician '${tech.email}' created.`);
    } else {
      console.log(`Sample technician '${tech.email}' already exists.`);
    }
  }

  console.log('Database initialization complete.');
}

export { dbPath };