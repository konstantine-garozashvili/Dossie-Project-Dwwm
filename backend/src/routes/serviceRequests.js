import { Hono } from 'hono';
import { ServiceRequestModel } from '../models/serviceRequest.js';

const serviceRequestsRouter = new Hono();

/**
 * GET /api/service-requests
 * Get all service requests with optional filtering
 */
serviceRequestsRouter.get('/', async (c) => {
  try {
    const { status, priority } = c.req.query();
    const filters = {};
    
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    
    const serviceRequests = await ServiceRequestModel.getAll(filters);
    return c.json({
      success: true,
      data: serviceRequests
    });
  } catch (error) {
    console.error('Error fetching service requests:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la récupération des demandes de service',
      error: error.message
    }, 500);
  }
});

/**
 * GET /api/service-requests/:id
 * Get a service request by ID
 */
serviceRequestsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const serviceRequest = await ServiceRequestModel.getById(parseInt(id, 10));
    
    if (!serviceRequest) {
      return c.json({
        success: false,
        message: 'Demande de service non trouvée'
      }, 404);
    }
    
    return c.json({
      success: true,
      data: serviceRequest
    });
  } catch (error) {
    console.error(`Error fetching service request ${c.req.param('id')}:`, error);
    return c.json({
      success: false,
      message: 'Erreur lors de la récupération de la demande de service',
      error: error.message
    }, 500);
  }
});

/**
 * POST /api/service-requests
 * Create a new service request
 */
serviceRequestsRouter.post('/', async (c) => {
  try {
    const requestData = await c.req.json();
    
    // Validate required fields
    const requiredFields = ['serviceType', 'deviceType', 'deviceDetails', 'contactInfo'];
    const missingFields = requiredFields.filter(field => !requestData[field]);
    
    if (missingFields.length > 0) {
      return c.json({
        success: false,
        message: 'Champs obligatoires manquants',
        missingFields
      }, 400);
    }
    
    const serviceRequest = await ServiceRequestModel.create(requestData);
    
    return c.json({
      success: true,
      message: 'Demande de service créée avec succès',
      data: serviceRequest
    }, 201);
  } catch (error) {
    console.error('Error creating service request:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la création de la demande de service',
      error: error.message
    }, 500);
  }
});

/**
 * PATCH /api/service-requests/:id
 * Update a service request
 */
serviceRequestsRouter.patch('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updateData = await c.req.json();
    
    // Check if service request exists
    const existingRequest = await ServiceRequestModel.getById(parseInt(id, 10));
    if (!existingRequest) {
      return c.json({
        success: false,
        message: 'Demande de service non trouvée'
      }, 404);
    }
    
    const updatedRequest = await ServiceRequestModel.update(parseInt(id, 10), updateData);
    
    return c.json({
      success: true,
      message: 'Demande de service mise à jour avec succès',
      data: updatedRequest
    });
  } catch (error) {
    console.error(`Error updating service request ${c.req.param('id')}:`, error);
    return c.json({
      success: false,
      message: 'Erreur lors de la mise à jour de la demande de service',
      error: error.message
    }, 500);
  }
});

/**
 * POST /api/service-requests/:id/notes
 * Add a note to a service request
 */
serviceRequestsRouter.post('/:id/notes', async (c) => {
  try {
    const id = c.req.param('id');
    const noteData = await c.req.json();
    
    // Check if service request exists
    const existingRequest = await ServiceRequestModel.getById(parseInt(id, 10));
    if (!existingRequest) {
      return c.json({
        success: false,
        message: 'Demande de service non trouvée'
      }, 404);
    }
    
    // Validate note data
    if (!noteData.note_text) {
      return c.json({
        success: false,
        message: 'Le texte de la note est requis'
      }, 400);
    }
    
    const note = await ServiceRequestModel.addNote(parseInt(id, 10), noteData);
    
    return c.json({
      success: true,
      message: 'Note ajoutée avec succès',
      data: note
    }, 201);
  } catch (error) {
    console.error(`Error adding note to service request ${c.req.param('id')}:`, error);
    return c.json({
      success: false,
      message: 'Erreur lors de l\'ajout de la note',
      error: error.message
    }, 500);
  }
});

export default serviceRequestsRouter;