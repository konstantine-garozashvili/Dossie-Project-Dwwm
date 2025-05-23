import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import { CheckCircle } from 'lucide-react';

export const ApplicationSubmitted = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground py-20 px-4">
        <motion.div 
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-6">
            <div className="bg-green-500/20 rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Candidature Soumise avec Succès!
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Merci d'avoir soumis votre candidature pour devenir technicien chez IT13 Boutique Informatique. Notre équipe examinera votre candidature et vous contactera prochainement.
          </p>
          
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-primary mb-4">Que se passe-t-il maintenant?</h2>
            <ol className="text-left space-y-4 text-card-foreground">
              <li className="flex gap-3">
                <div className="bg-muted rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center text-primary font-semibold">1</div>
                <div>
                  <span className="font-medium">Examen des documents</span>
                  <p className="text-muted-foreground text-sm mt-1">Notre équipe RH va examiner votre CV, diplômes et lettre de motivation.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="bg-muted rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center text-primary font-semibold">2</div>
                <div>
                  <span className="font-medium">Entretien</span>
                  <p className="text-muted-foreground text-sm mt-1">Si votre profil correspond à nos besoins, nous vous contacterons pour un entretien.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="bg-muted rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center text-primary font-semibold">3</div>
                <div>
                  <span className="font-medium">Formation</span>
                  <p className="text-muted-foreground text-sm mt-1">Les candidats retenus recevront une formation sur nos procédures et systèmes.</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="bg-muted rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center text-primary font-semibold">4</div>
                <div>
                  <span className="font-medium">Intégration</span>
                  <p className="text-muted-foreground text-sm mt-1">Bienvenue dans l'équipe! Vous commencerez à recevoir des demandes de service.</p>
                </div>
              </li>
            </ol>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/')}
              variant="outline" 
              className="border-primary text-primary hover:bg-primary/10"
            >
              Retour à l'accueil
            </Button>
            <Button 
              onClick={() => window.location.href = 'mailto:support@it13.com'}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Contactez notre support
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ApplicationSubmitted; 