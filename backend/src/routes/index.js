import { Hono } from 'hono';
import auth from './auth.js';
import clients from './clients.js';
import serviceRequests from './serviceRequests.js';
import technicians from './technicians.js';
import notifications from './notifications.js';
import admin from './admin.js';

const api = new Hono();

api.route('/auth', auth);
api.route('/clients', clients);
api.route('/service-requests', serviceRequests);
api.route('/technicians', technicians);
api.route('/notifications', notifications);
api.route('/admin', admin);

export default api; 