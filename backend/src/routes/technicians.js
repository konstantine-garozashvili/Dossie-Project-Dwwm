import { Hono } from 'hono';
const technicians = new Hono();

technicians.get('/', (c) => c.text('Technicians route works!'));

export default technicians; 