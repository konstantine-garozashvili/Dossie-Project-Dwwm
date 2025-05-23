import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, User, List, Calendar, Wrench, Settings, LogOut, Server, LineChart, Users as AdminUsersIcon, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  navigationItems,
  onNavigate,
  currentTab,
  profilePictureUrl,
  userName,
  userEmail,
  onLogoutClick,
  onProfileClick,
  onSettingsClick,
  onClose,
  className = ''
}) => {
  const links = navigationItems || navLinksConfig[userType] || [];
  const logoText = userType === 'admin' ? 'Admin' : 'Technicien';

  return (
    <motion.aside
      className={`${className} fixed top-0 left-0 z-50 h-full bg-background border-r border-border shadow-md`}
      style={{ width: '16rem' }}
      initial={{ x: '-100%' }}
      animate={{ x: 0 }}
      transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
    >
      <div className="h-full flex flex-col justify-between py-5 px-4">
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-primary">IT13</div>
              <div className="ml-3 text-xl font-semibold text-foreground">{logoText}</div>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-primary p-2"
              >
                <X className="h-7 w-7" />
              </Button>
            )}
          </div>

          {/* User info section */}
          {profilePictureUrl && userName && (
            <div className="mb-6 pb-6 border-b border-border">
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-3">
                  <AvatarImage src={profilePictureUrl} alt={userName} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{userName}</p>
                  {userEmail && <p className="text-xs text-muted-foreground">{userEmail}</p>}
                </div>
              </div>
            </div>
          )}

          <nav className="flex-grow">
            <Tabs 
              value={currentTab} 
              onValueChange={onNavigate}
              orientation="vertical" 
              className="h-full"
            >
              <TabsList className="flex flex-col space-y-2 w-full bg-transparent h-full">
                {links.map((link) => {
                  const IconComponent = link.icon;
                  const value = link.tab || link.value;
                  return (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="w-full flex items-center justify-start text-muted-foreground hover:text-foreground px-3 py-3 rounded-md hover:bg-muted/80 data-[state=active]:bg-muted data-[state=active]:text-primary transition-colors text-lg"
                    >
                      <IconComponent className="h-6 w-6 mr-4" />
                      <span>{link.name || link.text}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </nav>
        </div>

        <div className="mt-auto pt-6 pb-2 border-t border-border">
          <Button
            variant="ghost"
            className="w-full flex items-center justify-start px-3 py-3 rounded-md text-destructive hover:text-destructive/90 hover:bg-destructive/10 transition-colors text-base"
            onClick={onLogoutClick}
          >
            <LogOut className="h-6 w-6 mr-4" />
            <span>Déconnexion</span>
          </Button>
        </div>
      </div>
    </motion.aside>
  );
};

export default CollapsibleSidebar; 