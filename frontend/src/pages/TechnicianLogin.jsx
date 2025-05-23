import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertCircle, User } from "lucide-react";
import { AUTH_ENDPOINTS } from "@/config/api";
import { useToast } from "@/components/ui/use-toast";

export const TechnicianLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const executeLogin = async (currentEmail, currentPassword) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(AUTH_ENDPOINTS.TECHNICIAN_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: currentEmail,
          password: currentPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user info
        localStorage.setItem('technicianToken', data.token);
        localStorage.setItem('technicianInfo', JSON.stringify(data.technician));
        
        // Check if password change is required
        if (data.mustChangePassword || data.isTemporaryPassword) {
          toast({
            title: "Changement de mot de passe requis",
            description: "Vous devez changer votre mot de passe temporaire",
            variant: "default",
          });
          
          navigate('/change-password?temporary=true');
          return;
        }
        
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans votre espace technicien !",
          variant: "success",
        });
        
        navigate('/technician-dashboard');
      } else {
        // Handle different error types
        if (data.reason === 'rejected') {
          toast({
            title: "Compte refusé",
            description: data.message,
            variant: "destructive",
          });
          
          // Show additional details in a separate toast
          setTimeout(() => {
            toast({
              title: "Informations complémentaires",
              description: data.details,
              variant: "destructive",
            });
          }, 2000);
        } else if (data.reason === 'pending') {
          toast({
            title: "Candidature en cours",
            description: data.message,
            variant: "default",
          });
          
          setTimeout(() => {
            toast({
              title: "Patience requise",
              description: data.details,
              variant: "default",
            });
          }, 2000);
        } else if (data.reason === 'inactive') {
          toast({
            title: "Compte désactivé",
            description: data.message,
            variant: "destructive",
          });
        } else {
          // Generic error
          toast({
            title: "Erreur de connexion",
            description: data.message || "Identifiants invalides",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await executeLogin(email, password);
  };

  const handleQuickLogin = async () => {
    const testEmail = 'tech1@it13.com';
    const testPassword = 'password1';
    setEmail(testEmail);
    setPassword(testPassword);
    await executeLogin(testEmail, testPassword);
  };

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
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <User className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-card-foreground">
              Connexion Technicien
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Accédez à votre espace technicien
            </p>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Mot de passe oublié?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input border-border"
                  required
                />
              </div>
              
              <Button 
                type="submit"
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Espace réservé aux techniciens. <span className="text-primary">Accès restreint</span>.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default TechnicianLogin; 