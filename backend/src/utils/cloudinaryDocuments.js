import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a document to Cloudinary in the it13_docs folder
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - Original file name
 * @param {string} documentType - Type of document (cv, diploma, motivation_letter)
 * @param {string} applicantId - Unique identifier for the applicant
 * @returns {Promise<Object>} - Cloudinary upload response
 */
export const uploadDocument = async (fileBuffer, fileName, documentType, applicantId) => {
  if (!fileBuffer) {
    throw new Error('File buffer is required for upload.');
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Cloudinary credentials are not configured. Please check your .env file.');
    throw new Error('Cloudinary credentials are not configured.');
  }

  try {
    // Generate a unique public ID
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const publicId = `${applicantId}_${documentType}_${timestamp}_${sanitizedFileName}`;

    // Determine resource type based on file extension
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    let resourceType = 'auto';
    
    if (['pdf', 'doc', 'docx'].includes(fileExtension)) {
      resourceType = 'raw'; // For documents
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      resourceType = 'image'; // For images
    }

    const uploadOptions = {
      resource_type: resourceType,
      folder: 'it13_docs', // Store in it13_docs folder
      public_id: publicId,
      overwrite: true,
      use_filename: false, // Use our custom public_id instead
      unique_filename: false,
      // Add tags for easier management
      tags: ['technician_application', documentType, applicantId],
      // Add context for metadata
      context: {
        document_type: documentType,
        applicant_id: applicantId,
        upload_date: new Date().toISOString()
      }
    };

    // Convert buffer to base64 for upload
    const base64Data = `data:application/octet-stream;base64,${fileBuffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64Data, uploadOptions);
    
    console.log(`Document uploaded successfully: ${result.public_id}`);
    
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      resource_type: result.resource_type,
      format: result.format,
      bytes: result.bytes,
      created_at: result.created_at
    };
  } catch (error) {
    console.error('Error uploading document to Cloudinary:', error);
    throw error;
  }
};

/**
 * Uploads multiple documents (like diplomas) to Cloudinary
 * @param {Array} files - Array of file objects with buffer and name
 * @param {string} documentType - Type of document
 * @param {string} applicantId - Unique identifier for the applicant
 * @returns {Promise<Array>} - Array of Cloudinary upload responses
 */
export const uploadMultipleDocuments = async (files, documentType, applicantId) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return [];
  }

  const uploadPromises = files.map((file, index) => {
    const indexedDocumentType = `${documentType}_${index + 1}`;
    return uploadDocument(file.buffer, file.name, indexedDocumentType, applicantId);
  });

  try {
    const results = await Promise.all(uploadPromises);
    console.log(`Successfully uploaded ${results.length} documents of type ${documentType}`);
    return results;
  } catch (error) {
    console.error(`Error uploading multiple documents of type ${documentType}:`, error);
    throw error;
  }
};

/**
 * Deletes a document from Cloudinary
 * @param {string} publicId - The public ID of the document to delete
 * @returns {Promise<Object>} - Cloudinary deletion response
 */
export const deleteDocument = async (publicId) => {
  if (!publicId) {
    throw new Error('Public ID is required for deletion.');
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Cloudinary credentials are not configured. Please check your .env file.');
    throw new Error('Cloudinary credentials are not configured.');
  }

  try {
    // Determine resource type from public_id or try both
    let result;
    
    try {
      // Try as raw resource first (for documents)
      result = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      if (result.result === 'ok') {
        return result;
      }
    } catch (error) {
      console.log('Not found as raw resource, trying as image...');
    }

    try {
      // Try as image resource
      result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      if (result.result === 'ok') {
        return result;
      }
    } catch (error) {
      console.log('Not found as image resource, trying auto...');
    }

    // Try with auto resource type
    result = await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
    
    console.log(`Document deletion result: ${result.result} for ${publicId}`);
    return result;
  } catch (error) {
    console.error('Error deleting document from Cloudinary:', error);
    throw error;
  }
};

/**
 * Deletes multiple documents from Cloudinary
 * @param {Array} publicIds - Array of public IDs to delete
 * @returns {Promise<Array>} - Array of deletion results
 */
export const deleteMultipleDocuments = async (publicIds) => {
  if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
    return [];
  }

  const deletePromises = publicIds.map(publicId => deleteDocument(publicId));

  try {
    const results = await Promise.all(deletePromises);
    console.log(`Successfully processed deletion of ${results.length} documents`);
    return results;
  } catch (error) {
    console.error('Error deleting multiple documents:', error);
    throw error;
  }
};

/**
 * Gets document information from Cloudinary
 * @param {string} publicId - The public ID of the document
 * @returns {Promise<Object>} - Document information
 */
export const getDocumentInfo = async (publicId) => {
  if (!publicId) {
    throw new Error('Public ID is required.');
  }

  try {
    // Try to get resource info
    const result = await cloudinary.api.resource(publicId, { resource_type: 'raw' });
    return result;
  } catch (error) {
    // If not found as raw, try as image
    try {
      const result = await cloudinary.api.resource(publicId, { resource_type: 'image' });
      return result;
    } catch (imageError) {
      console.error('Error getting document info from Cloudinary:', error);
      throw error;
    }
  }
};

/**
 * Lists all documents in the it13_docs folder
 * @param {Object} options - Options for listing (max_results, next_cursor, etc.)
 * @returns {Promise<Object>} - List of documents
 */
export const listDocuments = async (options = {}) => {
  try {
    const defaultOptions = {
      type: 'upload',
      prefix: 'it13_docs/',
      max_results: 100,
      ...options
    };

    const result = await cloudinary.api.resources(defaultOptions);
    return result;
  } catch (error) {
    console.error('Error listing documents from Cloudinary:', error);
    throw error;
  }
};

console.log('Loaded backend/src/utils/cloudinaryDocuments.js - Document upload utilities configured.'); 