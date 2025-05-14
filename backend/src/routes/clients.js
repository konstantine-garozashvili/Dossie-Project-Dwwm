import { Hono } from 'hono';
const clients = new Hono();

clients.get('/', (c) => c.text('Clients route works!'));

export default clients; 