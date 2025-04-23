import { clients_up, clients_down } from './001_clients.js';
import { technicians_up, technicians_down } from './002_technicians.js';
import { service_requests_up, service_requests_down } from './003_service_requests.js';
import { assignments_up, assignments_down } from './004_assignments.js';
import { technician_applications_up, technician_applications_down } from './005_technician_applications.js';

export const migrations = [
  {
    name: '001_clients',
    up: clients_up,
    down: clients_down
  },
  {
    name: '002_technicians',
    up: technicians_up,
    down: technicians_down
  },
  {
    name: '003_service_requests',
    up: service_requests_up,
    down: service_requests_down
  },
  {
    name: '004_assignments',
    up: assignments_up,
    down: assignments_down
  },
  {
    name: '005_technician_applications',
    up: technician_applications_up,
    down: technician_applications_down
  }
]; 