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
      <CardHeader><CardTitle>Mon Profil Technicien</CardTitle></CardHeader>
      <CardContent>
        <ProfilePictureUploader 
          userType="technician" 
          userId={technicianData.id} 
          currentPictureUrl={profilePictureUrl} 
          onUploadSuccess={fetchProfilePicture} 
        />
        <div className="mt-6 space-y-2">
          <p><strong className="font-medium text-gray-300">Nom:</strong> {technicianData.name}</p>
          <p><strong className="font-medium text-gray-300">Email:</strong> {technicianData.email}</p>
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      {/* Main content area - flex-1 to take available space, pb-20 for bottom dock */}
      <div className="flex-1 flex flex-col pb-20">
        {/* Header - Hamburger menu button removed */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center">
            {/* Hamburger button removed */}
            <h1 className="text-xl font-semibold">{pageTitles[activeTab] || "Tableau de Bord Technicien"}</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Search, Bell, User Dropdown remain the same as AdminDashboard potentially */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="w-full rounded-md bg-slate-800 pl-10 pr-4 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500 border-slate-700"
              />
            </div>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profilePictureUrl} alt={`${technicianData.name || 'Tech'} Profile`} />
                    <AvatarFallback>{(technicianData.name?.[0] || 'T').toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700 text-white" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{technicianData.name}</p>
                    <p className="text-xs leading-none text-gray-400">{technicianData.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem 
                  className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                  onClick={() => setActiveTab('profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Mon Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                  onClick={() => setActiveTab('parametres')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700"/>
                <DropdownMenuItem 
                  className="text-red-400 hover:bg-red-900/30 focus:bg-red-900/30 focus:text-red-300 hover:text-red-300 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content based on activeTab */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Render content based on activeTab - ensure all placeholder functions are defined */}
            <TabsContent value="taches" className="mt-0">
              {renderStatsCards()} 
              {renderTasksList()} 
            </TabsContent>
            <TabsContent value="calendrier" className="mt-0">
              {renderCalendarContent()} 
            </TabsContent>
            <TabsContent value="inventaire" className="mt-0">
              {renderInventory()} 
            </TabsContent>
            <TabsContent value="parametres" className="mt-0">
              {renderSettingsContent()} 
            </TabsContent>
            <TabsContent value="profile" className="mt-0">
              {renderProfileContent()} 
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Bottom Dock Navigation */}
      <BottomDockNavigation 
        userType="technician"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />
    </div>
  );
};

export default TechnicianDashboard; 