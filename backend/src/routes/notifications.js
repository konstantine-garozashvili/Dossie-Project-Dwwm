import { Hono } from 'hono';
const notifications = new Hono();

notifications.get('/', (c) => c.text('Notifications route works!'));

export default notifications; 