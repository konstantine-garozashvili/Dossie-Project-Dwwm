import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Recommended: use HTTPS for all asset delivery
});

/**
 * Uploads an image to Cloudinary.
 * @param {string} imageData - The base64 encoded image data string.
 * @param {object} options - Optional Cloudinary upload options.
 * @returns {Promise<object>} - The Cloudinary upload response object.
 */
export const uploadImage = async (imageData, options = {}) => {
  if (!imageData) {
    throw new Error('Image data is required for upload.');
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Cloudinary credentials are not configured. Please check your .env file.');
    throw new Error('Cloudinary credentials are not configured.');
  }

  try {
    // Default options - you can customize these
    const defaultOptions = {
      overwrite: true, // Overwrite if an image with the same public_id exists
      resource_type: 'image', // Explicitly set resource type
      folder: 'it13_profile', // Specify the folder in Cloudinary
      // Or apply transformations, e.g., to limit size or auto-format:
      // transformation: [{ width: 500, height: 500, crop: "limit" }, { quality: "auto" }]
    };

    const result = await cloudinary.uploader.upload(imageData, {
      ...defaultOptions,
      ...options,
    });
    return result; // Contains public_id, url, secure_url, etc.
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error; // Re-throw the error to be handled by the calling route
  }
};

/**
 * Deletes an image from Cloudinary.
 * @param {string} publicId - The public ID of the image to delete.
 * @returns {Promise<object>} - The Cloudinary deletion response object.
 */
export const deleteImage = async (publicId) => {
  if (!publicId) {
    throw new Error('Public ID is required for deletion.');
  }
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Cloudinary credentials are not configured. Please check your .env file.');
    throw new Error('Cloudinary credentials are not configured.');
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result; // Typically { result: 'ok' } or { result: 'not found' }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error; // Re-throw the error to be handled by the calling route
  }
};

console.log('Loaded REAL backend/src/config/cloudinary.js - Configured for Cloudinary operations.');

// Export the configured cloudinary instance if other parts of the app need direct access
export { cloudinary }; 