import { Hono } from 'hono';
import { ClientModel } from '../models/client.js';

const clientsRouter = new Hono();

/**
 * GET /api/clients
 * Get all clients with optional filtering
 */
clientsRouter.get('/', async (c) => {
  try {
    const { is_business, search } = c.req.query();
    const filters = {};
    
    if (is_business !== undefined) {
      filters.is_business = is_business === 'true' || is_business === '1';
    }
    
    if (search) {
      filters.search = search;
    }
    
    const clients = await ClientModel.getAll(filters);
    return c.json({
      success: true,
      data: clients
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la récupération des clients',
      error: error.message
    }, 500);
  }
});

/**
 * GET /api/clients/:id
 * Get a client by ID
 */
clientsRouter.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const client = await ClientModel.getById(parseInt(id, 10));
    
    if (!client) {
      return c.json({
        success: false,
        message: 'Client non trouvé'
      }, 404);
    }
    
    return c.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error(`Error fetching client ${c.req.param('id')}:`, error);
    return c.json({
      success: false,
      message: 'Erreur lors de la récupération du client',
      error: error.message
    }, 500);
  }
});

/**
 * POST /api/clients
 * Create a new client
 */
clientsRouter.post('/', async (c) => {
  try {
    const clientData = await c.req.json();
    
    // Validate required fields based on client type
    if (clientData.is_business && !clientData.company_name) {
      return c.json({
        success: false,
        message: 'Le nom de l\'entreprise est requis pour les clients professionnels',
      }, 400);
    }
    
    // Validate contact information
    if (!clientData.contact || !clientData.contact.full_name || !clientData.contact.email) {
      return c.json({
        success: false,
        message: 'Les informations de contact (nom et email) sont requises',
      }, 400);
    }
    
    const client = await ClientModel.create(clientData);
    
    return c.json({
      success: true,
      message: 'Client créé avec succès',
      data: client
    }, 201);
  } catch (error) {
    console.error('Error creating client:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la création du client',
      error: error.message
    }, 500);
  }
});

/**
 * PATCH /api/clients/:id
 * Update a client
 */
clientsRouter.patch('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updateData = await c.req.json();
    
    // Check if client exists
    const existingClient = await ClientModel.getById(parseInt(id, 10));
    if (!existingClient) {
      return c.json({
        success: false,
        message: 'Client non trouvé'
      }, 404);
    }
    
    const updatedClient = await ClientModel.update(parseInt(id, 10), updateData);
    
    return c.json({
      success: true,
      message: 'Client mis à jour avec succès',
      data: updatedClient
    });
  } catch (error) {
    console.error(`Error updating client ${c.req.param('id')}:`, error);
    return c.json({
      success: false,
      message: 'Erreur lors de la mise à jour du client',
      error: error.message
    }, 500);
  }
});

/**
 * DELETE /api/clients/:id
 * Delete a client
 */
clientsRouter.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Check if client exists
    const existingClient = await ClientModel.getById(parseInt(id, 10));
    if (!existingClient) {
      return c.json({
        success: false,
        message: 'Client non trouvé'
      }, 404);
    }
    
    await ClientModel.delete(parseInt(id, 10));
    
    return c.json({
      success: true,
      message: 'Client supprimé avec succès'
    });
  } catch (error) {
    console.error(`Error deleting client ${c.req.param('id')}:`, error);
    return c.json({
      success: false,
      message: 'Erreur lors de la suppression du client',
      error: error.message
    }, 500);
  }
});

/**
 * POST /api/clients/:id/contacts
 * Add a contact to a client
 */
clientsRouter.post('/:id/contacts', async (c) => {
  try {
    const id = c.req.param('id');
    const contactData = await c.req.json();
    
    // Check if client exists
    const existingClient = await ClientModel.getById(parseInt(id, 10));
    if (!existingClient) {
      return c.json({
        success: false,
        message: 'Client non trouvé'
      }, 404);
    }
    
    // Validate contact data
    if (!contactData.full_name || !contactData.email) {
      return c.json({
        success: false,
        message: 'Le nom et l\'email du contact sont requis'
      }, 400);
    }
    
    const contact = await ClientModel.addContact(parseInt(id, 10), contactData);
    
    return c.json({
      success: true,
      message: 'Contact ajouté avec succès',
      data: contact
    }, 201);
  } catch (error) {
    console.error(`Error adding contact to client ${c.req.param('id')}:`, error);
    return c.json({
      success: false,
      message: 'Erreur lors de l\'ajout du contact',
      error: error.message
    }, 500);
  }
});

/**
 * PATCH /api/clients/contacts/:id
 * Update a client contact
 */
clientsRouter.patch('/contacts/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updateData = await c.req.json();
    
    const updatedContact = await ClientModel.updateContact(parseInt(id, 10), updateData);
    
    if (!updatedContact) {
      return c.json({
        success: false,
        message: 'Contact non trouvé'
      }, 404);
    }
    
    return c.json({
      success: true,
      message: 'Contact mis à jour avec succès',
      data: updatedContact
    });
  } catch (error) {
    console.error(`Error updating contact ${c.req.param('id')}:`, error);
    return c.json({
      success: false,
      message: 'Erreur lors de la mise à jour du contact',
      error: error.message
    }, 500);
  }
});

/**
 * DELETE /api/clients/contacts/:id
 * Delete a client contact
 */
clientsRouter.delete('/contacts/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const result = await ClientModel.deleteContact(parseInt(id, 10));
    
    if (!result) {
      return c.json({
        success: false,
        message: 'Contact non trouvé'
      }, 404);
    }
    
    return c.json({
      success: true,
      message: 'Contact supprimé avec succès'
    });
  } catch (error) {
    console.error(`Error deleting contact ${c.req.param('id')}:`, error);
    return c.json({
      success: false,
      message: 'Erreur lors de la suppression du contact',
      error: error.message
    }, 500);
  }
});

export default clientsRouter;