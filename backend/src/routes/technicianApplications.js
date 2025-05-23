import { Hono } from 'hono';
import { TechnicianApplicationModel } from '../models/technicianApplication.js';
import { uploadDocument, uploadMultipleDocuments, deleteDocument, deleteMultipleDocuments } from '../utils/cloudinaryDocuments.js';
import { validateTechnicianApplication, sanitizeApplicationData, validateDocumentFile } from '../utils/validation.js';

const technicianApplicationsRouter = new Hono();

/**
 * POST /api/technician-applications
 * Submit a new technician application with documents
 */
technicianApplicationsRouter.post('/', async (c) => {
  try {
    const formData = await c.req.formData();
    
    // Extract JSON data
    const rawApplicationData = JSON.parse(formData.get('data'));
    
    // Validate and sanitize application data
    const validation = validateTechnicianApplication(rawApplicationData);
    if (!validation.isValid) {
      return c.json({
        success: false,
        message: 'Données de candidature invalides',
        errors: validation.errors
      }, 400);
    }

    const applicationData = sanitizeApplicationData(rawApplicationData);
    
    // Generate unique applicant ID for file organization
    const timestamp = Date.now();
    const applicantName = applicationData.personalInfo.fullName.replace(/\s+/g, '_').toLowerCase();
    const applicantId = `${timestamp}_${applicantName}`;
    
    // Process CV (required)
    const cvFile = formData.get('cv');
    if (!cvFile) {
      return c.json({
        success: false,
        message: 'Le CV est requis'
      }, 400);
    }
    
    // Validate CV file
    const cvValidation = validateDocumentFile(cvFile, 'cv');
    if (!cvValidation.isValid) {
      return c.json({
        success: false,
        message: cvValidation.error
      }, 400);
    }
    
    let uploadedDocuments = {};
    let uploadedFiles = []; // Track for cleanup on error
    
    try {
      // Upload CV to Cloudinary
      console.log('Uploading CV to Cloudinary...');
      const cvBuffer = Buffer.from(await cvFile.arrayBuffer());
      const cvUploadResult = await uploadDocument(cvBuffer, cvFile.name, 'cv', applicantId);
      uploadedDocuments.cv = cvUploadResult;
      uploadedFiles.push(cvUploadResult.public_id);
      
      // Process diplomas (optional, multiple)
      const diplomaFiles = [];
      for (let i = 0; formData.get(`diploma_${i}`); i++) {
        const diplomaFile = formData.get(`diploma_${i}`);
        
        // Validate diploma file
        const diplomaValidation = validateDocumentFile(diplomaFile, 'diplomas');
        if (!diplomaValidation.isValid) {
          // Cleanup uploaded files
          await deleteMultipleDocuments(uploadedFiles);
          return c.json({
            success: false,
            message: `Erreur diplôme ${i + 1}: ${diplomaValidation.error}`
          }, 400);
        }
        
        const diplomaBuffer = Buffer.from(await diplomaFile.arrayBuffer());
        diplomaFiles.push({
          buffer: diplomaBuffer,
          name: diplomaFile.name
        });
      }
      
      // Upload diplomas to Cloudinary
      if (diplomaFiles.length > 0) {
        console.log(`Uploading ${diplomaFiles.length} diploma(s) to Cloudinary...`);
        const diplomaUploadResults = await uploadMultipleDocuments(diplomaFiles, 'diploma', applicantId);
        uploadedDocuments.diplomas = diplomaUploadResults;
        uploadedFiles.push(...diplomaUploadResults.map(result => result.public_id));
      } else {
        uploadedDocuments.diplomas = [];
      }
      
      // Process motivation letter (optional)
      const motivationLetterFile = formData.get('motivationLetter');
      if (motivationLetterFile) {
        // Validate motivation letter file
        const motivationValidation = validateDocumentFile(motivationLetterFile, 'motivationLetter');
        if (!motivationValidation.isValid) {
          // Cleanup uploaded files
          await deleteMultipleDocuments(uploadedFiles);
          return c.json({
            success: false,
            message: `Erreur lettre de motivation: ${motivationValidation.error}`
          }, 400);
        }
        
        console.log('Uploading motivation letter to Cloudinary...');
        const motivationBuffer = Buffer.from(await motivationLetterFile.arrayBuffer());
        const motivationUploadResult = await uploadDocument(motivationBuffer, motivationLetterFile.name, 'motivation_letter', applicantId);
        uploadedDocuments.motivationLetter = motivationUploadResult;
        uploadedFiles.push(motivationUploadResult.public_id);
      } else {
        uploadedDocuments.motivationLetter = null;
      }
      
      // Prepare application data for database
      const applicationDataForDb = {
        ...applicationData,
        documents: uploadedDocuments,
        applicantId: applicantId,
        status: 'pending', // Initial status
        submittedAt: new Date().toISOString()
      };
      
      // Save application to database
      console.log('Saving application to database...');
      const application = await TechnicianApplicationModel.create(applicationDataForDb);
      
      console.log(`Application created successfully with ID: ${application.application_id}`);
      
      return c.json({
        success: true,
        message: 'Candidature soumise avec succès',
        data: {
          applicationId: application.application_id,
          applicantId: applicantId,
          status: application.status,
          documentsUploaded: {
            cv: !!uploadedDocuments.cv,
            diplomas: uploadedDocuments.diplomas.length,
            motivationLetter: !!uploadedDocuments.motivationLetter
          }
        }
      }, 201);
      
    } catch (uploadError) {
      console.error('Error during file upload or database save:', uploadError);
      
      // Cleanup any uploaded files
      if (uploadedFiles.length > 0) {
        try {
          await deleteMultipleDocuments(uploadedFiles);
          console.log('Cleaned up uploaded files after error');
        } catch (cleanupError) {
          console.error('Error cleaning up files:', cleanupError);
        }
      }
      
      throw uploadError;
    }
    
  } catch (error) {
    console.error('Error submitting technician application:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la soumission de la candidature',
      error: error.message
    }, 500);
  }
});

