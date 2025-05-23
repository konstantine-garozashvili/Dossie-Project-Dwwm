import { getDatabase } from '../db/init-db.js';
import bcrypt from 'bcryptjs';

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
    const db = getDatabase();
    
    // Convert complex objects to JSON strings
    const personalInfo = JSON.stringify(applicationData.personalInfo || {});
    const professionalInfo = JSON.stringify(applicationData.professionalInfo || {});
    const background = JSON.stringify(applicationData.background || {});
    const additionalInfo = JSON.stringify(applicationData.additionalInfo || {});
    const documents = JSON.stringify(applicationData.documents || {});
    
    // Insert application into database
    const stmt = db.prepare(
      `INSERT INTO technician_applications 
       (personal_info, professional_info, background, additional_info, documents, status, submitted_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    
    const result = stmt.run(
      personalInfo,
      professionalInfo,
      background,
      additionalInfo,
      documents,
      applicationData.status || 'pending',
      applicationData.submittedAt || new Date().toISOString()
    );
    
    // Get the created application
    const getStmt = db.prepare(
      `SELECT * FROM technician_applications WHERE application_id = ?`
    );
    const application = getStmt.get(result.lastInsertRowid);
    
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
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT * FROM technician_applications 
      ORDER BY submitted_at DESC
    `);
    const applications = stmt.all();
    
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
    const db = getDatabase();
    
    const stmt = db.prepare(
      `SELECT * FROM technician_applications WHERE application_id = ?`
    );
    const application = stmt.get(applicationId);
    
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
    const db = getDatabase();
    
    // Check if application exists
    const existingApplication = await this.getById(applicationId);
    if (!existingApplication) {
      return null;
    }
    
    // Update status
    const updateStmt = db.prepare(
      `UPDATE technician_applications SET 
       status = ?, 
       admin_notes = ?, 
       updated_at = CURRENT_TIMESTAMP 
       WHERE application_id = ?`
    );
    
    updateStmt.run(status, notes, applicationId);
    
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
    const db = getDatabase();
    
    // Get application data
    const application = await this.getById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }
    
    // Extract data from application
    const { personal_info, professional_info, background, additional_info } = application;
    
    // Generate a temporary password (should be sent to technician via email)
    const tempPassword = Math.random().toString(36).slice(-8);
    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(tempPassword, saltRounds);
    
    // Split full name into name and surname
    const fullNameParts = personal_info.fullName.trim().split(' ');
    const name = fullNameParts[0] || '';
    const surname = fullNameParts.slice(1).join(' ') || '';
    
    // Prepare certifications array
    let certifications = [];
    if (professional_info.certifications) {
      // Split by newlines or commas and clean up
      certifications = professional_info.certifications
        .split(/[\n,]+/)
        .filter(Boolean)
        .map(cert => cert.trim());
    }
    
    // Prepare skills array
    let skills = [];
    if (additional_info.skills) {
      skills = additional_info.skills
        .split(/[\n,]+/)
        .filter(Boolean)
        .map(skill => skill.trim());
    }
    
    // Add specialization to skills if not already included
    if (professional_info.specialization && !skills.includes(professional_info.specialization)) {
      skills.unshift(professional_info.specialization);
    }
    
    // Prepare languages array
    let languages = [];
    if (additional_info.languages) {
      languages = additional_info.languages
        .split(/[\n,]+/)
        .filter(Boolean)
        .map(lang => lang.trim());
    }
    
    // Create location object
    const location = {
      address: personal_info.location,
      city: personal_info.location, // For now, use the same value
      postalCode: '', // Could be extracted from address if needed
      coordinates: null // Could be geocoded later
    };
    
    // Create technician
    const insertStmt = db.prepare(
      `INSERT INTO technicians (
        name, surname, email, password_hash, phone_number, specialization,
        years_experience, certifications, education, work_history, skills,
        languages, transport_available, location, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    
    const result = insertStmt.run(
      name,
      surname,
      personal_info.email,
      hashedPassword,
      personal_info.phone,
      professional_info.specialization,
      parseInt(professional_info.yearsExperience) || 0,
      JSON.stringify(certifications),
      background.education || '',
      background.workHistory || '',
      JSON.stringify(skills),
      JSON.stringify(languages),
      additional_info.transportAvailable ? 1 : 0,
      JSON.stringify(location),
      'active'
    );
    
    const technicianId = result.lastInsertRowid;
    
    // Update application with technician ID
    const updateAppStmt = db.prepare(
      `UPDATE technician_applications SET 
       technician_id = ?, 
       updated_at = CURRENT_TIMESTAMP 
       WHERE application_id = ?`
    );
    
    updateAppStmt.run(technicianId, applicationId);
    
    console.log(`Created technician account for ${personal_info.email} with temporary password: ${tempPassword}`);
    console.log('TODO: Send email with login credentials to the technician');
    
    return technicianId;
  },
  
  /**
   * Delete a technician application
   * @param {number} applicationId - The application ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(applicationId) {
    const db = getDatabase();
    
    const stmt = db.prepare(
      `DELETE FROM technician_applications WHERE application_id = ?`
    );
    
    const result = stmt.run(applicationId);
    return result.changes > 0;
  },
  
  /**
   * Get applications by status
   * @param {string} status - The status to filter by
   * @returns {Promise<Array>} Array of applications with the specified status
   */
  async getByStatus(status) {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT * FROM technician_applications 
      WHERE status = ?
      ORDER BY submitted_at DESC
    `);
    const applications = stmt.all(status);
    
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
   * Get application statistics
   * @returns {Promise<Object>} Statistics about applications
   */
  async getStatistics() {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT 
        status,
        COUNT(*) as count
      FROM technician_applications 
      GROUP BY status
    `);
    
    const results = stmt.all();
    
    const stats = {
      total: 0,
      pending: 0,
      reviewing: 0,
      approved: 0,
      rejected: 0
    };
    
    results.forEach(row => {
      stats[row.status] = row.count;
      stats.total += row.count;
    });
    
    return stats;
  }
}; 