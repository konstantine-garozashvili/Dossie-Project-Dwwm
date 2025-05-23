// This file contains configuration for API endpoints.

const API_BASE_URL = '/api'; // Using relative path for proxy

export const AUTH_ENDPOINTS = {
  ADMIN_LOGIN: `${API_BASE_URL}/auth/admin/login`,
  TECHNICIAN_LOGIN: `${API_BASE_URL}/auth/technician/login`,
  CHANGE_PASSWORD: `${API_BASE_URL}/auth/technician/change-password`,
  CHANGE_TEMPORARY_PASSWORD: `${API_BASE_URL}/auth/technician/change-temporary-password`,
  FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
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

export const TECHNICIAN_APPLICATION_ENDPOINTS = {
  SUBMIT_APPLICATION: `${API_BASE_URL}/technician-applications`,
  GET_ALL_APPLICATIONS: `${API_BASE_URL}/technician-applications`,
  GET_APPLICATION_BY_ID: (id) => `${API_BASE_URL}/technician-applications/${id}`,
  UPDATE_APPLICATION_STATUS: (id) => `${API_BASE_URL}/technician-applications/${id}/status`,
  APPROVE_APPLICATION: (id) => `${API_BASE_URL}/technician-applications/${id}/approve`,
  DELETE_APPLICATION: (id) => `${API_BASE_URL}/technician-applications/${id}`,
};

export const ADDRESS_ENDPOINTS = {
  SEARCH_ADDRESSES: `${API_BASE_URL}/address/search`,
  REVERSE_GEOCODE: `${API_BASE_URL}/address/reverse`,
  VALIDATE_ADDRESS: `${API_BASE_URL}/address/validate`,
};

export const NOTIFICATION_ENDPOINTS = {
  GET_NOTIFICATIONS: `${API_BASE_URL}/notifications`,
  GET_UNREAD_COUNT: `${API_BASE_URL}/notifications/unread-count`,
  MARK_AS_READ: (id) => `${API_BASE_URL}/notifications/${id}/read`,
  MARK_ALL_READ: `${API_BASE_URL}/notifications/mark-all-read`,
};

// Add other endpoint categories as needed, for example:
// export const SERVICE_REQUEST_ENDPOINTS = {
//   GET_ALL: `${API_BASE_URL}/service-requests`,
//   CREATE: `${API_BASE_URL}/service-requests`,
// };

console.log('Loaded frontend/src/config/api.js'); 