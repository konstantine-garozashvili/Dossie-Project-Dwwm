import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  Settings, 
  Wrench, 
  List, 
  Calendar, 
  Bell, 
  LogOut, 
  Home,
  Search,
  Menu,
  X,
  CheckCircle,
  Clock,
  ArrowRight,
  FileText,
  Star,
  User,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ProfilePictureUploader from "@/components/ProfilePictureUploader";
import CollapsibleSidebar from '@/components/CollapsibleSidebar';
import useResponsive from '@/hooks/useResponsive';
import { PROFILE_ENDPOINTS } from '@/config/api';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';

// Define pageTitles for TechnicianDashboard
const pageTitles = {
  taches: "Mes Tâches Actuelles",
  calendrier: "Mon Calendrier",
  inventaire: "Gestion de l'Inventaire",
  parametres: "Paramètres du Compte",
  profile: "Mon Profil",
};

export const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("taches");
  const [loading, setLoading] = useState(true);
  const [technicianData, setTechnicianData] = useState({
    id: null,
    email: '',
    name: '',
    surname: ''
  });
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const isSmallScreen = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedTechInfo = localStorage.getItem('technicianInfo');
    if (storedTechInfo) {
      try {
        const parsedData = JSON.parse(storedTechInfo);
        setTechnicianData(parsedData);
        setProfilePictureUrl(
          `https://ui-avatars.com/api/?name=${encodeURIComponent((parsedData.name || 'T') + ' ' + (parsedData.surname || ''))}&background=random&color=fff&size=128`
        );
      } catch (err) {
        console.error('Error parsing technician info:', err);
        setProfilePictureUrl(
          `https://ui-avatars.com/api/?name=Technicien&background=random&color=fff&size=128`
        );
      }
    } else {
      setProfilePictureUrl(
        `https://ui-avatars.com/api/?name=Technicien&background=random&color=fff&size=128`
      );
    }
  }, []);

  useEffect(() => {
    if (technicianData.id) {
      fetchProfilePicture();
    }
  }, [technicianData.id]);

  const fetchProfilePicture = async () => {
    const uiAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent((technicianData.name || 'T') + ' ' + (technicianData.surname || ''))}&background=random&color=fff&size=128`;
    setProfilePictureUrl(uiAvatarUrl);

    if (!technicianData.id) return;
    
    try {
      const response = await fetch(PROFILE_ENDPOINTS.GET_PICTURE('technician', technicianData.id), {
        headers: { 'Accept': 'application/json' }
      });

      if (response.status === 404) {
        return; // Keep UI Avatars URL
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok && data.success && data.profilePicture?.secureUrl && !data.profilePicture.secureUrl.includes('fake-cloudinary.com')) {
          setProfilePictureUrl(data.profilePicture.secureUrl);
        } else if (data.defaultUrl && !data.defaultUrl.includes('fake-cloudinary.com')) {
          setProfilePictureUrl(data.defaultUrl);
        }
      }
    } catch (err) {
      // Keep UI Avatars URL
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('technicianToken');
    const techInfo = localStorage.getItem('technicianInfo');
    if (!token || !techInfo) {
      navigate('/techlog');
    } else {
      setTimeout(() => setLoading(false), 500);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('technicianToken');
    localStorage.removeItem('technicianInfo');
    setTechnicianData({ id: null, email: '', name: '', surname: '' });
    setProfilePictureUrl('');
    navigate('/techlog');
  };

  // Dummy data - should be replaced with API calls and use theme variables for icons
  const statsData = [
    { title: "Tâches en attente", value: "12", change: "+3 aujourd'hui", icon: <Clock className="h-5 w-5 text-primary" /> },
    { title: "Tâches terminées", value: "158", change: "+8 cette semaine", icon: <CheckCircle className="h-5 w-5 text-primary" /> },
    { title: "Temps moyen", value: "4.2h", change: "-15% ce mois", icon: <Calendar className="h-5 w-5 text-primary" /> },
    { title: "Satisfaction", value: "4.8/5", change: "+0.3 ce mois", icon: <Star className="h-5 w-5 text-primary" /> },
  ];

  const tasksList = [
    { id: 1, client: "Martin Dupont", service: "Réparation PC Portable", priority: "Haute", deadline: "Aujourd'hui, 17:00", status: "En attente", description: "Surchauffe."},
    { id: 2, client: "Sophie Martin", service: "Récupération de données", priority: "Urgente", deadline: "Aujourd'hui, 15:30", status: "En cours", description: "HDD externe HS."},
  ];

  const inventoryItems = [
    { id: 1, name: "SSD 500GB", quantity: 8, status: "En stock" },
    { id: 2, name: "RAM DDR4 8GB", quantity: 12, status: "En stock" },
    { id: 3, name: "Batterie HP", quantity: 2, status: "Stock faible" },
  ];

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case "Urgente": return "destructive";
      case "Haute": return "warning"; // Assuming you have a 'warning' variant or will add one
      case "Normale": return "default"; // Or 'info' or 'primary' based on your Badge variants
      case "Basse": return "success"; // Assuming you have a 'success' variant
      default: return "secondary";
    }
  };
  
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "En attente": return "warning";
      case "En cours": return "default"; // Or 'info', 'primary'
      case "Terminé": return "success";
      case "Planifiée": return "info"; // Assuming you have an 'info' variant
      case "Rupture": return "destructive";
      case "Stock faible": return "warning";
      default: return "secondary";
    }
  };

  const renderTasksTab = () => (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {statsData.map((stat, index) => (
          <Card key={index} className="bg-card border-border text-card-foreground">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1 text-foreground">{stat.value}</h3>
                  <p className="text-xs text-primary mt-2">{stat.change}</p>
                          </div>
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                            {stat.icon}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
      <Card className="bg-card border-border text-card-foreground">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
            <CardTitle className="text-foreground">Tâches Actives</CardTitle>
            <CardDescription className="text-muted-foreground">Gérez vos tâches assignées</CardDescription>
                    </div>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Nouvelle tâche
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tasksList.map((task) => (
              <Card key={task.id} className="bg-background border-border hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-grow">
                                <div className="flex items-center gap-2">
                        <span className="font-medium text-lg text-foreground">{task.service}</span>
                        <Badge variant={getPriorityBadgeVariant(task.priority)}>
                                    {task.priority}
                                  </Badge>
                                </div>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Client:</span>
                        <span className="text-foreground">{task.client}</span>
                                </div>
                              </div>
                    <div className="flex flex-col md:items-end gap-2 text-sm whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(task.status)} className="self-start md:self-auto">
                                  {task.status}
                                </Badge>
                        <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>{task.deadline}</span>
                                </div>
                        <Button size="sm" variant="ghost" className="mt-1 text-primary hover:text-primary/80 self-start md:self-auto">
                                  <ArrowRight className="h-4 w-4 mr-1" />
                                  Détails
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
            {tasksList.length === 0 && (
                <div className="text-center py-8">
                    <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Aucune tâche assignée pour le moment.</p>
                </div>
            )}
                    </div>
                  </CardContent>
        {tasksList.length > 0 && (
            <CardFooter className="flex justify-center border-t border-border pt-4">
                <Button variant="outline" className="w-full md:w-auto border-border hover:bg-muted text-foreground">
                      Voir toutes les tâches
                    </Button>
                  </CardFooter>
        )}
                </Card>
              </div>
  );

  const renderCalendarTab = () => (
    <Card className="bg-card border-border text-card-foreground">
                <CardHeader>
        <CardTitle className="text-foreground">Calendrier des rendez-vous</CardTitle>
        <CardDescription className="text-muted-foreground">Cette section sera développée ultérieurement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-8 text-center">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2 text-foreground">Module en développement</h3>
          <p className="text-muted-foreground">
                      Le calendrier des rendez-vous sera disponible dans une prochaine mise à jour.
                    </p>
                  </div>
                </CardContent>
              </Card>
  );

  const renderInventoryTab = () => (
    <Card className="bg-card border-border text-card-foreground">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
          <CardTitle className="text-foreground">Inventaire des pièces</CardTitle>
          <CardDescription className="text-muted-foreground">Vérifiez la disponibilité des composants</CardDescription>
                  </div>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Demander un article
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Article</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Quantité</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryItems.map((item) => (
                <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm text-foreground">{item.id}</td>
                  <td className="px-4 py-3 text-foreground">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-foreground">{item.quantity}</td>
                            <td className="px-4 py-3">
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                                {item.status}
                    </Badge>
                            </td>
                            <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">Utiliser</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
  );

  const renderSettingsTab = () => (
    <Card className="bg-card border-border text-card-foreground">
                <CardHeader>
        <CardTitle className="text-foreground">Paramètres du Compte</CardTitle>
        <CardDescription className="text-muted-foreground">Cette section sera développée ultérieurement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-8 text-center">
          <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2 text-foreground">Module en développement</h3>
          <p className="text-muted-foreground">
                      Les paramètres du compte seront disponibles dans une prochaine mise à jour.
                    </p>
                  </div>
                </CardContent>
              </Card>
  );

  const renderProfileTab = () => (
    <Card className="bg-card border-border text-card-foreground">
      <CardHeader>
        <CardTitle className="text-foreground">Mon Profil</CardTitle>
        <CardDescription className="text-muted-foreground">Gérez vos informations personnelles et votre photo de profil.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <ProfilePictureUploader
            userType="technician"
            userId={technicianData.id}
            currentPictureUrl={profilePictureUrl}
            onUploadSuccess={fetchProfilePicture}
            avatarSizeClassName="w-32 h-32 text-4xl"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Informations:</h3>
          <p className="text-muted-foreground"><strong className="text-foreground">Nom:</strong> {technicianData.name} {technicianData.surname}</p>
          <p className="text-muted-foreground"><strong className="text-foreground">Email:</strong> {technicianData.email}</p>
        </div>
      </CardContent>
    </Card>
  );
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Chargement...</p>
      </div>
    );
  }

  const setActiveTabAndCloseSidebar = (tab) => {
    setActiveTab(tab);
    if (isSmallScreen && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const navigationItems = [
    { name: 'Tâches', icon: Wrench, tab: 'taches' },
    { name: 'Calendrier', icon: Calendar, tab: 'calendrier' },
    { name: 'Inventaire', icon: List, tab: 'inventaire' },
  ];

  const Header = () => (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center">
        {isSmallScreen && (
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="mr-2 text-foreground hover:bg-muted">
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        )}
        <h1 className="text-xl font-semibold text-foreground">{pageTitles[activeTab] || "Tableau de Bord Technicien"}</h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Input 
            type="search" 
            placeholder="Rechercher tâches..." 
            className="hidden md:block bg-input border-border placeholder:text-muted-foreground text-sm w-64" 
        />
        <ThemeToggleButton />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full text-foreground hover:bg-muted">
              <Bell className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-popover border-border text-popover-foreground">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border"/>
            <div className="p-4 text-sm text-muted-foreground">
              Aucune nouvelle notification.
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-9 w-9 border-2 border-transparent hover:border-primary transition-colors">
                <AvatarImage src={profilePictureUrl} alt={`${technicianData.name} ${technicianData.surname || ''}`} />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {`${(technicianData.name || 'T').charAt(0)}${(technicianData.surname || '').charAt(0)}`}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover border-border text-popover-foreground">
            <DropdownMenuLabel>
              <p className="font-medium text-foreground">{`${technicianData.name || ''} ${technicianData.surname || ''}`.trim() || "Technicien"}</p>
              <p className="text-xs text-muted-foreground">{technicianData.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={() => setActiveTabAndCloseSidebar('profile')} className="hover:!bg-muted focus:!bg-muted cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveTabAndCloseSidebar('parametres')} className="hover:!bg-muted focus:!bg-muted cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive hover:!bg-destructive/10 hover:!text-destructive focus:!bg-destructive/10 focus:!text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main content */}
              <main className="flex-1 p-4 sm:p-6 space-y-6 pb-24 md:pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsContent value="taches" className="mt-0">
              {renderTasksTab()} 
          </TabsContent>
          <TabsContent value="calendrier" className="mt-0">
              {renderCalendarTab()}
          </TabsContent>
          <TabsContent value="inventaire" className="mt-0">
              {renderInventoryTab()}
          </TabsContent>
          <TabsContent value="parametres" className="mt-0">
              {renderSettingsTab()}
          </TabsContent>
          <TabsContent value="profile" className="mt-0">
              {renderProfileTab()}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Mobile sidebar - only shown when toggled */}
      {isSmallScreen && sidebarOpen && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-50 flex"
        >
          <CollapsibleSidebar 
            userType="technician"
            navigationItems={navigationItems} 
            onNavigate={setActiveTabAndCloseSidebar} 
            currentTab={activeTab}
            profilePictureUrl={profilePictureUrl}
            userName={`${technicianData.name || ''} ${technicianData.surname || ''}`.trim()}
            userEmail={technicianData.email}
            onLogoutClick={handleLogout}
            onProfileClick={() => setActiveTabAndCloseSidebar('profile')}
            onSettingsClick={() => setActiveTabAndCloseSidebar('parametres')}
            onClose={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setSidebarOpen(false)}></div>
        </motion.div>
      )}
      
      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-blue-600 text-white shadow-lg z-[9999]" style={{position: 'fixed', bottom: 0}}>
        <div className="flex justify-around h-16">
          <button 
            onClick={() => setActiveTab('taches')}
            className={`flex flex-col items-center justify-center flex-1 ${activeTab === 'taches' ? 'bg-blue-700' : ''}`}
          >
            <List size={22} />
            <span className="text-xs mt-1">Tâches</span>
          </button>
          <button 
            onClick={() => setActiveTab('calendrier')}
            className={`flex flex-col items-center justify-center flex-1 ${activeTab === 'calendrier' ? 'bg-blue-700' : ''}`}
          >
            <Calendar size={22} />
            <span className="text-xs mt-1">Agenda</span>
          </button>
          <button 
            onClick={() => setActiveTab('inventaire')}
            className={`flex flex-col items-center justify-center flex-1 ${activeTab === 'inventaire' ? 'bg-blue-700' : ''}`}
          >
            <Wrench size={22} />
            <span className="text-xs mt-1">Inventaire</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center flex-1 ${activeTab === 'profile' ? 'bg-blue-700' : ''}`}
          >
            <User size={22} />
            <span className="text-xs mt-1">Profil</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard; 