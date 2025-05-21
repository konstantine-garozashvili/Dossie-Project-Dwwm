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
  User
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ProfilePictureUploader from "@/components/ProfilePictureUploader";
import BottomDockNavigation from '@/components/SidebarNavigation';
import CollapsibleSidebar from '@/components/CollapsibleSidebar';
import useResponsive from '@/hooks/useResponsive';
import { PROFILE_ENDPOINTS } from '@/config/api';

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
    name: ''
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
          `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(parsedData.name || 'Tech')}&size=256`
        );
      } catch (err) {
        console.error('Error parsing technician info:', err);
        setProfilePictureUrl(
          `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=Technicien&size=256`
        );
      }
    } else {
      setProfilePictureUrl(
        `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=Technicien&size=256`
      );
    }
  }, []);

  useEffect(() => {
    if (technicianData.id) {
      fetchProfilePicture();
    }
  }, [technicianData.id]);

  const fetchProfilePicture = async () => {
    const uiAvatarUrl = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(technicianData.name || 'User')}&size=256`;
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
        if (response.ok && data.success && data.profilePicture?.secureUrl) {
          if (data.profilePicture.secureUrl.includes('fake-cloudinary.com')) {
            setProfilePictureUrl(uiAvatarUrl);
          } else {
            setProfilePictureUrl(data.profilePicture.secureUrl);
          }
        } else if (data.defaultUrl) {
          if (data.defaultUrl.includes('fake-cloudinary.com')) {
            setProfilePictureUrl(uiAvatarUrl);
          } else {
            setProfilePictureUrl(data.defaultUrl);
          }
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
    setTechnicianData({ id: null, email: '', name: '' });
    setProfilePictureUrl('');
    navigate('/techlog');
  };

  // Données fictives pour le tableau de bord
  const statsData = [
    { title: "Tâches en attente", value: "12", change: "+3 aujourd'hui", icon: <Clock className="h-5 w-5" /> },
    { title: "Tâches terminées", value: "158", change: "+8 cette semaine", icon: <CheckCircle className="h-5 w-5" /> },
    { title: "Temps moyen", value: "4.2h", change: "-15% ce mois", icon: <Calendar className="h-5 w-5" /> },
    { title: "Satisfaction", value: "4.8/5", change: "+0.3 ce mois", icon: <Star className="h-5 w-5" /> },
  ];

  const tasksList = [
    { 
      id: 1, 
      client: "Martin Dupont", 
      service: "Réparation PC Portable", 
      priority: "Haute", 
      deadline: "Aujourd'hui, 17:00", 
      status: "En attente",
      description: "Problème de surchauffe et écran qui s'éteint aléatoirement."
    },
    { 
      id: 2, 
      client: "Sophie Martin", 
      service: "Récupération de données", 
      priority: "Urgente", 
      deadline: "Aujourd'hui, 15:30", 
      status: "En cours",
      description: "Disque dur externe ne s'allume plus. Données professionnelles importantes."
    },
    { 
      id: 3, 
      client: "Jean Boucher", 
      service: "Installation Windows", 
      priority: "Normale", 
      deadline: "Demain, 12:00", 
      status: "En attente",
      description: "Formatage et installation Windows 11 sur nouveau SSD."
    },
    { 
      id: 4, 
      client: "Marie Lefort", 
      service: "Dépannage réseau", 
      priority: "Basse", 
      deadline: "18/05/2023", 
      status: "Planifiée",
      description: "Configuration Wi-Fi et imprimante réseau pour bureau à domicile."
    },
    { 
      id: 5, 
      client: "Paul Ricard", 
      service: "Mise à niveau RAM", 
      priority: "Normale", 
      deadline: "19/05/2023", 
      status: "Planifiée",
      description: "Augmenter la RAM de 8GB à 32GB sur PC de bureau pour travail graphique."
    },
  ];

  const inventoryItems = [
    { id: 1, name: "SSD 500GB Samsung", quantity: 8, status: "En stock" },
    { id: 2, name: "RAM DDR4 8GB", quantity: 12, status: "En stock" },
    { id: 3, name: "Batterie HP ProBook", quantity: 2, status: "En stock" },
    { id: 4, name: "Écran LCD 15.6\" Lenovo", quantity: 1, status: "Stock faible" },
    { id: 5, name: "Carte graphique GTX 1650", quantity: 0, status: "Rupture" }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Urgente": return "bg-red-500/20 text-red-400";
      case "Haute": return "bg-orange-500/20 text-orange-400";
      case "Normale": return "bg-blue-500/20 text-blue-400";
      case "Basse": return "bg-green-500/20 text-green-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "En attente": return "bg-yellow-500/20 text-yellow-400";
      case "En cours": return "bg-blue-500/20 text-blue-400";
      case "Terminé": return "bg-green-500/20 text-green-400";
      case "Planifiée": return "bg-purple-500/20 text-purple-400";
      case "Rupture": return "bg-red-500/20 text-red-400";
      case "Stock faible": return "bg-orange-500/20 text-orange-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <Card key={index} className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                <p className="text-xs text-cyan-400 mt-2">{stat.change}</p>
              </div>
              <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-400">
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTasksList = () => (
    <Card className="bg-slate-800 border-slate-700 mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tâches Actives</CardTitle>
          <CardDescription>Gérez vos tâches assignées</CardDescription>
        </div>
        <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">
          Nouvelle tâche
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasksList.map((task) => (
            <Card key={task.id} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg">{task.service}</span>
                      <Badge className={`${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{task.description}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">Client:</span>
                      <span>{task.client}</span>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 md:items-center">
                    <Badge className={`${getStatusColor(task.status)}`}>
                      {task.status}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{task.deadline}</span>
                    </div>
                    <Button size="sm" variant="ghost" className="mt-2 md:mt-0">
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-slate-700 pt-4">
        <Button variant="outline" className="w-full md:w-auto border-slate-600">
          Voir toutes les tâches
        </Button>
      </CardFooter>
    </Card>
  );

  const renderInventory = () => (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Inventaire des pièces</CardTitle>
          <CardDescription>Vérifiez la disponibilité des composants</CardDescription>
        </div>
        <Button size="sm" className="bg-cyan-500 hover:bg-cyan-600">
          Demander un article
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Article</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Quantité</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item) => (
                <tr key={item.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-sm">{item.id}</td>
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3 text-sm">{item.quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost">Utiliser</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  const renderCalendarContent = () => (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle>Calendrier des rendez-vous</CardTitle>
        <CardDescription>Cette section sera développée ultérieurement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-8 text-center">
          <Calendar className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Module en développement</h3>
          <p className="text-gray-400">
            Le calendrier des rendez-vous sera disponible dans une prochaine mise à jour.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderSettingsContent = () => (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle>Paramètres du Compte</CardTitle>
        <CardDescription>Cette section sera développée ultérieurement</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-8 text-center">
          <Settings className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Module en développement</h3>
          <p className="text-gray-400">
            Les paramètres du compte seront disponibles dans une prochaine mise à jour.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderProfileContent = () => (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle>Mon Profil</CardTitle>
        <CardDescription>Gérez vos informations personnelles et votre photo de profil.</CardDescription>
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
          <h3 className="text-lg font-semibold">Informations:</h3>
          <p><strong>Nom:</strong> {technicianData.name}</p>
          <p><strong>Email:</strong> {technicianData.email}</p>
          {/* Add more profile fields here */}
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "taches":
        return (
          <>
            {renderStatsCards()}
            {renderTasksList()}
          </>
        );
      case "calendrier": return renderCalendarContent();
      case "inventaire": return renderInventory();
      case "parametres": return renderSettingsContent();
      case "profile": return renderProfileContent();
      default: return <div className="text-white">Contenu non disponible.</div>;
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        <p className="ml-4 text-lg">Chargement...</p>
      </div>
    );
  }

  const currentTitle = pageTitles[activeTab] || "Tableau de Bord Technicien";

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Navigation: Render based on screen size */}
      {isSmallScreen ? (
        <CollapsibleSidebar
          userType="technician"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          handleLogout={handleLogout}
        />
      ) : (
        <BottomDockNavigation
          userType="technician"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
        />
      )}

      {/* Header */}
      <header className={`sticky top-0 z-30 bg-slate-800/80 backdrop-blur-md shadow-lg border-b border-slate-700 flex items-center justify-between p-4 h-20
                         ${isSmallScreen && sidebarOpen ? 'ml-0' : 'ml-0'} 
                         ${!isSmallScreen ? 'mb-0' : ''}
                         transition-all duration-300 ease-in-out`}>
        <div className="flex items-center">
          {isSmallScreen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-4 text-slate-300 hover:text-cyan-400"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          )}
          <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
            {currentTitle}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Input 
            type="search" 
            placeholder="Rechercher tâches..." 
            className="hidden md:block bg-slate-700 border-slate-600 placeholder-slate-400 text-sm w-64" 
          />
          <Button variant="ghost" size="icon" className="text-slate-300 hover:text-cyan-400">
            <Bell className="h-6 w-6" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9 border-2 border-transparent hover:border-cyan-400 transition-colors">
                  <AvatarImage src={profilePictureUrl} alt={technicianData.name || "Technicien"} />
                  <AvatarFallback>
                    {technicianData.name ? technicianData.name.charAt(0).toUpperCase() : 'T'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700 text-slate-200" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{technicianData.name}</p>
                  <p className="text-xs leading-none text-slate-400">{technicianData.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem 
                className="hover:bg-slate-700/70 focus:bg-slate-700/70 cursor-pointer"
                onClick={() => setActiveTab('profile')}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="hover:bg-slate-700/70 focus:bg-slate-700/70 cursor-pointer"
                onClick={() => setActiveTab('parametres')}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem 
                className="text-red-400 hover:!text-red-300 hover:!bg-red-900/30 focus:bg-red-900/30 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`flex-grow p-4 sm:p-6 transition-all duration-300 ease-in-out
                       ${isSmallScreen ? 'ml-0' : 'pb-20'}
                       ${isSmallScreen ? 'pt-4' : 'pt-6'}`}> 
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="taches" className="h-full">
            {renderContent()}
          </TabsContent>
          <TabsContent value="calendrier">
            {renderContent()}
          </TabsContent>
          <TabsContent value="inventaire">
            {renderContent()}
          </TabsContent>
          <TabsContent value="parametres">
            {renderContent()}
          </TabsContent>
          <TabsContent value="profile">
            {renderProfileContent()}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TechnicianDashboard; 