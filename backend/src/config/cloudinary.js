import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'default',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true
});

/**
 * Upload an image to Cloudinary
 * @param {string} imagePath - Path to the image file or base64 data URI
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Cloudinary upload response
 */
export const uploadImage = async (imagePath, options = {}) => {
  const defaultOptions = {
    folder: 'it13_profile',
    use_filename: false,
    unique_filename: true,
    overwrite: true,
    transformation: [
      { width: 250, height: 250, gravity: "faces", crop: "fill" }
    ]
  };
  
  try {
    const result = await cloudinary.uploader.upload(
      imagePath, 
      { ...defaultOptions, ...options }
    );
    return result;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<Object>} - Cloudinary deletion response
 */
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export default cloudinary; 