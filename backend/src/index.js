import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { getDatabase, initializeDatabase } from './db/init-db.js';
import apiRouter from './routes/index.js';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';
import profileRouter from './routes/profile.js';

// Initialize the Hono app
const app = new Hono();

// Configuration
const port = process.env.PORT || 8000;
const nodeEnv = process.env.NODE_ENV || 'development';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

console.log(`Server starting in ${nodeEnv} mode`);
console.log(`Frontend URL: ${frontendUrl}`);

// CORS configuration based on environment
const corsOptions = {
  origin: nodeEnv === 'production' 
    ? [frontendUrl] // Restrict to specific domains in production
    : '*', // Allow all origins in development
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400, // 24 hours
  credentials: true,
};

// Middleware
app.use('*', logger());
app.use('*', cors(corsOptions));

// Initialize database and get connection
let db;
(async () => {
  try {
    initializeDatabase();
    db = getDatabase();
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
    database: db ? 'connected' : 'disconnected',
    environment: nodeEnv
  });
});

// Mount API routes
app.route('/api', apiRouter);
app.route('/api/admin', adminRouter);
app.route('/api/auth', authRouter);
app.route('/api/profile', profileRouter);

// Start the server
serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
  console.log(`API available at http://localhost:${info.port}/api`);
});