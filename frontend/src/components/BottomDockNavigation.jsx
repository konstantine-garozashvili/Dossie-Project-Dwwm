import React, { useEffect } from 'react';
import { Home, User, List, Calendar, Wrench, Settings, LineChart, Users } from 'lucide-react';

// Configuration for navigation links based on user type
const navLinksConfig = {
  admin: [
    { text: 'Aperçu', icon: Home, value: 'apercu' },
    { text: 'Techniciens', icon: Users, value: 'techniciens' },
    { text: 'Clients', icon: Users, value: 'clients' },
    { text: 'Services', icon: List, value: 'services' },
    { text: 'Profil', icon: User, value: 'profile' },
  ],
  technician: [
    { text: 'Tâches', icon: List, value: 'taches' },
    { text: 'Calendrier', icon: Calendar, value: 'calendrier' },
    { text: 'Inventaire', icon: Wrench, value: 'inventaire' },
    { text: 'Profil', icon: User, value: 'profile' },
  ],
};

const BottomDockNavigation = ({ userType, activeTab, setActiveTab }) => {
  // Get the appropriate navigation links based on user type
  const links = navLinksConfig[userType] || [];
  
  useEffect(() => {
    console.log('BottomDockNavigation mounted with:', { userType, activeTab, linksCount: links.length });
  }, [userType, activeTab, links.length]);
  
  return (
    <div 
      className="bg-primary text-white border-t border-border shadow-lg"
      style={{ height: '70px', width: '100%' }}
    >
      <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${links.length}, 1fr)` }}>
        {links.map((link) => {
          const IconComponent = link.icon;
          const isActive = activeTab === link.value;
          
          return (
            <button
              key={link.value}
              className={`flex flex-col items-center justify-center h-full transition-colors duration-150
                ${isActive 
                  ? 'bg-primary-foreground/20 font-medium' 
                  : 'hover:bg-primary-foreground/10'
                }`}
              onClick={() => setActiveTab(link.value)}
            >
              <IconComponent className="h-6 w-6 text-white" />
              <span className={`text-sm mt-1 text-white ${isActive ? 'font-bold' : 'font-medium'}`}>{link.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomDockNavigation; 