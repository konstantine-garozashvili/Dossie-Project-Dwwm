import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../db/init-db.js';
import { validatePassword, hashPassword, comparePassword } from '../utils/validation.js';
import emailService from '../utils/emailService.js';

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
    
    // Check technician status
    if (technician.status === 'rejected') {
      return c.json({
        success: false,
        message: 'Votre candidature a été refusée par l\'administration.',
        reason: 'rejected',
        details: 'Votre compte a été désactivé suite à une décision administrative. Pour plus d\'informations, contactez l\'administration.'
      }, 403);
    }
    
    if (technician.status === 'inactive') {
      return c.json({
        success: false,
        message: 'Votre compte est temporairement désactivé.',
        reason: 'inactive',
        details: 'Votre compte est actuellement inactif. Contactez l\'administration pour plus d\'informations.'
      }, 403);
    }
    
    if (technician.status === 'pending_approval') {
      return c.json({
        success: false,
        message: 'Votre candidature est en cours d\'examen.',
        reason: 'pending',
        details: 'Votre candidature est actuellement en cours d\'examen par notre équipe. Vous recevrez un email dès qu\'une décision sera prise.'
      }, 403);
    }
    
    // Only allow login for active technicians
    if (technician.status !== 'active') {
      return c.json({
        success: false,
        message: 'Accès non autorisé.',
        reason: 'status_invalid',
        details: 'Votre statut de compte ne permet pas la connexion. Contactez l\'administration.'
      }, 403);
    }

    // Check if temporary password has expired
    if (technician.is_temporary_password && technician.temporary_password_expires) {
      const expirationDate = new Date(technician.temporary_password_expires);
      if (new Date() > expirationDate) {
        return c.json({
          success: false,
          message: 'Votre mot de passe temporaire a expiré.',
          reason: 'temporary_password_expired',
          details: 'Votre mot de passe temporaire a expiré. Contactez l\'administration pour obtenir un nouveau mot de passe.'
        }, 403);
      }
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
    
    // Check if password change is required
    const mustChangePassword = technician.must_change_password || technician.is_temporary_password;
    
    return c.json({
      success: true,
      message: 'Connexion réussie',
      token,
      technician: {
        id: technician.id,
        name: technician.name,
        surname: technician.surname,
        email: technician.email
      },
      mustChangePassword,
      isTemporaryPassword: technician.is_temporary_password
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
 * POST /api/auth/technician/change-password
 * Change technician password (especially for temporary passwords)
 */
authRouter.post('/technician/change-password', async (c) => {
  try {
    const { email, currentPassword, newPassword } = await c.req.json();
    
    // Validate required fields
    if (!email || !currentPassword || !newPassword) {
      return c.json({
        success: false,
        message: 'Tous les champs sont requis'
      }, 400);
    }
    
    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return c.json({
        success: false,
        message: 'Le nouveau mot de passe ne respecte pas les exigences',
        errors: passwordValidation.errors
      }, 400);
    }
    
    const db = await getDatabase();
    
    // Find technician by email
    const technician = db.prepare('SELECT * FROM technicians WHERE email = ?').get(email);
    
    if (!technician) {
      return c.json({
        success: false,
        message: 'Utilisateur non trouvé'
      }, 404);
    }
    
    // Verify current password
    const currentPasswordValid = await bcrypt.compare(currentPassword, technician.password_hash);
    
    if (!currentPasswordValid) {
      return c.json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      }, 401);
    }
    
    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);
    
    // Update password and reset temporary password flags
    const updateStmt = db.prepare(`
      UPDATE technicians 
      SET password_hash = ?, 
          is_temporary_password = 0, 
          temporary_password_expires = NULL, 
          must_change_password = 0,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    updateStmt.run(hashedNewPassword, technician.id);
    
    return c.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });
  } catch (error) {
    console.error('Password change error:', error);
    return c.json({
      success: false,
      message: 'Erreur lors du changement de mot de passe',
      error: error.message
    }, 500);
  }
});

/**
 * POST /api/auth/technician/change-temporary-password
 * Change temporary password using token (no current password required)
 */
authRouter.post('/technician/change-temporary-password', async (c) => {
  try {
    const { token, newPassword } = await c.req.json();
    
    // Validate required fields
    if (!token || !newPassword) {
      return c.json({
        success: false,
        message: 'Token et nouveau mot de passe requis'
      }, 400);
    }
    
    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return c.json({
        success: false,
        message: 'Le nouveau mot de passe ne respecte pas les exigences',
        errors: passwordValidation.errors
      }, 400);
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return c.json({
        success: false,
        message: 'Token invalide ou expiré'
      }, 400);
    }
    
    if (decoded.type !== 'temporary_password') {
      return c.json({
        success: false,
        message: 'Type de token invalide'
      }, 400);
    }
    
    const db = await getDatabase();
    
    // Find technician by email and verify token
    const technician = db.prepare(`
      SELECT * FROM technicians 
      WHERE email = ? AND is_temporary_password = 1 AND must_change_password = 1
    `).get(decoded.email);
    
    if (!technician) {
      return c.json({
        success: false,
        message: 'Utilisateur non trouvé ou mot de passe temporaire non requis'
      }, 404);
    }
    
    // Check if temporary password has expired
    if (technician.temporary_password_expires) {
      const expirationDate = new Date(technician.temporary_password_expires);
      if (expirationDate < new Date()) {
        return c.json({
          success: false,
          message: 'Le mot de passe temporaire a expiré'
        }, 400);
      }
    }
    
    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);
    
    // Update password and reset temporary password flags
    const updateStmt = db.prepare(`
      UPDATE technicians 
      SET password_hash = ?, 
          is_temporary_password = 0, 
          temporary_password_expires = NULL, 
          must_change_password = 0,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    updateStmt.run(hashedNewPassword, technician.id);
    
    return c.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès'
    });
  } catch (error) {
    console.error('Temporary password change error:', error);
    return c.json({
      success: false,
      message: 'Erreur lors du changement de mot de passe',
      error: error.message
    }, 500);
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
authRouter.post('/forgot-password', async (c) => {
  try {
    const { email, userType } = await c.req.json();
    
    if (!email || !userType) {
      return c.json({
        success: false,
        message: 'Email et type d\'utilisateur requis'
      }, 400);
    }
    
    const db = await getDatabase();
    let user = null;
    let tableName = '';
    
    if (userType === 'technician') {
      tableName = 'technicians';
      user = db.prepare('SELECT * FROM technicians WHERE email = ?').get(email);
    } else if (userType === 'admin') {
      tableName = 'admins';
      user = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);
    } else {
      return c.json({
        success: false,
        message: 'Type d\'utilisateur invalide'
      }, 400);
    }
    
    if (!user) {
      // Don't reveal if email exists or not for security
      return c.json({
        success: true,
        message: 'Si cette adresse email existe, vous recevrez un lien de réinitialisation'
      });
    }
    
    // Generate reset token
    const resetToken = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        type: 'password_reset',
        userType
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Store reset token in database
    const updateStmt = db.prepare(`
      UPDATE ${tableName} 
      SET password_reset_token = ?, 
          password_reset_expires = datetime('now', '+1 hour')
      WHERE id = ?
    `);
    
    updateStmt.run(resetToken, user.id);
    
    // Send reset email
    const emailResult = await emailService.sendPasswordResetEmail(
      user.email,
      user.name || 'Utilisateur',
      resetToken
    );
    
    return c.json({
      success: true,
      message: 'Si cette adresse email existe, vous recevrez un lien de réinitialisation',
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la demande de réinitialisation',
      error: error.message
    }, 500);
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
authRouter.post('/reset-password', async (c) => {
  try {
    const { token, newPassword } = await c.req.json();
    
    if (!token || !newPassword) {
      return c.json({
        success: false,
        message: 'Token et nouveau mot de passe requis'
      }, 400);
    }
    
    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return c.json({
        success: false,
        message: 'Le nouveau mot de passe ne respecte pas les exigences',
        errors: passwordValidation.errors
      }, 400);
    }
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return c.json({
        success: false,
        message: 'Token invalide ou expiré'
      }, 400);
    }
    
    if (decoded.type !== 'password_reset') {
      return c.json({
        success: false,
        message: 'Token invalide'
      }, 400);
    }
    
    const db = await getDatabase();
    const tableName = decoded.userType === 'technician' ? 'technicians' : 'admins';
    
    // Find user and verify token
    const user = db.prepare(`
      SELECT * FROM ${tableName} 
      WHERE id = ? AND password_reset_token = ? AND password_reset_expires > datetime('now')
    `).get(decoded.id, token);
    
    if (!user) {
      return c.json({
        success: false,
        message: 'Token invalide ou expiré'
      }, 400);
    }
    
    // Hash new password
    const hashedPassword = await hashPassword(newPassword);
    
    // Update password and clear reset token
    const updateStmt = db.prepare(`
      UPDATE ${tableName} 
      SET password_hash = ?, 
          password_reset_token = NULL, 
          password_reset_expires = NULL,
          is_temporary_password = 0,
          must_change_password = 0,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    updateStmt.run(hashedPassword, user.id);
    
    return c.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la réinitialisation',
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