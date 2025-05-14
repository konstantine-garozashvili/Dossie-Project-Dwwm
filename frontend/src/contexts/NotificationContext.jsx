import React, { createContext, useContext, useState, useEffect } from 'react';
import { requestNotificationPermission, registerDeviceToken, unregisterDeviceToken, onMessageListener } from '../lib/firebase';

/**
 * NotificationContext provides a centralized way to manage notifications across the application
 * It handles:
 * - Notification permissions
 * - Device token registration
 * - Notification storage and management
 * - Real-time notification updates
 */
const NotificationContext = createContext();

/**
 * NotificationProvider component that wraps the application to provide notification functionality
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [deviceToken, setDeviceToken] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Initialize notifications for a user
   * @param {string} userId - The user ID
   * @param {string} userType - The user type ('client', 'technician', 'admin')
   */
  const initializeNotifications = async (userId, userType) => {
    if (!userId || !userType) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Request notification permission and get device token
      const token = await requestNotificationPermission(userId, userType);
      
      if (token) {
        setDeviceToken(token);
        setPermissionStatus('granted');
      } else {
        setPermissionStatus('denied');
      }
      
      // Fetch existing notifications
      await fetchNotifications(userId, userType);
      
      // Set up real-time notification listener
      const unsubscribe = onMessageListener((payload) => {
        handleNewNotification(payload);
      });
      
      return unsubscribe;
    } catch (err) {
      console.error('Error initializing notifications:', err);
      setError('Erreur lors de l\'initialisation des notifications');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch notifications from the backend
   * @param {string} userId - The user ID
   * @param {string} userType - The user type
   */
  const fetchNotifications = async (userId, userType) => {
    if (!userId || !userType) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/history?userId=${userId}&userType=${userType}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des notifications');
      }

      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data || []);
        updateUnreadCount(data.data || []);
      } else {
        setError(data.message || 'Erreur lors de la récupération des notifications');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle a new notification received from Firebase
   * @param {Object} payload - The notification payload
   */
  const handleNewNotification = (payload) => {
    const notification = {
      id: payload.data.notificationId || `notification-${Date.now()}`,
      title: payload.notification.title,
      body: payload.notification.body,
      type: payload.data.type || 'general',
      created_at: new Date().toISOString(),
      read: false,
      data: payload.data
    };

    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);
    updateUnreadCount([notification, ...notifications]);

    // Show browser notification if app is in background
    if (document.visibilityState === 'hidden' && Notification.permission === 'granted') {
      const notificationOptions = {
        body: notification.body,
        icon: '/logo.png', // Path to your app logo
        badge: '/badge.png', // Path to your notification badge
        data: payload.data
      };

      new Notification(notification.title, notificationOptions);
    }
  };

  /**
   * Mark a notification as read
   * @param {string} notificationId - The notification ID
   * @param {string} userId - The user ID
   * @param {string} userType - The user type
   */
  const markAsRead = async (notificationId, userId, userType) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, userType }),
      });

      if (response.ok) {
        // Update the local state to mark the notification as read
        const updatedNotifications = notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        );
        
        setNotifications(updatedNotifications);
        updateUnreadCount(updatedNotifications);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  /**
   * Mark all notifications as read
   * @param {string} userId - The user ID
   * @param {string} userType - The user type
   */
  const markAllAsRead = async (userId, userType) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, userType }),
      });

      if (response.ok) {
        // Update all notifications to read
        const updatedNotifications = notifications.map(notification => ({
          ...notification,
          read: true
        }));
        
        setNotifications(updatedNotifications);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  /**
   * Update the unread notification count
   * @param {Array} notificationsList - The list of notifications
   */
  const updateUnreadCount = (notificationsList) => {
    const count = notificationsList.filter(notification => !notification.read).length;
    setUnreadCount(count);
  };

  /**
   * Clear notification context on logout
   */
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    setDeviceToken(null);
    setPermissionStatus('default');
  };

  // Context value
  const value = {
    notifications,
    unreadCount,
    deviceToken,
    permissionStatus,
    loading,
    error,
    initializeNotifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Custom hook to use the notification context
 * @returns {Object} The notification context
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};