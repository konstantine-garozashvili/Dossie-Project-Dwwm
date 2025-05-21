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

// --- Technicians CRUD Endpoints (Admin Only) ---

// Middleware for all /technicians routes
adminRouter.use('/technicians/*', adminAuthMiddleware());

// Create a new technician
adminRouter.post('/technicians', async (c) => {
  const db = getDatabase();
  try {
    const { name, surname, email, password, phone_number, specialization, status } = await c.req.json();

    // Basic validation
    if (!name || !surname || !email || !password) {
      return c.json({ success: false, message: 'Nom, prénom, email et mot de passe sont requis.' }, 400);
    }

    // Check if email already exists
    const existingTechnician = db.prepare('SELECT id FROM technicians WHERE email = ?').get(email);
    if (existingTechnician) {
      return c.json({ success: false, message: 'Un technicien avec cet email existe déjà.' }, 409);
    }

    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const result = db.prepare(
      'INSERT INTO technicians (name, surname, email, password_hash, phone_number, specialization, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(name, surname, email, hashedPassword, phone_number, specialization, status || 'active');

    if (result.changes === 0) {
      return c.json({ success: false, message: 'Échec de la création du technicien.' }, 500);
    }

    const newTechnicianId = result.lastInsertRowid;
    const newTechnician = db.prepare('SELECT id, name, surname, email, phone_number, specialization, status, created_at, updated_at FROM technicians WHERE id = ?').get(newTechnicianId);

    return c.json({ success: true, technician: newTechnician }, 201);
  } catch (error) {
    console.error('Error creating technician:', error);
    return c.json({ success: false, message: 'Erreur interne du serveur.', error: error.message }, 500);
  }
});

// Get all technicians (with basic pagination)
adminRouter.get('/technicians', async (c) => {
  const db = getDatabase();
  try {
    const { page = 1, limit = 10, search = '', status = '' } = c.req.query();
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT t.id, t.name, t.surname, t.email, t.phone_number, t.specialization, t.status, t.created_at, t.updated_at, pp.cloudinary_secure_url AS profile_picture_url FROM technicians t LEFT JOIN profile_pictures pp ON t.id = pp.user_id AND pp.user_type = \'technician\'';
    const params = [];
    const conditions = [];

    if (search) {
      conditions.push('(t.name LIKE ? OR t.surname LIKE ? OR t.email LIKE ? OR t.specialization LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (status) {
      conditions.push('t.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY t.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const technicians = db.prepare(query).all(...params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM technicians t'; // Alias technicians table as t
    const countParamsForTotal = [];
    // Rebuild conditions for count query, ensuring they target aliased table t
    const countConditions = [];
    if (search) {
      countConditions.push('(t.name LIKE ? OR t.surname LIKE ? OR t.email LIKE ? OR t.specialization LIKE ?)');
      const searchTerm = `%${search}%`;
      countParamsForTotal.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    if (status) {
      countConditions.push('t.status = ?');
      countParamsForTotal.push(status);
    }

    if (countConditions.length > 0) {
      countQuery += ' WHERE ' + countConditions.join(' AND ');
    }
    
    const { total } = db.prepare(countQuery).get(...countParamsForTotal);

    return c.json({ 
      success: true, 
      technicians, 
      pagination: { 
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching technicians:', error);
    return c.json({ success: false, message: 'Erreur interne du serveur.', error: error.message }, 500);
  }
});

// Get a single technician by ID
adminRouter.get('/technicians/:id', async (c) => {
  const db = getDatabase();
  try {
    const { id } = c.req.param();
    const technician = db.prepare(
      'SELECT t.id, t.name, t.surname, t.email, t.phone_number, t.specialization, t.status, t.created_at, t.updated_at, pp.cloudinary_secure_url AS profile_picture_url FROM technicians t LEFT JOIN profile_pictures pp ON t.id = pp.user_id AND pp.user_type = \'technician\' WHERE t.id = ?'
    ).get(id);

    if (!technician) {
      return c.json({ success: false, message: 'Technicien non trouvé.' }, 404);
    }
    return c.json({ success: true, technician });
  } catch (error) {
    console.error('Error fetching technician:', error);
    return c.json({ success: false, message: 'Erreur interne du serveur.', error: error.message }, 500);
  }
});

// Update a technician
adminRouter.put('/technicians/:id', async (c) => {
  const db = getDatabase();
  try {
    const { id } = c.req.param();
    const { name, surname, email, phone_number, specialization, status, password } = await c.req.json();

    // Check if technician exists
    const existingTechnician = db.prepare('SELECT id, email FROM technicians WHERE id = ?').get(id);
    if (!existingTechnician) {
      return c.json({ success: false, message: 'Technicien non trouvé.' }, 404);
    }

    // Check if new email already exists for another technician
    if (email && email !== existingTechnician.email) {
      const otherTechnicianWithEmail = db.prepare('SELECT id FROM technicians WHERE email = ? AND id != ?').get(email, id);
      if (otherTechnicianWithEmail) {
        return c.json({ success: false, message: 'Un autre technicien utilise déjà cet email.' }, 409);
      }
    }

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (surname) fieldsToUpdate.surname = surname;
    if (email) fieldsToUpdate.email = email;
    if (phone_number) fieldsToUpdate.phone_number = phone_number;
    if (specialization) fieldsToUpdate.specialization = specialization;
    if (status) fieldsToUpdate.status = status;
    if (password) {
      const saltRounds = 10;
      fieldsToUpdate.password_hash = bcrypt.hashSync(password, saltRounds);
    }
    fieldsToUpdate.updated_at = new Date().toISOString(); // Manually set updated_at

    if (Object.keys(fieldsToUpdate).length === 1 && fieldsToUpdate.updated_at) { // Only updated_at was set means no actual data change
        // if only updated_at is present (password was not provided, other fields are null/undefined)
        // we can either return 200 with no changes or 304 Not Modified. For simplicity, let's return current data.
        const currentTechnician = db.prepare('SELECT t.id, t.name, t.surname, t.email, t.phone_number, t.specialization, t.status, t.created_at, t.updated_at, pp.cloudinary_secure_url AS profile_picture_url FROM technicians t LEFT JOIN profile_pictures pp ON t.id = pp.user_id AND pp.user_type = \'technician\' WHERE t.id = ?').get(id);
        return c.json({ success: true, technician: currentTechnician, message: "Aucune modification fournie." });
    }
    
    const setClauses = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
    const values = Object.values(fieldsToUpdate);
    values.push(id); // For the WHERE clause

    const stmt = db.prepare(`UPDATE technicians SET ${setClauses} WHERE id = ?`);
    const result = stmt.run(...values);

    if (result.changes === 0 && !(Object.keys(fieldsToUpdate).length === 1 && fieldsToUpdate.updated_at)) {
        // This condition might be true if the submitted data is identical to existing data
        // or if only updated_at was in fieldsToUpdate but no other fields changed (already handled above)
        const currentTechnician = db.prepare('SELECT t.id, t.name, t.surname, t.email, t.phone_number, t.specialization, t.status, t.created_at, t.updated_at, pp.cloudinary_secure_url AS profile_picture_url FROM technicians t LEFT JOIN profile_pictures pp ON t.id = pp.user_id AND pp.user_type = \'technician\' WHERE t.id = ?').get(id);
         return c.json({ success: true, technician: currentTechnician, message: "Aucune modification effective des données." });
    }

    const updatedTechnician = db.prepare('SELECT t.id, t.name, t.surname, t.email, t.phone_number, t.specialization, t.status, t.created_at, t.updated_at, pp.cloudinary_secure_url AS profile_picture_url FROM technicians t LEFT JOIN profile_pictures pp ON t.id = pp.user_id AND pp.user_type = \'technician\' WHERE t.id = ?').get(id);
    return c.json({ success: true, technician: updatedTechnician });
  } catch (error) {
    console.error('Error updating technician:', error);
    return c.json({ success: false, message: 'Erreur interne du serveur.', error: error.message }, 500);
  }
});

// Delete a technician
adminRouter.delete('/technicians/:id', async (c) => {
  const db = getDatabase();
  try {
    const { id } = c.req.param();

    // TODO: Consider what to do with related data, e.g., profile pictures on Cloudinary, assigned tasks, etc.
    // For now, just deleting from the technicians table.
    // Also, potentially mark as inactive instead of hard delete for data integrity.

    const result = db.prepare('DELETE FROM technicians WHERE id = ?').run(id);

    if (result.changes === 0) {
      return c.json({ success: false, message: 'Technicien non trouvé ou déjà supprimé.' }, 404);
    }

    return c.json({ success: true, message: 'Technicien supprimé avec succès.' });
  } catch (error) {
    console.error('Error deleting technician:', error);
    return c.json({ success: false, message: 'Erreur interne du serveur.', error: error.message }, 500);
  }
});

export { adminAuthMiddleware };
export default adminRouter;