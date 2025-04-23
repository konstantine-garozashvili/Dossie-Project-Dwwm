import { getDatabase } from '../db/index.js';

/**
 * Technician model for handling database operations related to technicians
 */
export const TechnicianModel = {
  /**
   * Create a new technician
   * @param {Object} technicianData - The technician data
   * @returns {Promise<Object>} The created technician
   */
  async create(technicianData) {
    const db = await getDatabase();
    
    // Convert object fields to JSON strings
    const skills = JSON.stringify(technicianData.skills || []);
    const certifications = JSON.stringify(technicianData.certifications || []);
    const availability = JSON.stringify(technicianData.availability || {});
    const location = JSON.stringify(technicianData.location || {});
    const performance = JSON.stringify(technicianData.performance || {});
    
    // Create technician
    const result = await db.run(
      `INSERT INTO technicians 
       (full_name, email, phone, skills, certifications, availability, location, performance) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        technicianData.full_name,
        technicianData.email,
        technicianData.phone,
        skills,
        certifications,
        availability,
        location,
        performance
      ]
    );
    
    // Get the created technician
    const technician = await db.get(
      `SELECT * FROM technicians WHERE technician_id = ?`,
      [result.lastID]
    );
    
    return {
      ...technician,
      skills: JSON.parse(technician.skills),
      certifications: JSON.parse(technician.certifications),
      availability: JSON.parse(technician.availability),
      location: JSON.parse(technician.location),
      performance: JSON.parse(technician.performance)
    };
  },
  
  /**
   * Get all technicians
   * @returns {Promise<Array>} Array of technicians
   */
  async getAll() {
    const db = await getDatabase();
    
    const technicians = await db.all(`SELECT * FROM technicians`);
    
    // Parse JSON fields
    return technicians.map(technician => ({
      ...technician,
      skills: JSON.parse(technician.skills),
      certifications: JSON.parse(technician.certifications),
      availability: JSON.parse(technician.availability),
      location: JSON.parse(technician.location),
      performance: JSON.parse(technician.performance)
    }));
  },
  
  /**
   * Get a technician by ID
   * @param {number} technicianId - The technician ID
   * @returns {Promise<Object>} The technician
   */
  async getById(technicianId) {
    const db = await getDatabase();
    
    const technician = await db.get(
      `SELECT * FROM technicians WHERE technician_id = ?`,
      [technicianId]
    );
    
    if (!technician) {
      return null;
    }
    
    // Get assignments for this technician
    const assignments = await db.all(
      `SELECT a.*, sr.service_type, sr.device_type, sr.status as request_status
       FROM assignments a
       JOIN service_requests sr ON a.request_id = sr.request_id
       WHERE a.technician_id = ?
       ORDER BY a.created_at DESC`,
      [technicianId]
    );
    
    return {
      ...technician,
      skills: JSON.parse(technician.skills),
      certifications: JSON.parse(technician.certifications),
      availability: JSON.parse(technician.availability),
      location: JSON.parse(technician.location),
      performance: JSON.parse(technician.performance),
      assignments
    };
  },
  
  /**
   * Update a technician
   * @param {number} technicianId - The technician ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} The updated technician
   */
  async update(technicianId, updateData) {
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
    
    if (updateData.skills) {
      setClauses.push('skills = ?');
      queryParams.push(JSON.stringify(updateData.skills));
    }
    
    if (updateData.certifications) {
      setClauses.push('certifications = ?');
      queryParams.push(JSON.stringify(updateData.certifications));
    }
    
    if (updateData.availability) {
      setClauses.push('availability = ?');
      queryParams.push(JSON.stringify(updateData.availability));
    }
    
    if (updateData.location) {
      setClauses.push('location = ?');
      queryParams.push(JSON.stringify(updateData.location));
    }
    
    if (updateData.performance) {
      setClauses.push('performance = ?');
      queryParams.push(JSON.stringify(updateData.performance));
    }
    
    // Always update the updated_at timestamp
    setClauses.push('updated_at = CURRENT_TIMESTAMP');
    
    // Add technician_id to params
    queryParams.push(technicianId);
    
    // Execute update if there are fields to update
    if (setClauses.length > 0) {
      await db.run(
        `UPDATE technicians SET ${setClauses.join(', ')} WHERE technician_id = ?`,
        queryParams
      );
    }
    
    // Return the updated technician
    return this.getById(technicianId);
  },
  
  /**
   * Assign a technician to a service request
   * @param {number} technicianId - The technician ID
   * @param {number} requestId - The service request ID
   * @param {Object} assignmentData - Additional assignment data
   * @returns {Promise<Object>} The created assignment
   */
  async assignToRequest(technicianId, requestId, assignmentData = {}) {
    const db = await getDatabase();
    
    // Check if technician exists
    const technician = await this.getById(technicianId);
    if (!technician) {
      throw new Error('Technicien non trouvé');
    }
    
    // Check if service request exists
    const serviceRequest = await db.get(
      `SELECT * FROM service_requests WHERE request_id = ?`,
      [requestId]
    );
    
    if (!serviceRequest) {
      throw new Error('Demande de service non trouvée');
    }
    
    // Create assignment
    const result = await db.run(
      `INSERT INTO assignments 
       (request_id, technician_id, priority, notes, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        requestId,
        technicianId,
        assignmentData.priority || 'medium',
        assignmentData.notes || '',
        assignmentData.status || 'assigned'
      ]
    );
    
    // Update service request status
    await db.run(
      `UPDATE service_requests SET status = 'assigned', updated_at = CURRENT_TIMESTAMP WHERE request_id = ?`,
      [requestId]
    );
    
    // Get the created assignment
    const assignment = await db.get(
      `SELECT a.*, t.full_name as technician_name
       FROM assignments a
       JOIN technicians t ON a.technician_id = t.technician_id
       WHERE a.assignment_id = ?`,
      [result.lastID]
    );
    
    return assignment;
  }
};