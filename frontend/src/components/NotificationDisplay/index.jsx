import React, { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

/**
 * NotificationDisplay component for showing a list of notifications
 * This component can be used in dashboards or notification centers
 */
const NotificationDisplay = ({ userId, userType }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications from the backend
  const fetchNotifications = async () => {
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

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
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
        setNotifications(notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        ));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Load notifications on component mount and when userId/userType changes
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling to check for new notifications every minute
    const intervalId = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(intervalId);
  }, [userId, userType]);

  // Get notification type badge color
  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'service_update':
        return 'bg-blue-500';
      case 'new_service_request':
        return 'bg-green-500';
      case 'application_status':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Format notification date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading && notifications.length === 0) {
    return <div className="p-4 text-center">Chargement des notifications...</div>;
  }

  if (error && notifications.length === 0) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (notifications.length === 0) {
    return <div className="p-4 text-center">Aucune notification</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Notifications</h2>
        <Button variant="outline" size="sm" onClick={fetchNotifications}>
          Actualiser
        </Button>
      </div>

      {notifications.map((notification) => (
        <Card 
          key={notification.id} 
          className={`p-4 ${notification.read ? 'bg-gray-50' : 'bg-white border-l-4 border-blue-500'}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className={getNotificationTypeColor(notification.type)}>
                  {notification.type === 'service_update' && 'Mise à jour'}
                  {notification.type === 'new_service_request' && 'Nouvelle demande'}
                  {notification.type === 'application_status' && 'Candidature'}
                  {!['service_update', 'new_service_request', 'application_status'].includes(notification.type) && 'Notification'}
                </Badge>
                <span className="text-sm text-gray-500">{formatDate(notification.created_at)}</span>
              </div>
              <h3 className="font-semibold">{notification.title}</h3>
              <p className="text-gray-700">{notification.body}</p>
            </div>
            {!notification.read && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => markAsRead(notification.id)}
              >
                Marquer comme lu
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default NotificationDisplay;