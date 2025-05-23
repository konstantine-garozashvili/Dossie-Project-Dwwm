// This file contains configuration for API endpoints.

const API_BASE_URL = '/api'; // Using relative path for proxy

export const AUTH_ENDPOINTS = {
  ADMIN_LOGIN: `${API_BASE_URL}/auth/admin/login`,
  TECHNICIAN_LOGIN: `${API_BASE_URL}/auth/technician/login`,
  // Add other auth-related endpoints here if needed
};

export const PROFILE_ENDPOINTS = {
  GET_PICTURE: (userType, userId) => `${API_BASE_URL}/profile/picture/${userType}/${userId}`,
  UPLOAD_PICTURE: (userType, userId) => `${API_BASE_URL}/profile/picture/${userType}/${userId}`,
  DELETE_PICTURE: (userType, userId) => `${API_BASE_URL}/profile/picture/${userType}/${userId}`,
  // Add other profile-related endpoints here if needed
};

export const ADMIN_ENDPOINTS = {
  GET_TECHNICIANS: `${API_BASE_URL}/admin/technicians`,
  GET_TECHNICIAN_BY_ID: (id) => `${API_BASE_URL}/admin/technicians/${id}`,
  CREATE_TECHNICIAN: `${API_BASE_URL}/admin/technicians`,
  UPDATE_TECHNICIAN: (id) => `${API_BASE_URL}/admin/technicians/${id}`,
  DELETE_TECHNICIAN: (id) => `${API_BASE_URL}/admin/technicians/${id}`,
};

export const TECHNICIAN_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/technicians`,
  GET_BY_ID: (id) => `${API_BASE_URL}/technicians/${id}`,
  CREATE: `${API_BASE_URL}/technicians`,
  UPDATE: (id) => `${API_BASE_URL}/technicians/${id}`,
  DELETE: (id) => `${API_BASE_URL}/technicians/${id}`,
  ASSIGN_TO_REQUEST: (technicianId, requestId) => `${API_BASE_URL}/technicians/${technicianId}/assign/${requestId}`,
};

// Add other endpoint categories as needed, for example:
// export const SERVICE_REQUEST_ENDPOINTS = {
//   GET_ALL: `${API_BASE_URL}/service-requests`,
//   CREATE: `${API_BASE_URL}/service-requests`,
// };

console.log('Loaded frontend/src/config/api.js'); 