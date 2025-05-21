import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { getDatabase, initializeDatabase } from '../src/db/init-db.js';

console.log("Using database configuration from environment:", {
  DB_PATH: process.env.DB_PATH || '(using default path)',
});

// Initialize the database
initializeDatabase();
const db = getDatabase();

// Test technician data
const technicianData = {
  email: 'tech@example.com',
  password: 'password123',
  name: 'Technicien Test'
};

// Hash the password
const saltRounds = 10;
const hashedPassword = bcrypt.hashSync(technicianData.password, saltRounds);

// Check if technician already exists
const existingTechnician = db.prepare('SELECT * FROM technicians WHERE email = ?').get(technicianData.email);

if (existingTechnician) {
  console.log(`Technician with email '${technicianData.email}' already exists.`);
} else {
  // Insert the technician
  const stmt = db.prepare('INSERT INTO technicians (email, password_hash, name) VALUES (?, ?, ?)');
  const result = stmt.run(technicianData.email, hashedPassword, technicianData.name);
  
  if (result.changes) {
    console.log(`Test technician created successfully with email: ${technicianData.email}`);
    console.log(`Password: ${technicianData.password} (stored as hashed)`);
  } else {
    console.error('Failed to create test technician.');
  }
}

// Close database connection
console.log('Done!');
process.exit(0); 