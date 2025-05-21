/**
 * API configuration
 */

// Base API URL - Use environment variable or fallback to localhost in development
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  TECHNICIAN_LOGIN: `${API_BASE_URL}/auth/technician/login`,
  ADMIN_LOGIN: `${API_BASE_URL}/auth/admin/login`,
};

// Data endpoints
export const ENDPOINTS = {
  TECHNICIANS: `${API_BASE_URL}/technicians`,
  CLIENTS: `${API_BASE_URL}/clients`,
  SERVICE_REQUESTS: `${API_BASE_URL}/service-requests`,
  // Add more endpoints as needed
};

export default {
  API_BASE_URL,
  AUTH_ENDPOINTS,
  ENDPOINTS,
}; 