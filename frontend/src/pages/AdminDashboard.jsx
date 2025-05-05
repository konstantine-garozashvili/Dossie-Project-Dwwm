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
  X
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from '@/components/ui/input';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("apercu");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [loading, setLoading] = useState(true);

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
              <div className="text-2xl font-bold text-cyan-400">DWWM</div>
              {sidebarOpen && <div className="ml-2 text-xl font-semibold">Admin</div>}
            </div>
            
            <nav className="px-3">
              <ul className="space-y-1">
                <li>
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-start ${activeTab === 'apercu' ? 'bg-slate-800' : ''}`}
                    onClick={() => setActiveTab('apercu')}
                  >
                    <Home className="mr-3 h-5 w-5" />
                    {sidebarOpen && <span>Aperçu</span>}
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="ghost"
                    className={`w-full justify-start ${activeTab === 'utilisateurs' ? 'bg-slate-800' : ''}`}
                    onClick={() => setActiveTab('utilisateurs')}
                  >
                    <Users className="mr-3 h-5 w-5" />
                    {sidebarOpen && <span>Utilisateurs</span>}
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="ghost"
                    className={`w-full justify-start ${activeTab === 'services' ? 'bg-slate-800' : ''}`}
                    onClick={() => setActiveTab('services')}
                  >
                    <Server className="mr-3 h-5 w-5" />
                    {sidebarOpen && <span>Services</span>}
                  </Button>
                </li>
                <li>
                  <Button 
                    variant="ghost"
                    className={`w-full justify-start ${activeTab === 'rapports' ? 'bg-slate-800' : ''}`}
                    onClick={() => setActiveTab('rapports')}
                  >
                    <LineChart className="mr-3 h-5 w-5" />
                    {sidebarOpen && <span>Rapports</span>}
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
              {activeTab === 'apercu' && "Tableau de Bord"}
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
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <span className="text-sm font-medium">AD</span>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium">Admin DWWM</div>
                <div className="text-xs text-gray-400">admin@dwwm.com</div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu du tableau de bord */}
        <main className="p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="apercu" className="mt-0">
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

                {/* Demandes récentes */}
                <Card className="bg-slate-800 border-slate-700">
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