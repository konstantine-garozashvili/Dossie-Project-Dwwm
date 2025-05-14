import { Hono } from 'hono';
const auth = new Hono();

auth.get('/', (c) => c.text('Auth route works!'));

export default auth; 