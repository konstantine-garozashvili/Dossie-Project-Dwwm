import { Hono } from 'hono';
import { getDatabase } from '../db/init-db.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';

const profileRouter = new Hono();

// Default avatar URL that's publicly accessible and reliable
const DEFAULT_AVATAR_URL = 'https://cdn.jsdelivr.net/npm/avataaars@1.2.2/avataaars-neutral.svg';

/**
 * GET /api/profile/picture/:userType/:userId
 * Get a user's profile picture
 */
profileRouter.get('/picture/:userType/:userId', async (c) => {
  const { userType, userId } = c.req.param();
  
  try {
    if (!['admin', 'technician'].includes(userType)) {
      return c.json({
        success: false,
        message: 'Type d\'utilisateur invalide',
        defaultUrl: DEFAULT_AVATAR_URL
      }, 400);
    }
    
    const db = getDatabase();
    const profilePicture = db.prepare(
      'SELECT * FROM profile_pictures WHERE user_id = ? AND user_type = ?'
    ).get(userId, userType);
    
    if (!profilePicture) {
      return c.json({
        success: false,
        message: 'Image de profil non trouvée',
        defaultUrl: DEFAULT_AVATAR_URL
      }, 404);
    }
    
    return c.json({
      success: true,
      profilePicture: {
        id: profilePicture.id,
        userId: profilePicture.user_id,
        userType: profilePicture.user_type,
        publicId: profilePicture.cloudinary_public_id,
        url: profilePicture.cloudinary_secure_url,
        secureUrl: profilePicture.cloudinary_secure_url
      }
    });
  } catch (error) {
    console.error('Error getting profile picture:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la récupération de l\'image de profil',
      error: error.message,
      defaultUrl: DEFAULT_AVATAR_URL
    }, 500);
  }
});

/**
 * POST /api/profile/picture/:userType/:userId
 * Upload or update a user's profile picture
 */
profileRouter.post('/picture/:userType/:userId', async (c) => {
  const { userType, userId } = c.req.param();
  
  try {
    if (!['admin', 'technician'].includes(userType)) {
      return c.json({
        success: false,
        message: 'Type d\'utilisateur invalide'
      }, 400);
    }
    
    // Get the image data from request (base64 string)
    const { imageData } = await c.req.json();
    
    if (!imageData) {
      return c.json({
        success: false,
        message: 'Données d\'image manquantes'
      }, 400);
    }
    
    const db = getDatabase();
    
    // Check if user exists in the appropriate table
    let userExists = false;
    
    if (userType === 'admin') {
      const admin = db.prepare('SELECT id FROM admins WHERE id = ?').get(userId);
      userExists = !!admin;
    } else if (userType === 'technician') {
      const technician = db.prepare('SELECT id FROM technicians WHERE id = ?').get(userId);
      userExists = !!technician;
    }
    
    if (!userExists) {
      return c.json({
        success: false,
        message: 'Utilisateur non trouvé'
      }, 404);
    }
    
    // Check if user already has a profile picture
    const existingPicture = db.prepare(
      'SELECT * FROM profile_pictures WHERE user_id = ? AND user_type = ?'
    ).get(userId, userType);
    
    // If user already has a profile picture, delete it from Cloudinary
    if (existingPicture) {
      await deleteImage(existingPicture.cloudinary_public_id);
    }
    
    // Upload new image to Cloudinary
    const cloudinaryResult = await uploadImage(imageData);
    
    // Insert or update profile picture record
    if (existingPicture) {
      // Update existing record
      db.prepare(`
        UPDATE profile_pictures 
        SET cloudinary_public_id = ?, cloudinary_secure_url = ?
        WHERE user_id = ? AND user_type = ?
      `).run(
        cloudinaryResult.public_id,
        cloudinaryResult.secure_url,
        userId,
        userType
      );
    } else {
      // Insert new record
      db.prepare(`
        INSERT INTO profile_pictures (
          user_id, user_type, cloudinary_public_id, cloudinary_secure_url
        ) VALUES (?, ?, ?, ?)
      `).run(
        userId,
        userType,
        cloudinaryResult.public_id,
        cloudinaryResult.secure_url
      );
    }
    
    return c.json({
      success: true,
      message: 'Image de profil mise à jour avec succès',
      profilePicture: {
        userId,
        userType,
        publicId: cloudinaryResult.public_id,
        url: cloudinaryResult.secure_url,
        secureUrl: cloudinaryResult.secure_url
      }
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'image de profil',
      error: error.message
    }, 500);
  }
});

/**
 * DELETE /api/profile/picture/:userType/:userId
 * Delete a user's profile picture
 */
profileRouter.delete('/picture/:userType/:userId', async (c) => {
  const { userType, userId } = c.req.param();
  
  try {
    if (!['admin', 'technician'].includes(userType)) {
      return c.json({
        success: false,
        message: 'Type d\'utilisateur invalide'
      }, 400);
    }
    
    const db = getDatabase();
    
    // Check if user exists in the appropriate table
    let userExists = false;
    
    if (userType === 'admin') {
      const admin = db.prepare('SELECT id FROM admins WHERE id = ?').get(userId);
      userExists = !!admin;
    } else if (userType === 'technician') {
      const technician = db.prepare('SELECT id FROM technicians WHERE id = ?').get(userId);
      userExists = !!technician;
    }
    
    if (!userExists) {
      return c.json({
        success: false,
        message: 'Utilisateur non trouvé'
      }, 404);
    }
    
    // Check if user has a profile picture
    const profilePicture = db.prepare(
      'SELECT * FROM profile_pictures WHERE user_id = ? AND user_type = ?'
    ).get(userId, userType);
    
    if (!profilePicture) {
      return c.json({
        success: false,
        message: 'Image de profil non trouvée',
        defaultUrl: DEFAULT_AVATAR_URL
      }, 404);
    }
    
    // Delete image from Cloudinary
    await deleteImage(profilePicture.cloudinary_public_id);
    
    // Delete record from database
    db.prepare(
      'DELETE FROM profile_pictures WHERE user_id = ? AND user_type = ?'
    ).run(userId, userType);
    
    return c.json({
      success: true,
      message: 'Image de profil supprimée avec succès',
      defaultUrl: DEFAULT_AVATAR_URL
    });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la suppression de l\'image de profil',
      error: error.message,
      defaultUrl: DEFAULT_AVATAR_URL
    }, 500);
  }
});

export default profileRouter; 