import { getDatabase } from '../db/init-db.js';

/**
 * Client model for handling database operations related to clients and their contacts
 */
export const ClientModel = {
  /**
   * Create a new client
   * @param {Object} clientData - The client data
   * @returns {Promise<Object>} The created client
   */
  async create(clientData) {
    const db = await getDatabase();
    
    // Determine if business or individual client
    const isBusiness = clientData.is_business || clientData.company_name ? 1 : 0;
    
    // Create client
    const clientResult = await db.run(
      `INSERT INTO clients (company_name, is_business) VALUES (?, ?)`,
      [clientData.company_name || null, isBusiness]
    );
    
    const clientId = clientResult.lastID;
    
    // Create client contact if provided
    if (clientData.contact) {
      await db.run(
        `INSERT INTO client_contacts 
         (client_id, full_name, email, phone, preferred_contact, address) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          clientId,
          clientData.contact.full_name,
          clientData.contact.email,
          clientData.contact.phone,
          clientData.contact.preferred_contact || 'email',
          clientData.contact.address
        ]
      );
    }
    
    // Get the created client with contact
    return this.getById(clientId);
  },
  
  /**
   * Get all clients
   * @param {Object} filters - Optional filters for the query
   * @returns {Promise<Array>} Array of clients
   */
  async getAll(filters = {}) {
    const db = await getDatabase();
    
    let query = `
      SELECT c.*, cc.full_name, cc.email, cc.phone, cc.preferred_contact, cc.address,
             COUNT(sr.request_id) as request_count
      FROM clients c
      LEFT JOIN client_contacts cc ON c.client_id = cc.client_id
      LEFT JOIN service_requests sr ON c.client_id = sr.client_id
    `;
    
    const queryParams = [];
    const whereConditions = [];
    
    // Apply filters
    if (filters.is_business !== undefined) {
      whereConditions.push('c.is_business = ?');
      queryParams.push(filters.is_business ? 1 : 0);
    }
    
    if (filters.search) {
      whereConditions.push('(c.company_name LIKE ? OR cc.full_name LIKE ? OR cc.email LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // Group by client_id to avoid duplicates due to multiple contacts
    query += ' GROUP BY c.client_id';
    
    // Add ordering
    query += ' ORDER BY c.created_at DESC';
    
    return db.all(query, queryParams);
  },
  
  /**
   * Get a client by ID
   * @param {number} clientId - The client ID
   * @returns {Promise<Object>} The client
   */
  async getById(clientId) {
    const db = await getDatabase();
    
    // Get client
    const client = await db.get(
      `SELECT * FROM clients WHERE client_id = ?`,
      [clientId]
    );
    
    if (!client) {
      return null;
    }
    
    // Get contacts for this client
    const contacts = await db.all(
      `SELECT * FROM client_contacts WHERE client_id = ?`,
      [clientId]
    );
    
    // Get service requests for this client
    const serviceRequests = await db.all(
      `SELECT request_id, service_type, device_type, status, priority, created_at, scheduled_date, scheduled_time
       FROM service_requests 
       WHERE client_id = ?
       ORDER BY created_at DESC`,
      [clientId]
    );
    
    return {
      ...client,
      contacts,
      serviceRequests
    };
  },
  
  /**
   * Update a client
   * @param {number} clientId - The client ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} The updated client
   */
  async update(clientId, updateData) {
    const db = await getDatabase();
    
    const setClauses = [];
    const queryParams = [];
    
    // Build SET clauses based on updateData
    if (updateData.company_name !== undefined) {
      setClauses.push('company_name = ?');
      queryParams.push(updateData.company_name);
    }
    
    if (updateData.is_business !== undefined) {
      setClauses.push('is_business = ?');
      queryParams.push(updateData.is_business ? 1 : 0);
    }
    
    // Always update the updated_at timestamp
    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    
    // Add client_id to params
    queryParams.push(clientId);
    
    // Execute update if there are fields to update
    if (setClauses.length > 0) {
      await db.run(
        `UPDATE clients SET ${setClauses.join(', ')} WHERE client_id = ?`,
        queryParams
      );
    }
    
    // Update contact if provided
    if (updateData.contact) {
      const contact = updateData.contact;
      
      // Check if contact exists
      const existingContact = await db.get(
        `SELECT * FROM client_contacts WHERE client_id = ? LIMIT 1`,
        [clientId]
      );
      
      if (existingContact) {
        // Update existing contact
        const contactSetClauses = [];
        const contactParams = [];
        
        if (contact.full_name) {
          contactSetClauses.push('full_name = ?');
          contactParams.push(contact.full_name);
        }
        
        if (contact.email) {
          contactSetClauses.push('email = ?');
          contactParams.push(contact.email);
        }
        
        if (contact.phone) {
          contactSetClauses.push('phone = ?');
          contactParams.push(contact.phone);
        }
        
        if (contact.preferred_contact) {
          contactSetClauses.push('preferred_contact = ?');
          contactParams.push(contact.preferred_contact);
        }
        
        if (contact.address) {
          contactSetClauses.push('address = ?');
          contactParams.push(contact.address);
        }
        
        if (contactSetClauses.length > 0) {
          contactParams.push(existingContact.contact_id);
          await db.run(
            `UPDATE client_contacts SET ${contactSetClauses.join(', ')} WHERE contact_id = ?`,
            contactParams
          );
        }
      } else if (contact.full_name || contact.email || contact.phone) {
        // Create new contact if it doesn't exist but data is provided
        await db.run(
          `INSERT INTO client_contacts 
           (client_id, full_name, email, phone, preferred_contact, address) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            clientId,
            contact.full_name || '',
            contact.email || '',
            contact.phone || '',
            contact.preferred_contact || 'email',
            contact.address || ''
          ]
        );
      }
    }
    
    // Return the updated client
    return this.getById(clientId);
  },
  
  /**
   * Delete a client
   * @param {number} clientId - The client ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(clientId) {
    const db = await getDatabase();
    
    // Check if client has service requests
    const serviceRequests = await db.get(
      `SELECT COUNT(*) as count FROM service_requests WHERE client_id = ?`,
      [clientId]
    );
    
    if (serviceRequests.count > 0) {
      throw new Error('Impossible de supprimer un client avec des demandes de service existantes');
    }
    
    // Delete client contacts first (foreign key constraint)
    await db.run(
      `DELETE FROM client_contacts WHERE client_id = ?`,
      [clientId]
    );
    
    // Delete client
    const result = await db.run(
      `DELETE FROM clients WHERE client_id = ?`,
      [clientId]
    );
    
    return result.changes > 0;
  },
  
  /**
   * Add a contact to a client
   * @param {number} clientId - The client ID
   * @param {Object} contactData - The contact data
   * @returns {Promise<Object>} The created contact
   */
  async addContact(clientId, contactData) {
    const db = await getDatabase();
    
    // Check if client exists
    const client = await this.getById(clientId);
    if (!client) {
      throw new Error('Client non trouvé');
    }
    
    // Create contact
    const result = await db.run(
      `INSERT INTO client_contacts 
       (client_id, full_name, email, phone, preferred_contact, address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        clientId,
        contactData.full_name,
        contactData.email,
        contactData.phone,
        contactData.preferred_contact || 'email',
        contactData.address
      ]
    );
    
    // Get the created contact
    const contact = await db.get(
      `SELECT * FROM client_contacts WHERE contact_id = ?`,
      [result.lastID]
    );
    
    return contact;
  },
  
  /**
   * Update a client contact
   * @param {number} contactId - The contact ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} The updated contact
   */
  async updateContact(contactId, updateData) {
    const db = await getDatabase();
    
    const setClauses = [];
    const queryParams = [];
    
    // Build SET clauses based on updateData
    if (updateData.full_name) {
      setClauses.push('full_name = ?');
      queryParams.push(updateData.full_name);
    }
    
    if (updateData.email) {
      setClauses.push('email = ?');
      queryParams.push(updateData.email);
    }
    
    if (updateData.phone) {
      setClauses.push('phone = ?');
      queryParams.push(updateData.phone);
    }
    
    if (updateData.preferred_contact) {
      setClauses.push('preferred_contact = ?');
      queryParams.push(updateData.preferred_contact);
    }
    
    if (updateData.address) {
      setClauses.push('address = ?');
      queryParams.push(updateData.address);
    }
    
    // Add contact_id to params
    queryParams.push(contactId);
    
    // Execute update if there are fields to update
    if (setClauses.length > 0) {
      await db.run(
        `UPDATE client_contacts SET ${setClauses.join(', ')} WHERE contact_id = ?`,
        queryParams
      );
    }
    
    // Get the updated contact
    const contact = await db.get(
      `SELECT * FROM client_contacts WHERE contact_id = ?`,
      [contactId]
    );
    
    return contact;
  },
  
  /**
   * Delete a client contact
   * @param {number} contactId - The contact ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteContact(contactId) {
    const db = await getDatabase();
    
    // Get the contact to check if it's the last one for the client
    const contact = await db.get(
      `SELECT * FROM client_contacts WHERE contact_id = ?`,
      [contactId]
    );
    
    if (!contact) {
      return false;
    }
    
    // Check if this is the last contact for the client
    const contactCount = await db.get(
      `SELECT COUNT(*) as count FROM client_contacts WHERE client_id = ?`,
      [contact.client_id]
    );
    
    if (contactCount.count <= 1) {
      throw new Error('Impossible de supprimer le dernier contact d\'un client');
    }
    
    // Delete contact
    const result = await db.run(
      `DELETE FROM client_contacts WHERE contact_id = ?`,
      [contactId]
    );
    
    return result.changes > 0;
  }
};