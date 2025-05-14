import React, { useEffect, useState } from 'react';
import { useToast } from '../ui/use-toast';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

/**
 * NotificationSystem component for handling Firebase Cloud Messaging
 * This component should be placed near the root of your application
 */
const NotificationSystem = ({ userId, userType }) => {
  const { toast } = useToast();
  const [deviceToken, setDeviceToken] = useState(null);

  // Firebase configuration - should be loaded from environment variables in production
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  useEffect(() => {
    // Only initialize if user is logged in
    if (!userId || !userType) return;

    let messaging = null;

    const initializeFirebase = async () => {
      try {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        messaging = getMessaging(app);

        // Request permission and get token
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          
          // Get device token
          const currentToken = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          });

          if (currentToken) {
            setDeviceToken(currentToken);
            registerDeviceToken(currentToken);
          } else {
            console.log('No registration token available.');
          }

          // Set up message handler
          onMessage(messaging, (payload) => {
            console.log('Message received:', payload);
            handleNotification(payload);
          });
        } else {
          console.log('Unable to get permission to notify.');
        }
      } catch (error) {
        console.error('Error initializing Firebase:', error);
      }
    };

    initializeFirebase();

    // Cleanup function
    return () => {
      if (deviceToken) {
        unregisterDeviceToken(deviceToken);
      }
    };
  }, [userId, userType]);

  /**
   * Register device token with backend
   * @param {string} token - Firebase device token
   */
  const registerDeviceToken = async (token) => {
    try {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          userId,
          userType,
          deviceInfo: JSON.stringify(deviceInfo),
        }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error('Failed to register device token:', data.message);
      }
    } catch (error) {
      console.error('Error registering device token:', error);
    }
  };

  /**
   * Unregister device token from backend
   * @param {string} token - Firebase device token
   */
  const unregisterDeviceToken = async (token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/unregister`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error('Failed to unregister device token:', data.message);
      }
    } catch (error) {
      console.error('Error unregistering device token:', error);
    }
  };

  /**
   * Handle incoming notification
   * @param {object} payload - Notification payload from Firebase
   */
  const handleNotification = (payload) => {
    const { notification, data } = payload;

    // Display toast notification
    toast({
      title: notification?.title || 'Nouvelle notification',
      description: notification?.body || '',
      variant: 'default',
    });

    // Handle different notification types
    if (data?.type) {
      switch (data.type) {
        case 'service_update':
          // Navigate to service request details or update UI
          break;
        case 'new_service_request':
          // Alert technicians about new service request
          break;
        case 'application_status':
          // Update application status in UI
          break;
        default:
          // Handle other notification types
          break;
      }
    }
  };

  // This component doesn't render anything visible
  return null;
};

export default NotificationSystem;