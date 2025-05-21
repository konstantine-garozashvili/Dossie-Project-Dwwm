import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../db/init-db.js';

const adminRouter = new Hono();

// Admin Login
adminRouter.post('/login', async (c) => {
  const { mail, password } = await c.req.json();
  const db = getDatabase();

  if (!mail || !password) {
    return c.json({ error: "Adresse mail et mot de passe requis" }, 400);
  }

  try {
    const stmt = db.prepare('SELECT * FROM admins WHERE mail = ?');
    const admin = stmt.get(mail);

    if (!admin) {
      return c.json({ error: "Identifiants incorrects" }, 401);
    }

    const passwordMatch = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatch) {
      return c.json({ error: "Identifiants incorrects" }, 401);
    }

    const secret = c.env.JWT_SECRET || process.env.JWT_SECRET || 'your-default-secret-key';
    if (!secret) {
        console.error('JWT_SECRET is not defined. Please set it in your .env file.');
        return c.json({ error: 'Configuration error on server' }, 500);
    }

    const payload = {
      id: admin.id,
      mail: admin.mail,
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
    };

    const token = await sign(payload, secret);

    return c.json({ token, message: 'Connexion réussie' });

  } catch (error) {
    console.error('Admin login error:', error);
    return c.json({ error: "Erreur interne du serveur" }, 500);
  }
});

// Middleware to protect admin routes
function adminAuthMiddleware() {
  return async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Authentification requise' }, 401);
    }
    const token = authHeader.split(' ')[1];
    const secret = c.env.JWT_SECRET || process.env.JWT_SECRET || 'your-default-secret-key';
    try {
      const payload = await import('hono/jwt').then(m => m.verify(token, secret));
      c.set('admin', payload);
      await next();
    } catch (err) {
      return c.json({ error: 'Token invalide ou expiré' }, 401);
    }
  };
}

export { adminAuthMiddleware };
export default adminRouter;