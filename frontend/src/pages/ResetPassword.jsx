import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock, Shield, Key, ArrowLeft } from "lucide-react";
import { AUTH_ENDPOINTS } from "@/config/api";

export const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [userType, setUserType] = useState('technician');
  
  const navigate = useNavigate();
  const location = useLocation();

  // Password validation
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

  const isPasswordValid = useMemo(() => {
    return Object.values(passwordValidation).every(Boolean);
  }, [passwordValidation]);

  // Extract token from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const urlToken = urlParams.get('token');
    const urlUserType = urlParams.get('userType') || 'technician';
    
    if (urlToken) {
      setToken(urlToken);
      setUserType(urlUserType);
    } else {
      setError('Token de réinitialisation manquant ou invalide');
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token de réinitialisation manquant');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Tous les champs sont requis');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!isPasswordValid) {
      setError('Le mot de passe ne respecte pas les exigences de sécurité');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(AUTH_ENDPOINTS.RESET_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
      } else {
        setError(data.message || 'Erreur lors de la réinitialisation du mot de passe');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationItem = ({ isValid, text }) => (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center space-x-2 text-sm transition-colors duration-200 ${
        isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      }`}
    >
      {isValid ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <span>{text}</span>
    </motion.div>
  );

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-card border-border shadow-xl">
            <CardHeader className="text-center pb-6">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-4"
              >
                <div className="p-4 bg-green-500/10 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </motion.div>
              
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Mot de passe réinitialisé !
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-sm text-green-600 dark:text-green-400">
                  <strong>Réinitialisation réussie</strong><br />
                  Votre compte est maintenant sécurisé avec votre nouveau mot de passe.
                </p>
              </div>
              
              <Button 
                onClick={() => navigate(userType === 'admin' ? '/admin-login' : '/techlog')}
                className="w-full mt-6"
              >
                Se connecter maintenant
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-card border-border shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-red-500/10 rounded-full">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </div>
              
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Lien invalide
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Ce lien de réinitialisation est invalide ou a expiré.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/forgot-password')}
                  className="w-full"
                >
                  Demander un nouveau lien
                </Button>
                
                <Link 
                  to="/techlog"
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Retour à la connexion
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card border-border shadow-xl">
          <CardHeader className="text-center border-b border-border pb-6">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="relative">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 p-1 bg-green-500 rounded-full">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              </div>
            </motion.div>
            
            <CardTitle className="text-2xl font-bold text-card-foreground">
              Nouveau mot de passe
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Choisissez un mot de passe sécurisé pour votre compte
            </p>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Entrez votre nouveau mot de passe"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-input border-border pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmez votre nouveau mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-input border-border pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password Requirements */}
              {newPassword && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: 0.3 }}
                  className="bg-muted/50 border border-border p-4 rounded-lg space-y-3"
                >
                  <h4 className="text-sm font-medium flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-primary" />
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
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Les mots de passe ne correspondent pas
                  </span>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
                  <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                </motion.div>
              )}
              
              {/* Submit Button */}
              <Button 
                type="submit"
                className="w-full mt-6"
                disabled={isLoading || !isPasswordValid || newPassword !== confirmPassword}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Réinitialisation...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span>Réinitialiser le mot de passe</span>
                  </div>
                )}
              </Button>

              {/* Back to Login */}
              <div className="text-center pt-4">
                <Link 
                  to={userType === 'admin' ? '/admin-login' : '/techlog'}
                  className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Retour à la connexion
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword; 