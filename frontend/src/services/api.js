/**
 * Secure HTTP client for making authenticated API requests
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const token = localStorage.getItem('token');
        if (token) {
          const refreshResponse = await axios.post(`${API_URL}/auth/refresh-token`, {
            token
          });
          
          if (refreshResponse.data.success && refreshResponse.data.token) {
            // Update token in storage
            localStorage.setItem('token', refreshResponse.data.token);
            
            // Update axios headers
            api.defaults.headers.common['Authorization'] = `Bearer ${refreshResponse.data.token}`;
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            
            // Retry original request
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear auth state and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login page can be handled by the component
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

// Export prepared API client
export default api; 