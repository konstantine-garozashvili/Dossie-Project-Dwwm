import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../db/init-db.js';

// Get JWT secret from environment variable or use a fallback
// In production, always set a secure JWT_SECRET environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
// Token expiration time
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '24h';

// Initialize router
const authRouter = new Hono();

/**
 * POST /api/auth/technician/login
 * Authenticate a technician
 */
authRouter.post('/technician/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // Validate required fields
    if (!email || !password) {
      return c.json({
        success: false,
        message: 'Adresse email et mot de passe requis'
      }, 400);
    }
    
    const db = await getDatabase();
    
    // Find technician by email
    const technician = db.prepare('SELECT * FROM technicians WHERE email = ?').get(email);
    
    if (!technician) {
      return c.json({
        success: false,
        message: 'Identifiants invalides'
      }, 401);
    }
    
    // Verify password
    const passwordValid = await bcrypt.compare(password, technician.password_hash);
    
    if (!passwordValid) {
      return c.json({
        success: false,
        message: 'Identifiants invalides'
      }, 401);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: technician.id,
        email: technician.email,
        role: 'technician'
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );
    
    return c.json({
      success: true,
      message: 'Connexion réussie',
      token,
      technician: {
        id: technician.id,
        name: technician.name,
        email: technician.email
      }
    });
  } catch (error) {
    console.error('Technician login error:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    }, 500);
  }
});

/**
 * POST /api/auth/admin/login
 * Authenticate an admin
 */
authRouter.post('/admin/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // Validate required fields
    if (!email || !password) {
      return c.json({
        success: false,
        message: 'Adresse email et mot de passe requis'
      }, 400);
    }
    
    const db = await getDatabase();
    
    // Find admin by email
    const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);
    
    if (!admin) {
      return c.json({
        success: false,
        message: 'Identifiants invalides'
      }, 401);
    }
    
    // Verify password
    const passwordValid = await bcrypt.compare(password, admin.password_hash);
    
    if (!passwordValid) {
      return c.json({
        success: false,
        message: 'Identifiants invalides'
      }, 401);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin.id,
        email: admin.email,
        role: 'admin'
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );
    
    return c.json({
      success: true,
      message: 'Connexion réussie',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        surname: admin.surname
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    }, 500);
  }
});

export default authRouter; 