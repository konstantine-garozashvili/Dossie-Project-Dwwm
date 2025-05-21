import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Users, 
  Settings, 
  Server, 
  LineChart, 
  List, 
  Calendar, 
  Bell, 
  LogOut, 
  Home,
  Search,
  Menu,
  X,
  User
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from '@/components/ui/input';
import ProfilePictureUploader from "@/components/ProfilePictureUploader";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("apercu");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add this new section for admin data
  const [adminData, setAdminData] = useState({
    id: 1, // This should come from localStorage or API
    email: 'admin@it13.com',
    name: 'Admin',
    surname: 'IT13'
  });
  // Initialize with a name-based default avatar to prevent blank display
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent('Admin IT13')}&size=256`
  );

  // Load admin info from localStorage
  useEffect(() => {
    const storedAdminInfo = localStorage.getItem('adminInfo');
    if (storedAdminInfo) {
      try {
        const parsedData = JSON.parse(storedAdminInfo);
        setAdminData(parsedData);
      } catch (err) {
        console.error('Error parsing admin info:', err);
      }
    }
  }, []);

  // Fetch profile picture
  useEffect(() => {
    if (adminData.id) {
      fetchProfilePicture();
    }
  }, [adminData.id]);

  const fetchProfilePicture = async () => {
    // Always set a default avatar immediately to ensure something is displayed
    const defaultAvatar = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent((adminData?.name || '') + ' ' + (adminData?.surname || ''))}`;
    setProfilePictureUrl(defaultAvatar);
    
    // If no ID, don't proceed with API fetch
    if (!adminData.id) return;
    
    try {
      // Make API request with proper headers
      const response = await fetch(`/api/profile/picture/admin/${adminData.id}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      // Handle 404 errors silently, without trying to parse JSON
      if (response.status === 404) {
        // Just keep using the default avatar we already set
        return;
      }
      
      // Check if we got a JSON response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        if (response.ok && data.success) {
          setProfilePictureUrl(data.profilePicture.secureUrl);
        } else if (data.defaultUrl) {
          setProfilePictureUrl(data.defaultUrl);
        }
        // If we get here with an error but no defaultUrl, we'll keep using the default avatar we set earlier
      }
      // If not JSON response, we'll keep using the default avatar we set earlier
    } catch (err) {
      // Silently handle errors - we've already set a default avatar
      // No need to log or show errors when profile picture can't be fetched
    }
  };

  // Vérifier l'authentification
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/adminlog');
    } else {
      // Simuler le chargement des données
      setTimeout(() => {
        setLoading(false);
      }, 800);
    }
  }, [navigate]);

  // Gestion de la taille d'écran pour le responsive
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/adminlog');
  };

  // Données fictives pour le tableau de bord
  const statsData = [
    { title: "Utilisateurs", value: "246", change: "+12%", icon: <Users className="h-5 w-5" /> },
    { title: "Techniciens", value: "38", change: "+5%", icon: <Server className="h-5 w-5" /> },
    { title: "Services", value: "152", change: "+24%", icon: <List className="h-5 w-5" /> },
    { title: "Rendez-vous", value: "57", change: "+9%", icon: <Calendar className="h-5 w-5" /> },
  ];

  const recentRequests = [
    { id: 1, user: "Martin Dupont", service: "Réparation PC", date: "15/05/2023", status: "En attente" },
    { id: 2, user: "Sophie Martin", service: "Récupération de données", date: "14/05/2023", status: "Terminé" },
    { id: 3, user: "Jean Boucher", service: "Installation Windows", date: "12/05/2023", status: "En cours" },
    { id: 4, user: "Marie Lefort", service: "Dépannage réseau", date: "10/05/2023", status: "Terminé" },
    { id: 5, user: "Paul Ricard", service: "Mise à niveau RAM", date: "09/05/2023", status: "Terminé" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "En attente": return "bg-yellow-500/20 text-yellow-400";
      case "En cours": return "bg-blue-500/20 text-blue-400";
      case "Terminé": return "bg-green-500/20 text-green-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <Card key={index} className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                <h3 className="text-xl sm:text-2xl font-bold mt-1">{stat.value}</h3>
                <p className="text-xs text-green-400 mt-2">{stat.change} depuis le mois dernier</p>
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

  const renderRecentRequests = () => (
    <Card className="bg-slate-800 border-slate-700 mt-6">
      <CardHeader>
        <CardTitle>Demandes récentes</CardTitle>
        <CardDescription>Liste des dernières demandes de service</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Client</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Service</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((request) => (
                <tr key={request.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-sm">{request.id}</td>
                  <td className="px-4 py-3">{request.user}</td>
                  <td className="px-4 py-3 text-sm">{request.service}</td>
                  <td className="px-4 py-3 text-sm">{request.date}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost">Voir</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Barre latérale */}
      <motion.aside 
        className={`fixed top-0 left-0 z-40 h-full bg-slate-900 shadow-xl transition-all duration-300 ease-in-out 
                   ${sidebarOpen ? 'w-64' : 'w-0 lg:w-20'} overflow-hidden`}
        initial={isSmallScreen ? { x: -260 } : { x: 0 }}
        animate={sidebarOpen ? { x: 0 } : isSmallScreen ? { x: -260 } : { x: 0 }}
      >
        <div className="h-full flex flex-col justify-between py-5">
          <div>
            <div className={`flex items-center px-6 mb-8 ${!sidebarOpen && 'lg:justify-center'}`}>
              <div className="text-2xl font-bold text-cyan-400">IT13</div>
              {sidebarOpen && <div className="ml-2 text-xl font-semibold">Admin</div>}
            </div>
            
            <nav className="px-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="flex flex-col space-y-1 w-full bg-transparent">
                  <TabsTrigger 
                    value="apercu"
                    className={`flex justify-start px-3 py-2 hover:bg-slate-800/80 transition-colors ${!sidebarOpen && 'lg:justify-center'}`}
                  >
                    <Home className="mr-3 h-5 w-5" />
                    {sidebarOpen && <span>Aperçu</span>}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="profile"
                    className={`flex justify-start px-3 py-2 hover:bg-slate-800/80 transition-colors ${!sidebarOpen && 'lg:justify-center'}`}
                  >
                    <User className="mr-3 h-5 w-5" />
                    {sidebarOpen && <span>Profil</span>}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="utilisateurs"
                    className={`flex justify-start px-3 py-2 hover:bg-slate-800/80 transition-colors ${!sidebarOpen && 'lg:justify-center'}`}
                  >
                    <Users className="mr-3 h-5 w-5" />
                    {sidebarOpen && <span>Utilisateurs</span>}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="services"
                    className={`flex justify-start px-3 py-2 hover:bg-slate-800/80 transition-colors ${!sidebarOpen && 'lg:justify-center'}`}
                  >
                    <Server className="mr-3 h-5 w-5" />
                    {sidebarOpen && <span>Services</span>}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="rapports"
                    className={`flex justify-start px-3 py-2 hover:bg-slate-800/80 transition-colors ${!sidebarOpen && 'lg:justify-center'}`}
                  >
                    <LineChart className="mr-3 h-5 w-5" />
                    {sidebarOpen && <span>Rapports</span>}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="parametres"
                    className={`flex justify-start px-3 py-2 hover:bg-slate-800/80 transition-colors ${!sidebarOpen && 'lg:justify-center'}`}
                  >
                    <Settings className="mr-3 h-5 w-5" />
                    {sidebarOpen && <span>Paramètres</span>}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </nav>
          </div>
          
          <div className="px-3">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              {sidebarOpen && <span>Déconnexion</span>}
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Contenu principal */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Barre de navigation supérieure */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 px-4 h-16 flex justify-between items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold">
              {activeTab === 'apercu' && "Tableau de Bord"}
              {activeTab === 'profile' && "Mon Profil"}
              {activeTab === 'utilisateurs' && "Gestion des Utilisateurs"}
              {activeTab === 'services' && "Gestion des Services"}
              {activeTab === 'rapports' && "Rapports & Statistiques"}
              {activeTab === 'parametres' && "Paramètres du Système"}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Rechercher..." 
                className="pl-9 bg-slate-800 border-slate-700 w-60" 
              />
            </div>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-cyan-500"></span>
            </Button>
            
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 bg-slate-700">
                <AvatarImage 
                  src={profilePictureUrl} 
                  alt="Photo de profil"
                />
                <AvatarFallback className="bg-slate-700 text-xl">
                  {adminData && adminData.name ? adminData.name[0].toUpperCase() : 'A'}
                  {adminData && adminData.surname ? adminData.surname[0].toUpperCase() : 'D'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-sm font-medium">
                  {adminData?.name || ''} {adminData?.surname || ''}
                </div>
                <div className="text-xs text-gray-400">{adminData?.email || ''}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu du tableau de bord */}
        <main className="p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="apercu" className="mt-0">
              <div className="space-y-6">
                {renderStatsCards()}
                {renderRecentRequests()}
              </div>
            </TabsContent>

            <TabsContent value="profile" className="p-0">
              <div className="p-4 lg:p-8">
                <h2 className="text-2xl font-bold mb-6">Profil Administrateur</h2>
                
                <div className="bg-slate-800 rounded-lg p-6 md:p-8 border border-slate-700">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <ProfilePictureUploader 
                      userType="admin"
                      userId={adminData.id}
                      name={`${adminData.name} ${adminData.surname}`}
                      onProfilePictureChange={(url) => setProfilePictureUrl(url)}
                    />
                    
                    <div className="flex flex-col gap-6 flex-1">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Informations personnelles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Prénom</label>
                            <div className="bg-slate-700 p-3 rounded-md">{adminData.name}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Nom</label>
                            <div className="bg-slate-700 p-3 rounded-md">{adminData.surname}</div>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                            <div className="bg-slate-700 p-3 rounded-md">{adminData.email}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Sécurité</h3>
                        <Button className="bg-cyan-600 hover:bg-cyan-700">
                          Changer le mot de passe
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="utilisateurs" className="mt-0">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Gestion des Utilisateurs</CardTitle>
                  <CardDescription>Cette section sera développée ultérieurement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-8 text-center">
                    <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">Module en développement</h3>
                    <p className="text-gray-400">
                      La gestion des utilisateurs sera disponible dans une prochaine mise à jour.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="mt-0">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Gestion des Services</CardTitle>
                  <CardDescription>Cette section sera développée ultérieurement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-8 text-center">
                    <Server className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">Module en développement</h3>
                    <p className="text-gray-400">
                      La gestion des services sera disponible dans une prochaine mise à jour.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rapports" className="mt-0">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Rapports & Statistiques</CardTitle>
                  <CardDescription>Cette section sera développée ultérieurement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-8 text-center">
                    <LineChart className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">Module en développement</h3>
                    <p className="text-gray-400">
                      Les rapports et statistiques seront disponibles dans une prochaine mise à jour.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="parametres" className="mt-0">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Paramètres du Système</CardTitle>
                  <CardDescription>Cette section sera développée ultérieurement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-8 text-center">
                    <Settings className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">Module en développement</h3>
                    <p className="text-gray-400">
                      Les paramètres du système seront disponibles dans une prochaine mise à jour.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 