/**
 * GET /api/technician-applications
 * Get all technician applications (admin only)
 */
technicianApplicationsRouter.get('/', async (c) => {
  try {
    // TODO: Add admin authentication middleware
    
    const applications = await TechnicianApplicationModel.getAll();
    
    return c.json({
      success: true,
      data: applications,
      count: applications.length
    });
  } catch (error) {
    console.error('Error fetching technician applications:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la récupération des candidatures',
      error: error.message
    }, 500);
  }
});

/**
 * GET /api/technician-applications/:id
 * Get a technician application by ID (admin only)
 */
technicianApplicationsRouter.get('/:id', async (c) => {
  try {
    // TODO: Add admin authentication middleware
    
    const id = c.req.param('id');
    const application = await TechnicianApplicationModel.getById(parseInt(id, 10));
    
    if (!application) {
      return c.json({
        success: false,
        message: 'Candidature non trouvée'
      }, 404);
    }
    
    return c.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error(`Error fetching technician application ${c.req.param('id')}:`, error);
    return c.json({
      success: false,
      message: 'Erreur lors de la récupération de la candidature',
      error: error.message
    }, 500);
  }
});

/**
 * PATCH /api/technician-applications/:id/status
 * Update application status (admin only)
 */
technicianApplicationsRouter.patch('/:id/status', async (c) => {
  try {
    // TODO: Add admin authentication middleware
    
    const id = c.req.param('id');
    const { status, notes } = await c.req.json();
    
    if (!['pending', 'reviewing', 'approved', 'rejected'].includes(status)) {
      return c.json({
        success: false,
        message: 'Statut invalide. Statuts autorisés: pending, reviewing, approved, rejected'
      }, 400);
    }
    
    const updatedApplication = await TechnicianApplicationModel.updateStatus(
      parseInt(id, 10),
      status,
      notes
    );
    
    if (!updatedApplication) {
      return c.json({
        success: false,
        message: 'Candidature non trouvée'
      }, 404);
    }
    
    return c.json({
      success: true,
      message: 'Statut de la candidature mis à jour avec succès',
      data: updatedApplication
    });
  } catch (error) {
    console.error(`Error updating technician application ${c.req.param('id')}:`, error);
    return c.json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut',
      error: error.message
    }, 500);
  }
});

/**
 * POST /api/technician-applications/:id/approve
 * Approve application and create technician account (admin only)
 */
technicianApplicationsRouter.post('/:id/approve', async (c) => {
  try {
    // TODO: Add admin authentication middleware
    
    const id = c.req.param('id');
    const { notes } = await c.req.json();
    
    // Update status to approved (this will also create the technician)
    const updatedApplication = await TechnicianApplicationModel.updateStatus(
      parseInt(id, 10),
      'approved',
      notes || 'Candidature approuvée et compte technicien créé'
    );
    
    if (!updatedApplication) {
      return c.json({
        success: false,
        message: 'Candidature non trouvée'
      }, 404);
    }
    
    return c.json({
      success: true,
      message: 'Candidature approuvée et compte technicien créé avec succès',
      data: {
        application: updatedApplication,
        technicianId: updatedApplication.technician_id
      }
    });
  } catch (error) {
    console.error(`Error approving technician application ${c.req.param('id')}:`, error);
    return c.json({
      success: false,
      message: 'Erreur lors de l\'approbation de la candidature',
      error: error.message
    }, 500);
  }
});

/**
 * DELETE /api/technician-applications/:id
 * Delete application and associated documents (admin only)
 */
technicianApplicationsRouter.delete('/:id', async (c) => {
  try {
    // TODO: Add admin authentication middleware
    
    const id = c.req.param('id');
    
    // Get application to retrieve document URLs for cleanup
    const application = await TechnicianApplicationModel.getById(parseInt(id, 10));
    
    if (!application) {
      return c.json({
        success: false,
        message: 'Candidature non trouvée'
      }, 404);
    }
    
    // Extract document public IDs for deletion
    const documentsToDelete = [];
    if (application.documents.cv?.public_id) {
      documentsToDelete.push(application.documents.cv.public_id);
    }
    if (application.documents.diplomas?.length > 0) {
      documentsToDelete.push(...application.documents.diplomas.map(doc => doc.public_id));
    }
    if (application.documents.motivationLetter?.public_id) {
      documentsToDelete.push(application.documents.motivationLetter.public_id);
    }
    
    // Delete documents from Cloudinary
    if (documentsToDelete.length > 0) {
      try {
        await deleteMultipleDocuments(documentsToDelete);
        console.log(`Deleted ${documentsToDelete.length} documents from Cloudinary`);
      } catch (cloudinaryError) {
        console.error('Error deleting documents from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary cleanup fails
      }
    }
    
    // Delete application from database
    await TechnicianApplicationModel.delete(parseInt(id, 10));
    
    return c.json({
      success: true,
      message: 'Candidature et documents associés supprimés avec succès'
    });
  } catch (error) {
    console.error(`Error deleting technician application ${c.req.param('id')}:`, error);
    return c.json({
      success: false,
      message: 'Erreur lors de la suppression de la candidature',
      error: error.message
    }, 500);
  }
});

export default technicianApplicationsRouter; 