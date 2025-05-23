import { Hono } from 'hono';
import { NotificationModel } from '../models/notification.js';

const notificationsRouter = new Hono();

/**
 * GET /api/notifications
 * Get notifications for the current user (admin/technician)
 */
notificationsRouter.get('/', async (c) => {
  try {
    // TODO: Add authentication middleware to get user info
    // For now, assume admin user
    const recipientType = 'admin';
    const recipientId = null; // All admins
    
    const { 
      limit = 20, 
      offset = 0, 
      unreadOnly = false,
      type = null 
    } = c.req.query();
    
    const notifications = await NotificationModel.getForRecipient(
      recipientType, 
      recipientId, 
      {
        limit: parseInt(limit),
        offset: parseInt(offset),
        unreadOnly: unreadOnly === 'true',
        type: type || null
      }
    );
    
    return c.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la récupération des notifications',
      error: error.message
    }, 500);
  }
});

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
notificationsRouter.get('/unread-count', async (c) => {
  try {
    // TODO: Add authentication middleware to get user info
    const recipientType = 'admin';
    const recipientId = null; // All admins
    
    const count = await NotificationModel.getUnreadCount(recipientType, recipientId);
    
    return c.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la récupération du nombre de notifications non lues',
      error: error.message
    }, 500);
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a specific notification as read
 */
notificationsRouter.patch('/:id/read', async (c) => {
  try {
    const id = c.req.param('id');
    const notificationId = parseInt(id, 10);
    
    if (isNaN(notificationId)) {
      return c.json({
        success: false,
        message: 'ID de notification invalide'
      }, 400);
    }
    
    const success = await NotificationModel.markAsRead(notificationId);
    
    if (!success) {
      return c.json({
        success: false,
        message: 'Notification non trouvée'
      }, 404);
    }
    
    return c.json({
      success: true,
      message: 'Notification marquée comme lue'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la mise à jour de la notification',
      error: error.message
    }, 500);
  }
});

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read for the current user
 */
notificationsRouter.patch('/mark-all-read', async (c) => {
  try {
    // TODO: Add authentication middleware to get user info
    const recipientType = 'admin';
    const recipientId = null; // All admins
    
    const count = await NotificationModel.markAllAsRead(recipientType, recipientId);
    
    return c.json({
      success: true,
      message: `${count} notification(s) marquée(s) comme lue(s)`,
      data: { count }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return c.json({
      success: false,
      message: 'Erreur lors de la mise à jour des notifications',
      error: error.message
    }, 500);
  }
});

export default notificationsRouter; 