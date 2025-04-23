import { Hono } from 'hono';
import { TechnicianModel } from '../models/technician.js';

const techniciansRouter = new Hono();

/**
 * GET /api/technicians
 * Get all technicians
 */
techniciansRouter.get('/', async (c) => {
  try {
    const technicians = await TechnicianModel.getAll();
    return c.json({
      success: true,
      data: technicians
    });
  } catch (error) {
    console.error('Error fetching technicians:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la récupération des techniciens',
      error: error.message
    }, 500);
  }
});

/**
 * GET /api/technicians/:id
 * Get a technician by ID
 */
techniciansRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const technician = await TechnicianModel.getById(parseInt(id, 10));
    
    if (!technician) {
      return c.json({
        success: false,
        message: 'Technicien non trouvé'
      }, 404);
    }
    
    return c.json({
      success: true,
      data: technician
    });
  } catch (error) {
    console.error(`Error fetching technician ${c.req.param('id')}:`, error);
    return c.json({
      success: false,
      message: 'Erreur lors de la récupération du technicien',
      error: error.message
    }, 500);
  }
});

/**
 * POST /api/technicians
 * Create a new technician
 */
techniciansRouter.post('/', async (c) => {
  try {
    const technicianData = await c.req.json();
    
    // Validate required fields
    const requiredFields = ['full_name', 'email'];
    const missingFields = requiredFields.filter(field => !technicianData[field]);
    
    if (missingFields.length > 0) {
      return c.json({
        success: false,
        message: 'Champs obligatoires manquants',
        missingFields
      }, 400);
    }
    
    const technician = await TechnicianModel.create(technicianData);
    
    return c.json({
      success: true,
      message: 'Technicien créé avec succès',
      data: technician
    }, 201);
  } catch (error) {
    console.error('Error creating technician:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la création du technicien',
      error: error.message
    }, 500);
  }
});

/**
 * PATCH /api/technicians/:id
 * Update a technician
 */
techniciansRouter.patch('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updateData = await c.req.json();
    
    // Check if technician exists
    const existingTechnician = await TechnicianModel.getById(parseInt(id, 10));
    if (!existingTechnician) {
      return c.json({
        success: false,
        message: 'Technicien non trouvé'
      }, 404);
    }
    
    const updatedTechnician = await TechnicianModel.update(parseInt(id, 10), updateData);
    
    return c.json({
      success: true,
      message: 'Technicien mis à jour avec succès',
      data: updatedTechnician
    });
  } catch (error) {
    console.error(`Error updating technician ${c.req.param('id')}:`, error);
    return c.json({
      success: false,
      message: 'Erreur lors de la mise à jour du technicien',
      error: error.message
    }, 500);
  }
});

/**
 * POST /api/technicians/:id/assign/:requestId
 * Assign a technician to a service request
 */
techniciansRouter.post('/:id/assign/:requestId', async (c) => {
  try {
    const technicianId = parseInt(c.req.param('id'), 10);
    const requestId = parseInt(c.req.param('requestId'), 10);
    const assignmentData = await c.req.json();
    
    const assignment = await TechnicianModel.assignToRequest(technicianId, requestId, assignmentData);
    
    return c.json({
      success: true,
      message: 'Technicien assigné à la demande avec succès',
      data: assignment
    }, 201);
  } catch (error) {
    console.error(`Error assigning technician ${c.req.param('id')} to request ${c.req.param('requestId')}:`, error);
    return c.json({
      success: false,
      message: 'Erreur lors de l\'assignation du technicien à la demande',
      error: error.message
    }, 500);
  }
});

export default techniciansRouter;