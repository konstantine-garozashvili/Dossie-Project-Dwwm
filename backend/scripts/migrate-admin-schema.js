import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../src/db/init-db.js';

console.log("Starting admin schema migration...");

try {
  // Get database connection
  const db = getDatabase();
  
  // Check if we need to perform migration
  const tableInfo = db.prepare("PRAGMA table_info(admins)").all();
  const hasNameColumn = tableInfo.some(col => col.name === 'name');
  const hasSurnameColumn = tableInfo.some(col => col.name === 'surname');
  const hasUsernameColumn = tableInfo.some(col => col.name === 'username');
  const hasEmailColumn = tableInfo.some(col => col.name === 'email');
  
  if (hasNameColumn && hasSurnameColumn && hasEmailColumn && !hasUsernameColumn) {
    console.log("Table already has the new schema. No migration needed.");
    process.exit(0);
  }
  
  console.log("Starting transaction...");
  db.exec('BEGIN TRANSACTION');
  
  try {
    // Create temporary table with new schema
    db.exec(`
      CREATE TABLE admins_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        surname TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Get existing admin data
    const admins = db.prepare('SELECT * FROM admins').all();
    
    if (admins.length > 0) {
      console.log(`Found ${admins.length} admin accounts to migrate.`);
      
      // Insert data into new table with appropriate transformations
      const insertStmt = db.prepare('INSERT INTO admins_new (id, email, password_hash, name, surname, created_at) VALUES (?, ?, ?, ?, ?, ?)');
      
      admins.forEach(admin => {
        // Use username as email if email doesn't exist
        const email = admin.email || admin.username;
        // Default name/surname if they don't exist
        const name = admin.name || 'Admin';
        const surname = admin.surname || 'IT13';
        
        insertStmt.run(
          admin.id,
          email,
          admin.password_hash,
          name,
          surname,
          admin.created_at
        );
        
        console.log(`Migrated admin: ${email}`);
      });
    }
    
    // Drop old table and rename new one
    db.exec('DROP TABLE admins');
    db.exec('ALTER TABLE admins_new RENAME TO admins');
    
    // Commit transaction
    db.exec('COMMIT');
    console.log("Migration completed successfully.");
    
  } catch (error) {
    // Rollback on error
    db.exec('ROLLBACK');
    console.error("Migration failed:", error);
    process.exit(1);
  }
  
} catch (error) {
  console.error("Database error:", error);
  process.exit(1);
} 