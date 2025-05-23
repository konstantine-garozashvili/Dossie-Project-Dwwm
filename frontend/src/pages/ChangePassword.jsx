import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, Shield, Key } from "lucide-react";

export const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTemporary, setIsTemporary] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [token, setToken] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  // Memoize password validation to prevent recalculation
  const passwordValidation = useMemo(() => {
    if (!newPassword) return {
      minLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecialChar: false,
      noCommonPatterns: true
    };

    return {
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumber: /\d/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
      noCommonPatterns: !/(?:123456|password|azerty|qwerty|admin|letmein)/i.test(newPassword)
    };
  }, [newPassword]);

  // Memoize validation check
  const isPasswordValid = useMemo(() => {
    return Object.values(passwordValidation).every(Boolean);
  }, [passwordValidation]);

  // Show toast function
  const showToast = useCallback((message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
      setToastType('');
    }, 5000);
  }, []);

  // Check temporary password status and token only once
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const isTemp = urlParams.get('temporary') === 'true';
    const urlToken = urlParams.get('token');
    const techInfo = localStorage.getItem('technicianInfo');
    
    setIsTemporary(isTemp || !techInfo);
    
    if (urlToken) {
      setHasToken(true);
      setToken(urlToken);
    }
  }, []); // Empty dependency array - only run once

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // For token-based changes, we don't need current password
    if (!hasToken && !currentPassword) {
      showToast("Le mot de passe actuel est requis", "error");
      return;
    }
    
    if (!newPassword || !confirmPassword) {
      showToast("Tous les champs requis doivent être remplis", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Les nouveaux mots de passe ne correspondent pas", "error");
      return;
    }

    if (!isPasswordValid) {
      showToast("Le nouveau mot de passe ne respecte pas les exigences de sécurité", "error");
      return;
    }

    setIsLoading(true);

    try {
      let response;
      
      if (hasToken) {
        // Use token-based endpoint for temporary password changes
        response = await fetch('/api/auth/technician/change-temporary-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            newPassword
          }),
        });
      } else {
        // Use traditional endpoint with current password
        const techInfo = JSON.parse(localStorage.getItem('technicianInfo') || '{}');
        
        response = await fetch('/api/auth/technician/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: techInfo.email,
            currentPassword,
            newPassword
          }),
        });
      }

      const data = await response.json();

      if (data.success) {
        showToast("Votre mot de passe a été mis à jour avec succès", "success");
        
        // Redirect to dashboard after successful password change
        setTimeout(() => {
          if (hasToken) {
            // If using token, redirect to login page
            navigate('/techlog');
          } else {
            // If logged in, redirect to dashboard
            navigate('/technician-dashboard');
          }
        }, 2000);
      } else {
        showToast(data.message || "Erreur lors du changement de mot de passe", "error");
      }
    } catch (error) {
      console.error('Password change error:', error);
      showToast("Erreur de connexion au serveur", "error");
    } finally {
      setIsLoading(false);
    }
  }, [hasToken, token, currentPassword, newPassword, confirmPassword, isPasswordValid, navigate, showToast]);

  const ValidationItem = useCallback(({ isValid, text }) => (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center space-x-2 text-sm transition-colors duration-200 ${
        isValid ? 'text-emerald-400' : 'text-red-400'
      }`}
    >
      {isValid ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <span>{text}</span>
    </motion.div>
  ), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950/70 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          toastType === 'success' ? 'bg-green-600' : 
          toastType === 'error' ? 'bg-red-600' : 'bg-blue-600'
        } text-white`}>
          {toastMessage}
        </div>
      )}

      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg')] bg-cover bg-center opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-slate-900/80 backdrop-blur-md border-slate-700/50 shadow-2xl shadow-cyan-500/10">
          <CardHeader className="text-center border-b border-slate-700/50 pb-6">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 p-1 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              </div>
            </motion.div>
            
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {hasToken ? 'Définir votre nouveau mot de passe' : 
               isTemporary ? 'Changement de mot de passe requis' : 'Changer le mot de passe'}
            </CardTitle>
            
            {(isTemporary || hasToken) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-amber-400" />
                  <p className="text-sm text-amber-200">
                    {hasToken ? 
                      'Utilisez ce formulaire sécurisé pour définir votre nouveau mot de passe' :
                      'Votre mot de passe temporaire doit être changé pour des raisons de sécurité'
                    }
                  </p>
                </div>
              </motion.div>
            )}
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password - Only show if no token */}
              {!hasToken && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <Label htmlFor="currentPassword" className="text-slate-200 font-medium">
                    Mot de passe actuel
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Entrez votre mot de passe actuel"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 pr-10 focus:border-cyan-500 focus:ring-cyan-500/20"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-cyan-400"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* New Password */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: hasToken ? 0.4 : 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="newPassword" className="text-slate-200 font-medium">
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Entrez votre nouveau mot de passe"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 pr-10 focus:border-cyan-500 focus:ring-cyan-500/20"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-cyan-400"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </motion.div>

              {/* Confirm Password */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: hasToken ? 0.5 : 0.6 }}
                className="space-y-2"
              >
                <Label htmlFor="confirmPassword" className="text-slate-200 font-medium">
                  Confirmer le nouveau mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmez votre nouveau mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 pr-10 focus:border-cyan-500 focus:ring-cyan-500/20"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-cyan-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </motion.div>

              {/* Password Requirements */}
              {newPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: hasToken ? 0.6 : 0.7 }}
                  className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-lg space-y-3"
                >
                  <h4 className="text-sm font-medium text-slate-200 mb-3 flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-cyan-400" />
                    Exigences du mot de passe :
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    <ValidationItem 
                      isValid={passwordValidation.minLength} 
                      text="Au moins 8 caractères" 
                    />
                    <ValidationItem 
                      isValid={passwordValidation.hasUppercase} 
                      text="Au moins une lettre majuscule" 
                    />
                    <ValidationItem 
                      isValid={passwordValidation.hasLowercase} 
                      text="Au moins une lettre minuscule" 
                    />
                    <ValidationItem 
                      isValid={passwordValidation.hasNumber} 
                      text="Au moins un chiffre" 
                    />
                    <ValidationItem 
                      isValid={passwordValidation.hasSpecialChar} 
                      text="Au moins un caractère spécial" 
                    />
                    <ValidationItem 
                      isValid={passwordValidation.noCommonPatterns} 
                      text="Pas de séquences communes" 
                    />
                  </div>
                </motion.div>
              )}

              {/* Password Mismatch Warning */}
              {confirmPassword && newPassword !== confirmPassword && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
                  <span className="text-sm text-red-300">
                    Les mots de passe ne correspondent pas
                  </span>
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: hasToken ? 0.7 : 0.8 }}
              >
                <Button 
                  type="submit"
                  className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-medium py-3 transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-cyan-500/25"
                  disabled={isLoading || !isPasswordValid || newPassword !== confirmPassword || (!hasToken && !currentPassword)}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Changement en cours...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Key className="h-4 w-4" />
                      <span>{hasToken ? 'Définir le mot de passe' : 'Changer le mot de passe'}</span>
                    </div>
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ChangePassword; 