import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { getDatabase } from './db/index.js';
import apiRouter from './routes/index.js';

// Initialize the Hono app
const app = new Hono();

// Configuration
const port = process.env.PORT || 8000;

// Middleware
app.use('*', logger());
app.use('*', cors());

// Initialize database connection
let db;
(async () => {
  try {
    db = await getDatabase();
    console.log('Database connection established successfully');
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

// Start the server
app.fire({ port });
console.log(`Server running on http://localhost:${port}`);
console.log(`API available at http://localhost:${port}/api`);