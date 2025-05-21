import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { AUTH_ENDPOINTS } from "@/config/api";

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const executeLogin = async (currentEmail, currentPassword) => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(AUTH_ENDPOINTS.ADMIN_LOGIN, {
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

      if (response.ok && data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminInfo', JSON.stringify({
          id: data.admin.id,
          email: data.admin.email,
          name: data.admin.name,
          surname: data.admin.surname
        }));
        navigate('/dashboardadmin');
      } else {
        setError(data.message || 'Identifiants incorrects. Veuillez réessayer.');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
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
    const testEmail = 'admin@it13.com';
    const testPassword = 'admin123';
    setEmail(testEmail);
    setPassword(testPassword);
    await executeLogin(testEmail, testPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader className="text-center border-b border-slate-800 pb-6">
            <CardTitle className="text-2xl font-bold text-white">Administration IT13</CardTitle>
            <p className="text-gray-400 mt-2">Connectez-vous pour accéder au tableau de bord</p>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} aria-label="Admin login form">
              {error && (
                <div className="mb-6 p-3 bg-red-950/50 border border-red-800 rounded-md flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@it13.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Mot de passe</Label>
                    <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300">Mot de passe oublié?</a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit"
                className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600"
                disabled={isLoading}
              >
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </Button>

              <Button 
                type="button"
                variant="outline"
                className="w-full mt-4 border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-400"
                onClick={handleQuickLogin}
                disabled={isLoading}
              >
                Connexion rapide (Test)
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t border-slate-800 pt-6">
            <p className="text-sm text-gray-400">
              Ceci est une interface d'administration. <span className="text-cyan-400">Accès restreint</span>.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;