import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { getDatabase, initializeDatabase } from './db/init-db.js'; // Updated import
import apiRouter from './routes/index.js';
import adminRouter from './routes/admin.js'; // Import admin router

// Initialize the Hono app
const app = new Hono();

// Configuration
const port = process.env.PORT || 8000;

// Middleware
app.use('*', logger());
app.use('*', cors());

// Initialize database and get connection
let db;
(async () => {
  try {
    initializeDatabase(); // Initialize DB (creates tables, seeds admin)
    db = getDatabase(); // Get the connection instance
    console.log('Database initialized and connection established successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
})();

// Basic routes
app.get('/', (c) => c.text('IT13 - Service de réparation informatique'));

app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: db ? 'connected' : 'disconnected'
  });
});

// Mount API routes
app.route('/api', apiRouter);
app.route('/api/admin', adminRouter); // Mount admin routes

// Start the server
serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
  console.log(`API available at http://localhost:${info.port}/api`);
});