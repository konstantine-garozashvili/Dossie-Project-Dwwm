import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, User, List, Calendar, Wrench, Settings, LogOut, Server, LineChart, Users } from 'lucide-react';

const navLinksConfig = {
  admin: [
    { text: 'Aperçu', icon: Home, value: 'apercu' },
    { text: 'Techniciens', icon: Users, value: 'techniciens' },
    { text: 'Services', icon: Server, value: 'services' },
    { text: 'Rapports', icon: LineChart, value: 'rapports' },
    { text: 'Profil', icon: User, value: 'profile' },
  ],
  technician: [
    { text: 'Mes Tâches', icon: List, value: 'taches' },
    { text: 'Calendrier', icon: Calendar, value: 'calendrier' },
    { text: 'Inventaire', icon: Wrench, value: 'inventaire' },
    { text: 'Mon Profil', icon: User, value: 'profile' },
  ],
};

const BottomDockNavigation = ({
  userType,
  activeTab,
  setActiveTab,
  handleLogout,
}) => {
  const links = navLinksConfig[userType] || [];

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-40 h-20 bg-slate-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)] flex items-center justify-center"
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="flex items-center justify-around w-full h-full px-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} orientation="horizontal" className="h-full w-full">
          <TabsList className="flex flex-row justify-around items-center h-full w-full bg-transparent p-0">
            {links.map((link) => {
              const IconComponent = link.icon;
              return (
                <TabsTrigger
                  key={link.value}
                  value={link.value}
                  className="flex flex-col items-center justify-center h-full px-2 py-2 rounded-none data-[state=active]:bg-slate-800/70 data-[state=active]:text-cyan-400 hover:bg-slate-800/50 text-slate-300 w-full transition-colors duration-150"
                  onClick={() => setActiveTab(link.value)}
                  style={{ flexGrow: 1, flexBasis: 0 }}
                >
                  <IconComponent className="h-6 w-6 mb-0.5" />
                  <span className="text-xs leading-tight">{link.text}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
    </motion.nav>
  );
};

export default BottomDockNavigation; 