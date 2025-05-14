import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * ProtectedRoute component to handle route protection based on authentication and role.
 * @param {Object} props - Component props
 * @param {string} props.requiredRole - Role required to access the route ('admin' or 'technician')
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @returns {React.ReactNode} - The protected route
 */
const ProtectedRoute = ({ requiredRole, children }) => {
  const { isAuthenticated, isLoading, isAdmin, isTechnician, user } = useAuth();
  const location = useLocation();

  // Check if the user has the required role
  const hasRequiredRole = () => {
    if (requiredRole === 'admin') {
      return isAdmin();
    } else if (requiredRole === 'technician') {
      return isTechnician();
    }
    return true; // No specific role required, just authentication
  };

  // While auth state is loading, show nothing or a loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    // Redirect to appropriate login page
    const loginPath = requiredRole === 'admin' ? '/adminlog' : '/techlog';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // If authenticated but doesn't have the required role
  if (!hasRequiredRole()) {
    // Redirect to appropriate dashboard or home
    return <Navigate to="/" replace />;
  }

  // If authenticated and has the required role, render children
  return children;
};

export default ProtectedRoute; 