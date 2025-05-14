/**
 * Firebase Admin SDK service for sending notifications
 */

// Note: This is a template file. You'll need to:
// 1. Install firebase-admin package
// 2. Create a Firebase project and download the service account key
// 3. Place the service account key in the config directory

import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name using ES modules approach
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the service account key file
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
  path.join(__dirname, '../../config/firebase-service-account.json');

// Check if the service account file exists
let firebaseInitialized = false;
let messaging = null;

/**
 * Initialize Firebase Admin SDK
 * @returns {boolean} Whether initialization was successful
 */
export function initializeFirebaseAdmin() {
  try {
    // Check if the service account file exists
    if (!fs.existsSync(serviceAccountPath)) {
      console.warn(`Firebase service account file not found at ${serviceAccountPath}. Firebase notifications will be disabled.`);
      global.firebaseInitialized = false;
      return false;
    }

    // Initialize Firebase Admin
    const app = initializeApp({
      credential: cert(serviceAccountPath)
    });

    messaging = getMessaging(app);
    firebaseInitialized = true;
    global.firebaseInitialized = true;
    console.log('Firebase Admin SDK initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    global.firebaseInitialized = false;
    return false;
  }
}

/**
 * Send notification to a specific device
 * @param {string} token - FCM device token
 * @param {object} notification - Notification payload
 * @returns {Promise<string|null>} Message ID if successful, null otherwise
 */
export async function sendNotification(token, notification) {
  if (!firebaseInitialized || !messaging) {
    console.warn('Firebase Admin SDK not initialized. Cannot send notification.');
    return null;
  }

  try {
    const message = {
      token,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {}
    };
    
    const response = await messaging.send(message);
    console.log('Successfully sent notification:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
}

/**
 * Send notification to multiple devices
 * @param {string[]} tokens - Array of FCM device tokens
 * @param {object} notification - Notification payload
 * @returns {Promise<object|null>} Response object if successful, null otherwise
 */
export async function sendMulticastNotification(tokens, notification) {
  if (!firebaseInitialized || !messaging) {
    console.warn('Firebase Admin SDK not initialized. Cannot send multicast notification.');
    return null;
  }

  if (!tokens || tokens.length === 0) {
    console.warn('No tokens provided for multicast notification.');
    return null;
  }

  try {
    const message = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {}
    };
    
    const response = await messaging.sendMulticast(message);
    console.log(`${response.successCount} notifications sent successfully out of ${tokens.length}`);
    
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      console.error('List of tokens that caused failures:', failedTokens);
    }
    
    return response;
  } catch (error) {
    console.error('Error sending multicast notification:', error);
    return null;
  }
}