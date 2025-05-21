import { getDatabase } from '../db/init-db.js';

/**
 * TechnicianApplication model for handling database operations related to technician applications
 */
export const TechnicianApplicationModel = {
  /**
   * Create a new technician application
   * @param {Object} applicationData - The application data
   * @returns {Promise<Object>} The created application
   */
  async create(applicationData) {
    const db = await getDatabase();
    
    // Convert complex objects to JSON strings
    const personalInfo = JSON.stringify(applicationData.personalInfo || {});
    const professionalInfo = JSON.stringify(applicationData.professionalInfo || {});
    const background = JSON.stringify(applicationData.background || {});
    const additionalInfo = JSON.stringify(applicationData.additionalInfo || {});
    const documents = JSON.stringify(applicationData.documents || {});
    
    // Insert application into database
    const result = await db.run(
      `INSERT INTO technician_applications 
       (personal_info, professional_info, background, additional_info, documents, status, submitted_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        personalInfo,
        professionalInfo,
        background,
        additionalInfo,
        documents,
        applicationData.status || 'pending',
        applicationData.submittedAt || new Date().toISOString()
      ]
    );
    
    // Get the created application
    const application = await db.get(
      `SELECT * FROM technician_applications WHERE application_id = ?`,
      [result.lastID]
    );
    
    // Parse JSON fields
    return {
      ...application,
      personal_info: JSON.parse(application.personal_info),
      professional_info: JSON.parse(application.professional_info),
      background: JSON.parse(application.background),
      additional_info: JSON.parse(application.additional_info),
      documents: JSON.parse(application.documents)
    };
  },
  
  /**
   * Get all technician applications
   * @returns {Promise<Array>} Array of applications
   */
  async getAll() {
    const db = await getDatabase();
    
    const applications = await db.all(`
      SELECT * FROM technician_applications 
      ORDER BY submitted_at DESC
    `);
    
    // Parse JSON fields
    return applications.map(application => ({
      ...application,
      personal_info: JSON.parse(application.personal_info),
      professional_info: JSON.parse(application.professional_info),
      background: JSON.parse(application.background),
      additional_info: JSON.parse(application.additional_info),
      documents: JSON.parse(application.documents)
    }));
  },
  
  /**
   * Get a technician application by ID
   * @param {number} applicationId - The application ID
   * @returns {Promise<Object>} The application
   */
  async getById(applicationId) {
    const db = await getDatabase();
    
    const application = await db.get(
      `SELECT * FROM technician_applications WHERE application_id = ?`,
      [applicationId]
    );
    
    if (!application) {
      return null;
    }
    
    // Parse JSON fields
    return {
      ...application,
      personal_info: JSON.parse(application.personal_info),
      professional_info: JSON.parse(application.professional_info),
      background: JSON.parse(application.background),
      additional_info: JSON.parse(application.additional_info),
      documents: JSON.parse(application.documents)
    };
  },
  
  /**
   * Update application status
   * @param {number} applicationId - The application ID
   * @param {string} status - The new status
   * @param {string} notes - Optional notes about the status change
   * @returns {Promise<Object>} The updated application
   */
  async updateStatus(applicationId, status, notes = '') {
    const db = await getDatabase();
    
    // Check if application exists
    const existingApplication = await this.getById(applicationId);
    if (!existingApplication) {
      return null;
    }
    
    // Update status
    await db.run(
      `UPDATE technician_applications SET 
       status = ?, 
       admin_notes = ?, 
       updated_at = CURRENT_TIMESTAMP 
       WHERE application_id = ?`,
      [status, notes, applicationId]
    );
    
    // If approved, create a new technician record
    if (status === 'approved') {
      await this.createTechnicianFromApplication(applicationId);
    }
    
    // Return updated application
    return this.getById(applicationId);
  },
  
  /**
   * Create a new technician from an approved application
   * @param {number} applicationId - The application ID
   * @returns {Promise<number>} The created technician ID
   */
  async createTechnicianFromApplication(applicationId) {
    const db = await getDatabase();
    
    // Get application data
    const application = await this.getById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }
    
    // Extract data from application
    const { personal_info, professional_info } = application;
    
    // Build skills array from professional info
    const skills = [];
    if (professional_info.specialization) {
      skills.push(professional_info.specialization);
    }
    
    // Convert certifications text to array
    let certifications = [];
    if (professional_info.certifications) {
      // Split by newlines or commas
      certifications = professional_info.certifications.split(/[\n,]+/).filter(Boolean).map(cert => cert.trim());
    }
    
    // Create technician
    const result = await db.run(
      `INSERT INTO technicians 
       (full_name, email, phone, skills, certifications, location, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        personal_info.fullName,
        personal_info.email,
        personal_info.phone,
        JSON.stringify(skills),
        JSON.stringify(certifications),
        JSON.stringify({ city: personal_info.location }),
        'active'
      ]
    );
    
    // Update application with technician ID
    await db.run(
      `UPDATE technician_applications SET 
       technician_id = ?, 
       updated_at = CURRENT_TIMESTAMP 
       WHERE application_id = ?`,
      [result.lastID, applicationId]
    );
    
    return result.lastID;
  }
}; 