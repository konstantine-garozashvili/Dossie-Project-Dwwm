import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
// import { fixLayoutOverflow } from "@/lib/utils"; // Commented out
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { X, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const rootRef = useRef(null);

  useEffect(() => {
    // Apply the layout overflow fix
    // if (rootRef.current) { // Commented out
    //   fixLayoutOverflow(rootRef.current); // Commented out
    // }
    
    // Additional fix to ensure there's no overflow on the body
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    
    // Cleanup function
    return () => {
      document.body.style.overflowX = '';
      document.documentElement.style.overflowX = '';
    };
  }, []);

  const isHomePage = location.pathname === '/';

  const navLinkClasses = "text-muted-foreground hover:text-primary transition-colors cursor-pointer";
  const mobileNavLinkClasses = "block py-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer";

  return (
    <div className="bg-background text-foreground overflow-x-hidden" ref={rootRef}>
      {/* Fixed Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="text-2xl font-bold text-primary">IT13</div>
              <div className="hidden md:block text-xl font-semibold text-foreground">Boutique Informatique</div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a onClick={() => {
                if (isHomePage) document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                else navigate('/#services');
              }} className={navLinkClasses}>Services</a>
              
              <a onClick={() => {
                if (isHomePage) document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' });
                else navigate('/#process');
              }} className={navLinkClasses}>Processus</a>
              
              <a onClick={() => {
                if (isHomePage) document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
                else navigate('/#testimonials');
              }} className={navLinkClasses}>Témoignages</a>
              
              <a onClick={() => {
                if (isHomePage) document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                else navigate('/#contact');
              }} className={navLinkClasses}>Contact</a>
              
              <div className="pl-4 flex items-center space-x-3 border-l border-border">
                <ThemeToggleButton />
                {isHomePage ? (
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => navigate('/become-technician')}
                  >
                    Devenir Technicien
                  </Button>
                ) : (
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => navigate('/become-technician')}
                  >
                    Devenir Technicien
                  </Button>
                )}
              </div>
            </nav>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <ThemeToggleButton />
              <Button 
                variant="ghost" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-muted-foreground hover:text-primary ml-2"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 space-y-3 border-t border-border bg-background/95"
            >
              <a onClick={() => {
                if (isHomePage) document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
                else navigate('/#services');
                setMobileMenuOpen(false);
              }} className={mobileNavLinkClasses}>Services</a>
              
              <a onClick={() => {
                if (isHomePage) document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' });
                else navigate('/#process');
                setMobileMenuOpen(false);
              }} className={mobileNavLinkClasses}>Processus</a>
              
              <a onClick={() => {
                if (isHomePage) document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
                else navigate('/#testimonials');
                setMobileMenuOpen(false);
              }} className={mobileNavLinkClasses}>Témoignages</a>
              
              <a onClick={() => {
                if (isHomePage) document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                else navigate('/#contact');
                setMobileMenuOpen(false);
              }} className={mobileNavLinkClasses}>Contact</a>
              
              <div className="pt-3 flex flex-col space-y-3 border-t border-border">
                {isHomePage ? (
                  <Button 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {navigate('/become-technician'); setMobileMenuOpen(false);}}
                  >
                    Devenir Technicien
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {navigate('/become-technician'); setMobileMenuOpen(false);}}
                  >
                    Devenir Technicien
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 overflow-hidden">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card text-card-foreground border-t border-border overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-primary cursor-pointer" onClick={() => navigate('/')}>IT13</h3>
            <p className="text-muted-foreground">Votre partenaire de confiance pour tous vos besoins informatiques depuis 2023.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Services</h4>
            <ul className="space-y-2">
              <li><a href="#s-repair" className="text-muted-foreground hover:text-primary">Réparation d'Ordinateurs</a></li>
              <li><a href="#s-data" className="text-muted-foreground hover:text-primary">Récupération de Données</a></li>
              <li><a href="#s-virus" className="text-muted-foreground hover:text-primary">Suppression de Virus</a></li>
              <li><a href="#s-network" className="text-muted-foreground hover:text-primary">Configuration Réseau</a></li>
              <li><a href="#s-hardware" className="text-muted-foreground hover:text-primary">Mises à Niveau Matérielles</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Entreprise</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-muted-foreground hover:text-primary">À Propos</a></li>
              <li><a href="#team" className="text-muted-foreground hover:text-primary">Notre Équipe</a></li>
              <li><a href="#careers" className="text-muted-foreground hover:text-primary">Carrières</a></li>
              <li><a href="#terms" className="text-muted-foreground hover:text-primary">Conditions d'Utilisation</a></li>
              <li><a href="#privacy" className="text-muted-foreground hover:text-primary">Politique de Confidentialité</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-foreground">Newsletter</h4>
            <p className="text-muted-foreground mb-4">Abonnez-vous à notre newsletter pour recevoir conseils et mises à jour.</p>
            <form className="flex space-x-2">
              <Input type="email" placeholder="Votre email" className="bg-input border-border placeholder:text-muted-foreground" />
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">S'abonner</Button>
            </form>
          </div>
        </div>
        
        <div className="mt-10 text-center text-sm text-muted-foreground border-t border-border pt-8">
          © {new Date().getFullYear()} IT13 Boutique Informatique. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default Layout;