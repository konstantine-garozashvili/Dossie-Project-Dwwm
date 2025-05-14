/**
 * Authentication service for handling login, logout, and token management.
 */

import api from './api';

/**
 * Set auth token in localStorage and axios headers
 * @param {string} token - JWT token
 */
const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

/**
 * Login as admin
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise} Promise with login result
 */
const adminLogin = async (email, password) => {
  try {
    const response = await api.post('/auth/admin/login', {
      email,
      password
    });
    
    if (response.data.success && response.data.token) {
      setToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || 'Erreur de connexion'
      };
    }
    return {
      success: false,
      message: 'Erreur de connexion au serveur'
    };
  }
};

/**
 * Login as technician
 * @param {string} email - Technician email
 * @param {string} password - Technician password
 * @returns {Promise} Promise with login result
 */
const technicianLogin = async (email, password) => {
  try {
    const response = await api.post('/auth/technician/login', {
      email,
      password
    });
    
    if (response.data.success && response.data.token) {
      setToken(response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
    
    return response.data;
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || 'Erreur de connexion'
      };
    }
    return {
      success: false,
      message: 'Erreur de connexion au serveur'
    };
  }
};

/**
 * Logout user
 */
const logout = () => {
  setToken(null);
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  // Redirect to home page can be done by the component that calls this
};

/**
 * Get current user
 * @returns {Object|null} User object or null
 */
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Error parsing user from localStorage', e);
    return null;
  }
};

/**
 * Check if user is logged in
 * @returns {boolean} True if user is logged in
 */
const isLoggedIn = () => {
  return !!localStorage.getItem('token') && !!getCurrentUser();
};

/**
 * Check if user is admin
 * @returns {boolean} True if user is admin
 */
const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.role === 'admin';
};

/**
 * Check if user is technician
 * @returns {boolean} True if user is technician
 */
const isTechnician = () => {
  const user = getCurrentUser();
  return user && user.role === 'technician';
};

/**
 * Get current user info from API
 * @returns {Promise} Promise with user info
 */
const getUserInfo = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error getting user info:', error);
    return { success: false };
  }
};

/**
 * Initialize authentication state from localStorage
 */
const initAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    setToken(token);
  }
};

// Initialize authentication when service is imported
initAuth();

// Export functions
const authService = {
  adminLogin,
  technicianLogin,
  logout,
  getCurrentUser,
  getUserInfo,
  isLoggedIn,
  isAdmin,
  isTechnician
};

export default authService; 