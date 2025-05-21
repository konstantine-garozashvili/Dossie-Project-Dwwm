import { getDatabase } from '../db/init-db.js';

/**
 * Service Request model for handling database operations related to service requests
 */
export const ServiceRequestModel = {
  /**
   * Create a new service request
   * @param {Object} requestData - The service request data
   * @returns {Promise<Object>} The created service request
   */
  async create(requestData) {
    const db = await getDatabase();
    
    // First create or get the client
    let clientId;
    if (requestData.clientType === 'business') {
      // Create business client
      const clientResult = await db.run(
        `INSERT INTO clients (company_name, is_business) VALUES (?, 1)`,
        [requestData.contactInfo.businessName]
      );
      clientId = clientResult.lastID;
    } else {
      // Create individual client
      const clientResult = await db.run(
        `INSERT INTO clients (is_business) VALUES (0)`
      );
      clientId = clientResult.lastID;
    }
    
    // Create client contact
    await db.run(
      `INSERT INTO client_contacts 
       (client_id, full_name, email, phone, preferred_contact, address) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        clientId,
        requestData.contactInfo.fullName,
        requestData.contactInfo.email,
        requestData.contactInfo.phone,
        requestData.contactInfo.preferredContact,
        requestData.contactInfo.address
      ]
    );
    
    // Create service request
    const deviceDetailsJson = JSON.stringify(requestData.deviceDetails);
    const result = await db.run(
      `INSERT INTO service_requests 
       (client_id, service_type, device_type, device_details, description, 
        scheduled_date, scheduled_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        clientId,
        requestData.serviceType,
        requestData.deviceType,
        deviceDetailsJson,
        requestData.deviceDetails.problemDescription,
        requestData.schedulingDetails.date,
        requestData.schedulingDetails.timeSlot
      ]
    );
    
    // Get the created service request
    const serviceRequest = await db.get(
      `SELECT * FROM service_requests WHERE request_id = ?`,
      [result.lastID]
    );
    
    return {
      ...serviceRequest,
      device_details: JSON.parse(serviceRequest.device_details)
    };
  },
  
  /**
   * Get all service requests
   * @param {Object} filters - Optional filters for the query
   * @returns {Promise<Array>} Array of service requests
   */
  async getAll(filters = {}) {
    const db = await getDatabase();
    
    let query = `
      SELECT sr.*, c.company_name, cc.full_name, cc.email, cc.phone
      FROM service_requests sr
      JOIN clients c ON sr.client_id = c.client_id
      JOIN client_contacts cc ON c.client_id = cc.client_id
    `;
    
    const queryParams = [];
    const whereConditions = [];
    
    // Apply filters
    if (filters.status) {
      whereConditions.push('sr.status = ?');
      queryParams.push(filters.status);
    }
    
    if (filters.priority) {
      whereConditions.push('sr.priority = ?');
      queryParams.push(filters.priority);
    }
    
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // Add ordering
    query += ' ORDER BY sr.created_at DESC';
    
    const serviceRequests = await db.all(query, queryParams);
    
    // Parse JSON fields
    return serviceRequests.map(request => ({
      ...request,
      device_details: JSON.parse(request.device_details)
    }));
  },
  
  /**
   * Get a service request by ID
   * @param {number} requestId - The service request ID
   * @returns {Promise<Object>} The service request
   */
  async getById(requestId) {
    const db = await getDatabase();
    
    const serviceRequest = await db.get(
      `SELECT sr.*, c.company_name, cc.full_name, cc.email, cc.phone
       FROM service_requests sr
       JOIN clients c ON sr.client_id = c.client_id
       JOIN client_contacts cc ON c.client_id = cc.client_id
       WHERE sr.request_id = ?`,
      [requestId]
    );
    
    if (!serviceRequest) {
      return null;
    }
    
    // Get notes for this request
    const notes = await db.all(
      `SELECT sn.*, t.full_name as technician_name
       FROM service_notes sn
       LEFT JOIN technicians t ON sn.technician_id = t.technician_id
       WHERE sn.request_id = ?
       ORDER BY sn.created_at DESC`,
      [requestId]
    );
    
    // Get assignment if exists
    const assignment = await db.get(
      `SELECT a.*, t.full_name as technician_name
       FROM assignments a
       JOIN technicians t ON a.technician_id = t.technician_id
       WHERE a.request_id = ?`,
      [requestId]
    );
    
    return {
      ...serviceRequest,
      device_details: JSON.parse(serviceRequest.device_details),
      notes,
      assignment
    };
  },
  
  /**
   * Update a service request
   * @param {number} requestId - The service request ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} The updated service request
   */
  async update(requestId, updateData) {
    const db = await getDatabase();
    
    const setClauses = [];
    const queryParams = [];
    
    // Build SET clauses based on updateData
    if (updateData.status) {
      setClauses.push('status = ?');
      queryParams.push(updateData.status);
    }
    
    if (updateData.priority) {
      setClauses.push('priority = ?');
      queryParams.push(updateData.priority);
    }
    
    if (updateData.scheduled_date) {
      setClauses.push('scheduled_date = ?');
      queryParams.push(updateData.scheduled_date);
    }
    
    if (updateData.scheduled_time) {
      setClauses.push('scheduled_time = ?');
      queryParams.push(updateData.scheduled_time);
    }
    
    // Always update the updated_at timestamp
    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    
    // Add request_id to params
    queryParams.push(requestId);
    
    // Execute update if there are fields to update
    if (setClauses.length > 0) {
      await db.run(
        `UPDATE service_requests SET ${setClauses.join(', ')} WHERE request_id = ?`,
        queryParams
      );
    }
    
    // Return the updated service request
    return this.getById(requestId);
  },
  
  /**
   * Add a note to a service request
   * @param {number} requestId - The service request ID
   * @param {Object} noteData - The note data
   * @returns {Promise<Object>} The created note
   */
  async addNote(requestId, noteData) {
    const db = await getDatabase();
    
    const result = await db.run(
      `INSERT INTO service_notes (request_id, technician_id, note_text)
       VALUES (?, ?, ?)`,
      [requestId, noteData.technician_id || null, noteData.note_text]
    );
    
    const note = await db.get(
      `SELECT sn.*, t.full_name as technician_name
       FROM service_notes sn
       LEFT JOIN technicians t ON sn.technician_id = t.technician_id
       WHERE sn.note_id = ?`,
      [result.lastID]
    );
    
    return note;
  }
};