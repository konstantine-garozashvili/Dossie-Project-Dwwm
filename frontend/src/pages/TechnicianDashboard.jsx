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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("taches");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add technician data state
  const [technicianData, setTechnicianData] = useState({
    id: null,
    email: '',
    name: ''
  });
  // Initialize with a name-based default avatar to prevent blank display
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=Tech&size=256`
  );

  // Load technician info from localStorage
  useEffect(() => {
    const storedTechInfo = localStorage.getItem('technicianInfo');
    if (storedTechInfo) {
      try {
        const parsedData = JSON.parse(storedTechInfo);
        setTechnicianData(parsedData);
      } catch (err) {
        console.error('Error parsing technician info:', err);
      }
    }
  }, []);

  // Fetch profile picture
  useEffect(() => {
    if (technicianData.id) {
      fetchProfilePicture();
    }
  }, [technicianData.id]);

  const fetchProfilePicture = async () => {
    // Always set a default avatar immediately to ensure something is displayed
    const defaultAvatar = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(technicianData.name || 'User')}`;
    setProfilePictureUrl(defaultAvatar);
    
    // If no ID, don't proceed with API fetch
    if (!technicianData.id) return;
    
    try {
      // Make API request with proper headers
      const response = await fetch(`/api/profile/picture/technician/${technicianData.id}`, {
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
    const token = localStorage.getItem('technicianToken');
    const techInfo = localStorage.getItem('technicianInfo');
    
    if (!token || !techInfo) {
      navigate('/techlog');
      return;
    }
    
    // Simuler le chargement des données
    setTimeout(() => {
      setLoading(false);
    }, 800);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

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
              {sidebarOpen && <div className="ml-2 text-xl font-semibold">Technicien</div>}
            </div>
            
            <nav className="px-3">
              <ul className="space-y-1">
                <li>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start ${activeTab === 'taches' ? 'bg-slate-800' : ''}`}
                    onClick={() => setActiveTab('taches')}
                  >
                    <List className="mr-3 h-5 w-5" />
                    {sidebarOpen && <span>Mes Tâches</span>}
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="ghost"
                    className={`w-full justify-start ${activeTab === 'calendrier' ? 'bg-slate-800' : ''}`}
                    onClick={() => setActiveTab('calendrier')}
                  >
                    <Calendar className="mr-3 h-5 w-5" />
                    {sidebarOpen && <span>Calendrier</span>}
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="ghost"
                    className={`w-full justify-start ${activeTab === 'inventaire' ? 'bg-slate-800' : ''}`}
                    onClick={() => setActiveTab('inventaire')}
                  >
                    <Wrench className="mr-3 h-5 w-5" />
                    {sidebarOpen && <span>Inventaire</span>}
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="ghost"
                    className={`w-full justify-start ${activeTab === 'parametres' ? 'bg-slate-800' : ''}`}
                    onClick={() => setActiveTab('parametres')}
                  >
                    <Settings className="mr-3 h-5 w-5" />
                    {sidebarOpen && <span>Paramètres</span>}
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start ${activeTab === 'profile' ? 'bg-slate-800' : ''}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <User className="mr-3 h-5 w-5" />
                    {sidebarOpen && <span>Mon Profil</span>}
                  </Button>
                </li>
              </ul>
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
              {activeTab === 'taches' && "Mes Tâches"}
              {activeTab === 'calendrier' && "Calendrier"}
              {activeTab === 'inventaire' && "Inventaire"}
              {activeTab === 'parametres' && "Paramètres"}
              {activeTab === 'profile' && "Mon Profil"}
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
                  {technicianData.name ? technicianData.name.substring(0, 2).toUpperCase() : 'TT'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-sm font-medium">{technicianData.name}</div>
                <div className="text-xs text-gray-400">{technicianData.email}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu du tableau de bord */}
        <main className="p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="taches" className="mt-0">
              <div className="space-y-6">
                {/* Statistiques */}
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

                {/* Liste des tâches */}
                <Card className="bg-slate-800 border-slate-700">
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
              </div>
            </TabsContent>

            <TabsContent value="calendrier" className="mt-0">
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
            </TabsContent>

            <TabsContent value="inventaire" className="mt-0">
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
            </TabsContent>

            <TabsContent value="parametres" className="mt-0">
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
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <div className="p-4 lg:p-8">
                <h2 className="text-2xl font-bold mb-6">Mon Profil</h2>
                
                <div className="bg-slate-800 rounded-lg p-6 md:p-8 border border-slate-700">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <ProfilePictureUploader 
                      userType="technician"
                      userId={technicianData.id}
                      name={technicianData.name}
                      onProfilePictureChange={(url) => setProfilePictureUrl(url)}
                    />
                    
                    <div className="flex flex-col gap-6 flex-1">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Informations personnelles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Nom complet</label>
                            <div className="bg-slate-700 p-3 rounded-md">{technicianData.name}</div>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                            <div className="bg-slate-700 p-3 rounded-md">{technicianData.email}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Compétences techniques</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-slate-700">Réparation PC</Badge>
                          <Badge className="bg-slate-700">Installation Windows</Badge>
                          <Badge className="bg-slate-700">Récupération de données</Badge>
                          <Badge className="bg-slate-700">Configuration réseau</Badge>
                          <Badge className="bg-slate-700">Dépannage matériel</Badge>
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
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default TechnicianDashboard; 