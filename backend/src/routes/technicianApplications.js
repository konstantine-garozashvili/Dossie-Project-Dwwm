import { Hono } from 'hono';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TechnicianApplicationModel } from '../models/technicianApplication.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '../../uploads/technicians');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const technicianApplicationsRouter = new Hono();

/**
 * POST /api/technician-applications
 * Submit a new technician application with documents
 */
technicianApplicationsRouter.post('/', async (c) => {
  try {
    const formData = await c.req.formData();
    
    // Extract JSON data
    const applicationData = JSON.parse(formData.get('data'));
    
    // Create application folder using timestamp and name
    const timestamp = Date.now();
    const applicantName = applicationData.personalInfo.fullName.replace(/\s+/g, '_').toLowerCase();
    const applicationDir = path.join(UPLOADS_DIR, `${timestamp}_${applicantName}`);
    
    if (!fs.existsSync(applicationDir)) {
      fs.mkdirSync(applicationDir, { recursive: true });
    }
    
    // Process CV (required)
    const cv = formData.get('cv');
    if (!cv) {
      return c.json({
        success: false,
        message: 'Le CV est requis'
      }, 400);
    }
    
    // Save CV file
    const cvFileName = `${timestamp}_cv${path.extname(cv.name)}`;
    const cvPath = path.join(applicationDir, cvFileName);
    const cvArrayBuffer = await cv.arrayBuffer();
    fs.writeFileSync(cvPath, Buffer.from(cvArrayBuffer));
    
    // Process diplomas (optional, multiple)
    const diplomaPaths = [];
    for (let i = 0; formData.get(`diploma_${i}`); i++) {
      const diploma = formData.get(`diploma_${i}`);
      const diplomaFileName = `${timestamp}_diploma_${i}${path.extname(diploma.name)}`;
      const diplomaPath = path.join(applicationDir, diplomaFileName);
      const diplomaArrayBuffer = await diploma.arrayBuffer();
      fs.writeFileSync(diplomaPath, Buffer.from(diplomaArrayBuffer));
      diplomaPaths.push(diplomaPath);
    }
    
    // Process motivation letter (optional)
    let motivationLetterPath = null;
    const motivationLetter = formData.get('motivationLetter');
    if (motivationLetter) {
      const motivationLetterFileName = `${timestamp}_motivation_letter${path.extname(motivationLetter.name)}`;
      motivationLetterPath = path.join(applicationDir, motivationLetterFileName);
      const motivationLetterArrayBuffer = await motivationLetter.arrayBuffer();
      fs.writeFileSync(motivationLetterPath, Buffer.from(motivationLetterArrayBuffer));
    }
    
    // Prepare application data for database
    const applicationDataForDb = {
      ...applicationData,
      documents: {
        cv: cvPath,
        diplomas: diplomaPaths,
        motivationLetter: motivationLetterPath
      },
      status: 'pending', // Initial status
      submittedAt: new Date().toISOString()
    };
    
    // Save application to database
    const application = await TechnicianApplicationModel.create(applicationDataForDb);
    
    return c.json({
      success: true,
      message: 'Candidature soumise avec succès',
      data: {
        applicationId: application.application_id,
        status: application.status
      }
    }, 201);
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
    // In a real app, check admin authentication here
    
    const applications = await TechnicianApplicationModel.getAll();
    
    return c.json({
      success: true,
      data: applications
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
    // In a real app, check admin authentication here
    
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
    // In a real app, check admin authentication here
    
    const id = c.req.param('id');
    const { status, notes } = await c.req.json();
    
    if (!['pending', 'reviewing', 'approved', 'rejected'].includes(status)) {
      return c.json({
        success: false,
        message: 'Statut invalide'
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
      message: 'Erreur lors de la mise à jour du statut de la candidature',
      error: error.message
    }, 500);
  }
});

export default technicianApplicationsRouter; 