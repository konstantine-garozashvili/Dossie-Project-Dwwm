import 'dotenv/config';
import { Hono } from 'hono';

const app = new Hono();

const port = process.env.PORT || 8000;
const dbPath = process.env.DATABASE_URL || './mydb.db';

app.get('/', (c) => c.text('DWWM Computer Shop API'));

app.get('/env-test', (c) => c.json({ port, dbPath }));

app.fire({ port }); 