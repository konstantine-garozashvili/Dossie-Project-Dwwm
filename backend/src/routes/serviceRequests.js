import { Hono } from 'hono';
const serviceRequests = new Hono();

serviceRequests.get('/', (c) => c.text('Service Requests route works!'));

export default serviceRequests; 