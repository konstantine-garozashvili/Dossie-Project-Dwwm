import { getDatabase } from '../db/init-db.js';
import { validateTechnicianApplication, sanitizeApplicationData } from '../utils/validation.js';
import { hashPassword } from '../utils/validation.js';
import emailService from '../utils/emailService.js';

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
    try {
      // The data is already validated and sanitized in the route
      // applicationData structure: { personal_info, professional_info, background, additional_info, documents }
      
      const stmt = getDatabase().prepare(`
        INSERT INTO technician_applications (
          personal_info, professional_info, background, additional_info, 
          documents, status, submitted_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        JSON.stringify(applicationData.personal_info),
        JSON.stringify(applicationData.professional_info),
        JSON.stringify(applicationData.background),
        JSON.stringify(applicationData.additional_info),
        JSON.stringify(applicationData.documents),
        'pending',
        new Date().toISOString()
      );

      return {
        success: true,
        applicationId: result.lastInsertRowid,
        message: 'Candidature soumise avec succès'
      };
    } catch (error) {
      console.error('Error creating technician application:', error);
    return {
        success: false,
        message: 'Erreur lors de la création de la candidature',
        error: error.message
      };
    }
  },
  
  /**
   * Get all technician applications
   * @returns {Promise<Array>} Array of applications
   */
  async getAll() {
    try {
      const stmt = getDatabase().prepare(`
        SELECT 
          application_id,
          personal_info,
          professional_info,
          background,
          additional_info,
          documents,
          status,
          admin_notes,
          technician_id,
          submitted_at,
          updated_at
        FROM technician_applications 
      ORDER BY submitted_at DESC
    `);
    
      const applications = stmt.all();
      
      return applications.map(app => ({
        ...app,
        personal_info: JSON.parse(app.personal_info),
        professional_info: JSON.parse(app.professional_info),
        background: JSON.parse(app.background),
        additional_info: JSON.parse(app.additional_info),
        documents: JSON.parse(app.documents)
    }));
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },
  
  /**
   * Get a technician application by ID
   * @param {number} applicationId - The application ID
   * @returns {Promise<Object>} The application
   */
  async getById(applicationId) {
    try {
      const stmt = getDatabase().prepare(`
        SELECT 
          application_id,
          personal_info,
          professional_info,
          background,
          additional_info,
          documents,
          status,
          admin_notes,
          technician_id,
          submitted_at,
          updated_at
        FROM technician_applications 
        WHERE application_id = ?
      `);
      
      const application = stmt.get(applicationId);
    
    if (!application) {
      return null;
    }
    
    return {
      ...application,
      personal_info: JSON.parse(application.personal_info),
      professional_info: JSON.parse(application.professional_info),
      background: JSON.parse(application.background),
      additional_info: JSON.parse(application.additional_info),
      documents: JSON.parse(application.documents)
    };
    } catch (error) {
      console.error('Error fetching application by ID:', error);
      throw error;
    }
  },
  
  /**
   * Update application status
   * @param {number} applicationId - The application ID
   * @param {string} status - The new status
   * @param {string} notes - Optional notes about the status change
   * @returns {Promise<Object>} The updated application
   */
  async updateStatus(applicationId, status, notes = '') {
    try {
      const application = await this.getById(applicationId);
      if (!application) {
        return {
          success: false,
          message: 'Candidature non trouvée'
        };
      }

      const stmt = getDatabase().prepare(`
        UPDATE technician_applications 
        SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE application_id = ?
      `);

      stmt.run(status, notes, applicationId);
    
      // Handle approval - create technician account and send email
    if (status === 'approved') {
        const result = await this.createTechnicianFromApplication(applicationId);
        if (!result.success) {
          return result;
    }
    
        // Send approval email with temporary password
        const personalInfo = application.personal_info;
        
        // Extract name and surname from fullName
        const fullNameParts = personalInfo.fullName.trim().split(' ');
        const name = fullNameParts[0] || '';
        const surname = fullNameParts.slice(1).join(' ') || '';
        
        const emailResult = await emailService.sendTemporaryPassword(
          personalInfo.email,
          name,
          surname,
          result.temporaryPassword
        );

        if (!emailResult.success) {
          console.error('Failed to send approval email:', emailResult.error);
          // Don't fail the approval process, just log the error
        }

        return {
          success: true,
          message: 'Candidature approuvée et compte technicien créé',
          technicianId: result.technicianId,
          emailSent: emailResult.success
        };
      }

      // Handle rejection - send rejection email
      if (status === 'rejected') {
        const personalInfo = application.personal_info;
        
        // Extract name and surname from fullName
        const fullNameParts = personalInfo.fullName.trim().split(' ');
        const name = fullNameParts[0] || '';
        const surname = fullNameParts.slice(1).join(' ') || '';
        
        const emailResult = await emailService.sendApplicationRejection(
          personalInfo.email,
          name,
          surname,
          notes
        );

        if (!emailResult.success) {
          console.error('Failed to send rejection email:', emailResult.error);
        }

        return {
          success: true,
          message: 'Candidature rejetée',
          emailSent: emailResult.success
        };
      }

      return {
        success: true,
        message: 'Statut de la candidature mis à jour'
      };
    } catch (error) {
      console.error('Error updating application status:', error);
      return {
        success: false,
        message: 'Erreur lors de la mise à jour du statut',
        error: error.message
      };
    }
  },
  
  /**
   * Create a new technician from an approved application
   * @param {number} applicationId - The application ID
   * @returns {Promise<number>} The created technician ID
   */
  async createTechnicianFromApplication(applicationId) {
    try {
    const application = await this.getById(applicationId);
    if (!application) {
        return {
          success: false,
          message: 'Candidature non trouvée'
        };
    }
    
      const personalInfo = application.personal_info;
      const professionalInfo = application.professional_info;
      const backgroundInfo = application.background;
      const additionalInfo = application.additional_info;

      // Extract name and surname from fullName
      const fullNameParts = personalInfo.fullName.trim().split(' ');
      const name = fullNameParts[0] || '';
      const surname = fullNameParts.slice(1).join(' ') || '';

      // Generate temporary password
      const temporaryPassword = emailService.generateTemporaryPassword();
      const hashedPassword = await hashPassword(temporaryPassword);

      // Calculate expiration time (24 hours from now)
      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 24);

      // Create technician record
      const stmt = getDatabase().prepare(`
        INSERT INTO technicians (
          name, surname, email, password_hash, phone_number, specialization,
          years_experience, certifications, education, work_history, skills,
          languages, transport_available, location, status,
          is_temporary_password, temporary_password_expires, must_change_password
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        name,
        surname,
        personalInfo.email,
        hashedPassword,
        personalInfo.phone,
        professionalInfo.specialization,
        parseInt(professionalInfo.yearsExperience) || 0,
        JSON.stringify(professionalInfo.certifications || ''),
        backgroundInfo.education || '',
        backgroundInfo.workHistory || '',
        JSON.stringify(additionalInfo.skills || ''),
        JSON.stringify(additionalInfo.languages || ''),
        additionalInfo.transportAvailable ? 1 : 0,
        JSON.stringify({
          address: personalInfo.location || '',
          city: '',
          postalCode: ''
        }),
        'active', // Set as active since approved
        1, // is_temporary_password
        expirationTime.toISOString(),
        1  // must_change_password
      );

      const technicianId = result.lastInsertRowid;
    
      // Update application with technician_id
      const updateStmt = getDatabase().prepare(`
        UPDATE technician_applications 
        SET technician_id = ? 
        WHERE application_id = ?
      `);
      updateStmt.run(technicianId, applicationId);

      return {
        success: true,
        technicianId,
        temporaryPassword,
        message: 'Compte technicien créé avec succès'
      };
    } catch (error) {
      console.error('Error creating technician from application:', error);
      return {
        success: false,
        message: 'Erreur lors de la création du compte technicien',
        error: error.message
      };
    }
  },
  
  /**
   * Delete a technician application
   * @param {number} applicationId - The application ID
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async delete(applicationId) {
    try {
      const stmt = getDatabase().prepare('DELETE FROM technician_applications WHERE application_id = ?');
      const result = stmt.run(applicationId);
      
      return {
        success: result.changes > 0,
        message: result.changes > 0 ? 'Candidature supprimée' : 'Candidature non trouvée'
      };
    } catch (error) {
      console.error('Error deleting application:', error);
      return {
        success: false,
        message: 'Erreur lors de la suppression',
        error: error.message
      };
    }
  },
  
  /**
   * Get applications by status
   * @param {string} status - The status to filter by
   * @returns {Promise<Array>} Array of applications with the specified status
   */
  async getByStatus(status) {
    try {
      const stmt = getDatabase().prepare(`
        SELECT 
          application_id,
          personal_info,
          professional_info,
          background,
          additional_info,
          documents,
          status,
          admin_notes,
          technician_id,
          submitted_at,
          updated_at
        FROM technician_applications 
        WHERE status = ?
        ORDER BY submitted_at DESC
      `);
      
      const applications = stmt.all(status);
      
      return applications.map(app => ({
        ...app,
        personal_info: JSON.parse(app.personal_info),
        professional_info: JSON.parse(app.professional_info),
        background: JSON.parse(app.background),
        additional_info: JSON.parse(app.additional_info),
        documents: JSON.parse(app.documents)
      }));
    } catch (error) {
      console.error('Error fetching applications by status:', error);
      throw error;
    }
  },
  
  /**
   * Get application statistics
   * @returns {Promise<Object>} Statistics about applications
   */
  async getStatistics() {
    try {
      const stmt = getDatabase().prepare(`
        SELECT 
          status,
          COUNT(*) as count
        FROM technician_applications 
        GROUP BY status
      `);
      
      const stats = stmt.all();
      
      const result = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        reviewing: 0
      };
      
      stats.forEach(stat => {
        result[stat.status] = stat.count;
        result.total += stat.count;
      });
    
      return result;
    } catch (error) {
      console.error('Error fetching application statistics:', error);
      throw error;
    }
  }
}; 