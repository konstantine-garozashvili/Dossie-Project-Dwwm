import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useToast } from '@/components/ui/use-toast';

// Create auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initial load
  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(authService.isLoggedIn());
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Admin login
  const adminLogin = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await authService.adminLogin(email, password);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans votre espace d'administration.",
          variant: "success"
        });
        navigate('/dashboardadmin');
        return true;
      } else {
        toast({
          title: "Erreur de connexion",
          description: result.message || "Identifiants incorrects",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erreur de connexion",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Technician login
  const technicianLogin = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await authService.technicianLogin(email, password);
      
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans votre espace technicien.",
          variant: "success"
        });
        navigate('/dashboardtech');
        return true;
      } else {
        toast({
          title: "Erreur de connexion",
          description: result.message || "Identifiants incorrects",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Erreur de connexion",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès.",
      variant: "default"
    });
    navigate('/');
  };

  // Check if user is admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  // Check if user is technician
  const isTechnician = () => {
    return user && user.role === 'technician';
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    adminLogin,
    technicianLogin,
    logout,
    isAdmin,
    isTechnician
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 