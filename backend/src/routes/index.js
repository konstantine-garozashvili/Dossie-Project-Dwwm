import { Hono } from 'hono';
import clientsRouter from './clients.js';
import techniciansRouter from './technicians.js';
import serviceRequestsRouter from './serviceRequests.js';
import technicianApplicationsRouter from './technicianApplications.js';

// Create the main API router
const apiRouter = new Hono();

// Register routes
apiRouter.route('/clients', clientsRouter);
apiRouter.route('/technicians', techniciansRouter);
apiRouter.route('/service-requests', serviceRequestsRouter);
apiRouter.route('/technician-applications', technicianApplicationsRouter);

// Export the router
export default apiRouter;