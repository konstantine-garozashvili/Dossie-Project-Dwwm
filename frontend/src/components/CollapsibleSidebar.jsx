import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, User, List, Calendar, Wrench, Settings, LogOut, Server, LineChart, Users as AdminUsersIcon, X } from 'lucide-react';

const navLinksConfig = {
  admin: [
    { text: 'Aperçu', icon: Home, value: 'apercu' },
    { text: 'Techniciens', icon: AdminUsersIcon, value: 'techniciens' },
    { text: 'Services', icon: Server, value: 'services' },
    { text: 'Rapports', icon: LineChart, value: 'rapports' },
    { text: 'Paramètres', icon: Settings, value: 'parametres' },
    { text: 'Profil', icon: User, value: 'profile' },
  ],
  technician: [
    { text: 'Mes Tâches', icon: List, value: 'taches' },
    { text: 'Calendrier', icon: Calendar, value: 'calendrier' },
    { text: 'Inventaire', icon: Wrench, value: 'inventaire' },
    { text: 'Paramètres', icon: Settings, value: 'parametres' },
    { text: 'Mon Profil', icon: User, value: 'profile' },
  ],
};

const CollapsibleSidebar = ({
  userType,
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  handleLogout,
  className = ''
}) => {
  const links = navLinksConfig[userType] || [];
  const logoText = userType === 'admin' ? 'Admin' : 'Technicien';

  const handleNavLinkClick = (value) => {
    setActiveTab(value);
    setSidebarOpen(false);
  };

  const handleLogoutClick = () => {
    handleLogout();
    setSidebarOpen(false);
  };

  return (
    <motion.aside
      className={`fixed top-0 left-0 z-50 h-full bg-slate-900 shadow-xl ${className}
                 ${sidebarOpen ? 'w-full' : 'w-0'} overflow-x-hidden overflow-y-auto`}
      initial={{ x: '-100%' }}
      animate={{ x: sidebarOpen ? 0 : '-100%' }}
      transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
    >
      {sidebarOpen && (
        <div className="h-full flex flex-col justify-between py-5 px-4">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <div className="text-3xl font-bold text-cyan-400">IT13</div>
                <div className="ml-3 text-xl font-semibold text-white">{logoText}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="text-slate-300 hover:text-cyan-400 p-2"
              >
                <X className="h-7 w-7" />
              </Button>
            </div>

            <nav className="flex-grow">
              <Tabs 
                value={activeTab} 
                onValueChange={handleNavLinkClick}
                orientation="vertical" 
                className="h-full"
              >
                <TabsList className="flex flex-col space-y-2 w-full bg-transparent h-full">
                  {links.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <TabsTrigger
                        key={link.value}
                        value={link.value}
                        className="w-full flex items-center justify-center text-slate-300 hover:text-white px-3 py-3 rounded-md hover:bg-slate-800/80 data-[state=active]:bg-slate-800 data-[state=active]:text-cyan-400 transition-colors text-lg"
                      >
                        <IconComponent className="h-6 w-6 mr-4" />
                        <span>{link.text}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </nav>
          </div>

          <div className="mt-auto pt-6 pb-2 border-t border-slate-700">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-start px-3 py-3 rounded-md text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors text-base"
              onClick={handleLogoutClick}
            >
              <LogOut className="h-6 w-6 mr-4" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default CollapsibleSidebar; 