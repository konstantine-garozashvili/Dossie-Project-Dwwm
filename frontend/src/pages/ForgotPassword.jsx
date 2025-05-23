import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { AUTH_ENDPOINTS } from "@/config/api";

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('technician');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userType
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSuccess(true);
      } else {
        setError(data.message || 'Erreur lors de la demande de réinitialisation');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Forgot password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
                Email envoyé !
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Si cette adresse email existe dans notre système, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  <strong>Vérifiez votre boîte email</strong><br />
                  Le lien de réinitialisation expire dans 1 heure.
                </p>
              </div>
              
              <div className="space-y-3 pt-4">
                <Button 
                  onClick={() => navigate(userType === 'admin' ? '/admin-login' : '/techlog')}
                  className="w-full"
                >
                  Retour à la connexion
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                    setError('');
                  }}
                  className="w-full"
                >
                  Envoyer un autre email
                </Button>
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
              <div className="p-3 bg-primary/10 rounded-full">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
            
            <CardTitle className="text-2xl font-bold text-card-foreground">
              Mot de passe oublié
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Type de compte</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={userType === 'technician' ? 'default' : 'outline'}
                    onClick={() => setUserType('technician')}
                    className="w-full"
                  >
                    Technicien
                  </Button>
                  <Button
                    type="button"
                    variant={userType === 'admin' ? 'default' : 'outline'}
                    onClick={() => setUserType('admin')}
                    className="w-full"
                  >
                    Admin
                  </Button>
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input border-border"
                  required
                />
              </div>

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
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Envoi en cours...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Envoyer le lien de réinitialisation</span>
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

export default ForgotPassword; 