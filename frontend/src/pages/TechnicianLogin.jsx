import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

export const TechnicianLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Dans une implémentation réelle, envoyez ces données à une API
    try {
      // Simuler une vérification de connexion pour la démo frontend
      setTimeout(() => {
        // Pour le frontend uniquement, accepter un identifiant de test
        if (email === 'tech@it13.com' && password === 'tech123') {
          localStorage.setItem('techToken', 'tech-token-12345');
          navigate('/dashboardtech');
        } else {
          setError('Identifiants incorrects. Veuillez réessayer.');
        }
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
      setIsLoading(false);
    }
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
            <CardTitle className="text-2xl font-bold text-white">Espace Technicien IT13</CardTitle>
            <p className="text-gray-400 mt-2">Connectez-vous pour accéder à votre espace technicien</p>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-6 p-3 bg-red-950/50 border border-red-800 rounded-md flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tech@it13.com"
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
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t border-slate-800 pt-6">
            <p className="text-sm text-gray-400">
              Espace réservé aux techniciens. <span className="text-cyan-400">Accès restreint</span>.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default TechnicianLogin; 