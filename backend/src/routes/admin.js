import { Hono } from 'hono';
const admin = new Hono();

admin.get('/', (c) => c.text('Admin route works!'));

export default admin; 