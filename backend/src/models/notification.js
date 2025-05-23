import { getDatabase } from '../db/init-db.js';

/**
 * Notification model for handling database operations related to notifications
 */
export const NotificationModel = {
  /**
   * Create a new notification
   * @param {Object} notificationData - The notification data
   * @returns {Promise<Object>} The created notification
   */
  async create(notificationData) {
    const db = getDatabase();
    
    const {
      type,
      title,
      message,
      data = null,
      priority = 'normal',
      recipientType,
      recipientId = null,
      relatedEntityType = null,
      relatedEntityId = null
    } = notificationData;
    
    const stmt = db.prepare(`
      INSERT INTO notifications (
        type, title, message, data, priority, recipient_type, recipient_id,
        related_entity_type, related_entity_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      type,
      title,
      message,
      data ? JSON.stringify(data) : null,
      priority,
      recipientType,
      recipientId,
      relatedEntityType,
      relatedEntityId
    );
    
    // Get the created notification
    const getStmt = db.prepare('SELECT * FROM notifications WHERE id = ?');
    const notification = getStmt.get(result.lastInsertRowid);
    
    return {
      ...notification,
      data: notification.data ? JSON.parse(notification.data) : null
    };
  },

  /**
   * Get notifications for a specific recipient
   * @param {string} recipientType - 'admin' or 'technician'
   * @param {number|null} recipientId - Specific recipient ID or null for all
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of notifications
   */
  async getForRecipient(recipientType, recipientId = null, options = {}) {
    const db = getDatabase();
    
    const {
      limit = 50,
      offset = 0,
      unreadOnly = false,
      type = null
    } = options;
    
    let query = `
      SELECT * FROM notifications 
      WHERE recipient_type = ? 
      AND (recipient_id IS NULL OR recipient_id = ?)
    `;
    
    const params = [recipientType, recipientId];
    
    if (unreadOnly) {
      query += ' AND is_read = 0';
    }
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const stmt = db.prepare(query);
    const notifications = stmt.all(...params);
    
    return notifications.map(notification => ({
      ...notification,
      data: notification.data ? JSON.parse(notification.data) : null
    }));
  },

  /**
   * Mark notification as read
   * @param {number} notificationId - The notification ID
   * @returns {Promise<boolean>} Success status
   */
  async markAsRead(notificationId) {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      UPDATE notifications 
      SET is_read = 1, read_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    const result = stmt.run(notificationId);
    return result.changes > 0;
  },

  /**
   * Mark all notifications as read for a recipient
   * @param {string} recipientType - 'admin' or 'technician'
   * @param {number|null} recipientId - Specific recipient ID or null for all
   * @returns {Promise<number>} Number of notifications marked as read
   */
  async markAllAsRead(recipientType, recipientId = null) {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      UPDATE notifications 
      SET is_read = 1, read_at = CURRENT_TIMESTAMP 
      WHERE recipient_type = ? 
      AND (recipient_id IS NULL OR recipient_id = ?)
      AND is_read = 0
    `);
    
    const result = stmt.run(recipientType, recipientId);
    return result.changes;
  },

  /**
   * Get unread notification count
   * @param {string} recipientType - 'admin' or 'technician'
   * @param {number|null} recipientId - Specific recipient ID or null for all
   * @returns {Promise<number>} Count of unread notifications
   */
  async getUnreadCount(recipientType, recipientId = null) {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE recipient_type = ? 
      AND (recipient_id IS NULL OR recipient_id = ?)
      AND is_read = 0
    `);
    
    const result = stmt.get(recipientType, recipientId);
    return result.count;
  },

  /**
   * Delete old notifications
   * @param {number} daysOld - Delete notifications older than this many days
   * @returns {Promise<number>} Number of deleted notifications
   */
  async deleteOld(daysOld = 30) {
    const db = getDatabase();
    
    const stmt = db.prepare(`
      DELETE FROM notifications 
      WHERE created_at < datetime('now', '-' || ? || ' days')
    `);
    
    const result = stmt.run(daysOld);
    return result.changes;
  },

  /**
   * Create notification for new technician application
   * @param {Object} applicationData - The application data
   * @returns {Promise<Object>} The created notification
   */
  async createTechnicianApplicationNotification(applicationData) {
    const { personal_info, professional_info, application_id } = applicationData;
    
    // Handle both fullName and separate name/surname fields
    const applicantName = personal_info.fullName || `${personal_info.name || ''} ${personal_info.surname || ''}`.trim();
    
    return this.create({
      type: 'technician_application',
      title: 'Nouvelle candidature technicien',
      message: `${applicantName} a soumis une candidature pour ${professional_info.specialization}`,
      data: {
        applicantName: applicantName,
        applicantEmail: personal_info.email,
        specialization: professional_info.specialization,
        applicationId: application_id
      },
      priority: 'high',
      recipientType: 'admin',
      recipientId: null, // All admins
      relatedEntityType: 'technician_application',
      relatedEntityId: application_id
    });
  }
};

console.log('Loaded backend/src/models/notification.js - Notification model configured.'); 