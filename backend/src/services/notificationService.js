/**
 * Notification service for handling Firebase notifications
 */

import { sendNotification, sendMulticastNotification } from './firebaseAdmin.js';
import { getUserDeviceTokens } from '../models/deviceToken.js';

/**
 * Send a service request status update notification
 * @param {object} db - Database connection
 * @param {object} serviceRequest - The service request object
 * @param {string} status - The new status
 * @returns {Promise<object|null>} Notification result or null
 */
export async function sendServiceStatusNotification(db, serviceRequest, status) {
  try {
    // Get client's device tokens from database
    const tokens = await getUserDeviceTokens(db, serviceRequest.client_id, 'client');
    
    if (!tokens || tokens.length === 0) {
      console.log(`No device tokens found for client ${serviceRequest.client_id}`);
      return null;
    }
    
    // Extract just the token strings from the token objects
    const tokenStrings = tokens.map(t => t.token);
    
    const statusMessages = {
      'pending': 'Votre demande de service a été reçue et est en attente de traitement.',
      'assigned': 'Un technicien a été assigné à votre demande de service.',
      'in_progress': 'Votre réparation est en cours.',
      'completed': 'Votre réparation est terminée!',
      'cancelled': 'Votre demande de service a été annulée.'
    };
    
    const notification = {
      title: 'Mise à jour de votre demande de service',
      body: statusMessages[status] || `Le statut de votre demande est maintenant: ${status}`,
      data: {
        type: 'service_update',
        serviceRequestId: serviceRequest.request_id.toString(),
        status
      }
    };
    
    return await sendMulticastNotification(tokenStrings, notification);
  } catch (error) {
    console.error('Error sending service status notification:', error);
    return null;
  }
}

/**
 * Send a new service request notification to technicians
 * @param {object} db - Database connection
 * @param {object} serviceRequest - The service request object
 * @returns {Promise<object|null>} Notification result or null
 */
export async function sendNewServiceRequestNotification(db, serviceRequest) {
  try {
    // Get all technicians' device tokens
    // In a real application, you might want to filter by technician specialties or availability
    const tokens = await db.all(
      `SELECT dt.token FROM device_tokens dt 
       JOIN technicians t ON dt.user_id = t.technician_id 
       WHERE dt.user_type = 'technician' AND t.status = 'active'`
    );
    
    if (!tokens || tokens.length === 0) {
      console.log('No technician device tokens found');
      return null;
    }
    
    // Extract just the token strings
    const tokenStrings = tokens.map(t => t.token);
    
    const notification = {
      title: 'Nouvelle demande de service',
      body: `Une nouvelle demande de service a été créée et nécessite votre attention.`,
      data: {
        type: 'new_service_request',
        serviceRequestId: serviceRequest.request_id.toString()
      }
    };
    
    return await sendMulticastNotification(tokenStrings, notification);
  } catch (error) {
    console.error('Error sending new service request notification:', error);
    return null;
  }
}

/**
 * Send a technician application status update notification
 * @param {object} db - Database connection
 * @param {object} application - The technician application object
 * @param {string} status - The new status
 * @returns {Promise<object|null>} Notification result or null
 */
export async function sendApplicationStatusNotification(db, application, status) {
  try {
    // For this notification, we need to get the applicant's contact information
    // In a real application, you would have a user account for the applicant
    // For now, we'll use a dummy token for demonstration
    
    // In a real application, you would do something like:
    // const tokens = await getUserDeviceTokens(db, application.user_id, 'applicant');
    
    // For demonstration, we'll check if there's a token registered with the email
    const email = application.personalInfo?.email;
    if (!email) {
      console.log('No email found for applicant');
      return null;
    }
    
    // Try to find a token registered with this email
    // This is just a placeholder - in a real app, you'd have a proper user account system
    const tokens = await db.all(
      `SELECT dt.token FROM device_tokens dt 
       WHERE dt.user_id = ? AND dt.user_type = 'applicant'`,
      [email] // Using email as a placeholder for user_id
    );
    
    if (!tokens || tokens.length === 0) {
      console.log(`No device tokens found for applicant with email ${email}`);
      return null;
    }
    
    // Extract just the token strings
    const tokenStrings = tokens.map(t => t.token);
    
    const statusMessages = {
      'pending': 'Votre candidature a été reçue et est en cours d\'examen.',
      'reviewing': 'Votre candidature est en cours d\'évaluation par notre équipe.',
      'approved': 'Félicitations! Votre candidature a été acceptée.',
      'rejected': 'Nous regrettons de vous informer que votre candidature n\'a pas été retenue.'
    };
    
    const notification = {
      title: 'Mise à jour de votre candidature',
      body: statusMessages[status] || `Le statut de votre candidature est maintenant: ${status}`,
      data: {
        type: 'application_status',
        applicationId: application.application_id.toString(),
        status
      }
    };
    
    return await sendMulticastNotification(tokenStrings, notification);
  } catch (error) {
    console.error('Error sending application status notification:', error);
    return null;
  }
}

/**
 * Send a notification to a specific user
 * @param {object} db - Database connection
 * @param {number} userId - The user ID
 * @param {string} userType - The user type ('client', 'technician', 'admin')
 * @param {object} notification - The notification object with title, body, and optional data
 * @returns {Promise<object|null>} Notification result or null
 */
export async function sendUserNotification(db, userId, userType, notification) {
  try {
    const tokens = await getUserDeviceTokens(db, userId, userType);
    
    if (!tokens || tokens.length === 0) {
      console.log(`No device tokens found for ${userType} ${userId}`);
      return null;
    }
    
    const tokenStrings = tokens.map(t => t.token);
    
    return await sendMulticastNotification(tokenStrings, notification);
  } catch (error) {
    console.error('Error sending user notification:', error);
    return null;
  }
}

/**
 * Send a message notification between client and technician
 * @param {object} db - Database connection
 * @param {object} message - The message object
 * @param {number} recipientId - The recipient user ID
 * @param {string} recipientType - The recipient type ('client' or 'technician')
 * @param {string} senderName - The name of the sender
 * @returns {Promise<object|null>} Notification result or null
 */
export async function sendMessageNotification(db, message, recipientId, recipientType, senderName) {
  try {
    const notification = {
      title: `Nouveau message de ${senderName}`,
      body: message.content.length > 100 ? `${message.content.substring(0, 97)}...` : message.content,
      data: {
        type: 'new_message',
        messageId: message.message_id.toString(),
        serviceRequestId: message.request_id.toString(),
        senderId: message.sender_id.toString(),
        senderType: message.sender_type
      }
    };
    
    return await sendUserNotification(db, recipientId, recipientType, notification);
  } catch (error) {
    console.error('Error sending message notification:', error);
    return null;
  }
}