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
import { Tabs, TabsContent } from "@/components/ui/tabs";
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
import BottomDockNavigation from '@/components/SidebarNavigation';
import { PROFILE_ENDPOINTS } from '@/config/api';

// Define pageTitles mapping here for better organization
const pageTitles = {
  apercu: "Tableau de Bord",
  utilisateurs: "Gestion des Utilisateurs",
  services: "Gestion des Services",
  rapports: "Rapports et Analyses",
  parametres: "Paramètres du Compte",
  profile: "Mon Profil",
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("apercu");
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState({
    id: null, // Initialize with null, fetch from localStorage or API
    email: '',
    name: '',
    surname: ''
  });
  const [profilePictureUrl, setProfilePictureUrl] = useState('');

  useEffect(() => {
    const storedAdminInfo = localStorage.getItem('adminInfo');
    if (storedAdminInfo) {
      try {
        const parsedData = JSON.parse(storedAdminInfo);
        setAdminData(parsedData);
        // Set initial avatar based on fetched name
        setProfilePictureUrl(
          `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent((parsedData.name || 'A') + ' ' + (parsedData.surname || 'D'))}&size=256`
        );
      } catch (err) {
        console.error('Error parsing admin info:', err);
        // Fallback if parsing fails
        setProfilePictureUrl(
          `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=Admin+User&size=256`
        );
      }
    } else {
      // Fallback if no adminInfo in localStorage
      setProfilePictureUrl(
        `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=Admin+User&size=256`
      );
    }
  }, []);

  useEffect(() => {
    if (adminData && adminData.id) {
      fetchProfilePicture();
    }
  }, [adminData]);

  const fetchProfilePicture = async () => {
    const uiAvatarUrl = `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent((adminData?.name || 'A') + ' ' + (adminData?.surname || 'D'))}&size=256`;
    setProfilePictureUrl(uiAvatarUrl); // Set UI Avatars URL immediately

    if (!adminData.id) return;

    try {
      const response = await fetch(PROFILE_ENDPOINTS.GET_PICTURE('admin', adminData.id), {
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
            setProfilePictureUrl(uiAvatarUrl); // Revert to UI Avatars if fake URL detected
          } else {
            setProfilePictureUrl(data.profilePicture.secureUrl);
          }
        } else if (data.defaultUrl) {
          if (data.defaultUrl.includes('fake-cloudinary.com')) {
            setProfilePictureUrl(uiAvatarUrl); // Revert to UI Avatars if fake URL detected
          } else {
            setProfilePictureUrl(data.defaultUrl);
          }
        }
        // If no valid URL and no default, uiAvatarUrl is already set
      }
    } catch (err) {
      // Keep UI Avatars URL on error, already set
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/adminlog');
    } else {
      // Simulate loading
      setTimeout(() => setLoading(false), 500);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/adminlog');
  };

  // Placeholder data (keep as is, or integrate with backend later)
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

  const renderContent = () => {
    switch (activeTab) {
      case "apercu":
        return (
          <>
            {renderStatsCards()}
            {renderRecentRequests()}
          </>
        );
      case "utilisateurs":
        return <div className="text-white">Contenu de la gestion des utilisateurs</div>;
      case "services":
        return <div className="text-white">Contenu de la gestion des services</div>;
      case "rapports":
        return <div className="text-white">Contenu des rapports et analyses</div>;
      case "parametres":
        return <div className="text-white">Contenu des paramètres du compte</div>;
      case "profile":
        return (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Mon Profil</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfilePictureUploader 
                userType="admin" 
                userId={adminData.id} 
                currentPictureUrl={profilePictureUrl} 
                onUploadSuccess={fetchProfilePicture} 
              />
              <div className="mt-6 space-y-2">
                <p><strong className="font-medium text-gray-300">Nom:</strong> {adminData.name}</p>
                <p><strong className="font-medium text-gray-300">Prénom:</strong> {adminData.surname}</p>
                <p><strong className="font-medium text-gray-300">Email:</strong> {adminData.email}</p>
                {/* Add more profile details here as needed */}
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
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
      <div 
        className="flex-1 flex flex-col pb-20" // Added pb-20, removed margin logic for sidebar
      >
        {/* Header - Hamburger menu button removed */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 backdrop-blur-sm sm:px-6">
          <div className="flex items-center">
            {/* Hamburger button removed */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="lg:hidden mr-2 text-white hover:bg-slate-700"
              onClick={toggleSidebar} // toggleSidebar is removed
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button> */}
            <h1 className="text-xl font-semibold">{pageTitles[activeTab] || "Tableau de Bord"}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* ... (Search, Bell, User Dropdown remain the same) ... */}
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
                    <AvatarImage src={profilePictureUrl} alt="Admin Profile" />
                    <AvatarFallback>{((adminData?.name?.[0] || '') + (adminData?.surname?.[0] || '')).toUpperCase() || 'AD'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700 text-white" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{adminData.name} {adminData.surname}</p>
                    <p className="text-xs leading-none text-gray-400">{adminData.email}</p>
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
            <TabsContent value="apercu" className="mt-0">
              {renderStatsCards()}
              {renderRecentRequests()}
            </TabsContent>
            <TabsContent value="utilisateurs" className="mt-0">
              {/* Placeholder - Replace with actual component */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader><CardTitle>Gestion des Utilisateurs</CardTitle></CardHeader>
                <CardContent><p>Contenu pour la gestion des utilisateurs...</p></CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="services" className="mt-0">
               {/* Placeholder - Replace with actual component */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader><CardTitle>Gestion des Services</CardTitle></CardHeader>
                <CardContent><p>Contenu pour la gestion des services...</p></CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="rapports" className="mt-0">
              {/* Placeholder - Replace with actual component */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader><CardTitle>Rapports et Analyses</CardTitle></CardHeader>
                <CardContent><p>Contenu pour les rapports et analyses...</p></CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="parametres" className="mt-0">
              {/* Placeholder - Replace with actual component */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader><CardTitle>Paramètres du Compte</CardTitle></CardHeader>
                <CardContent><p>Contenu pour les paramètres du compte...</p></CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="profile" className="mt-0">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Mon Profil</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProfilePictureUploader 
                    userType="admin" 
                    userId={adminData.id} 
                    currentPictureUrl={profilePictureUrl} 
                    onUploadSuccess={fetchProfilePicture} 
                  />
                  <div className="mt-6 space-y-2">
                    <p><strong className="font-medium text-gray-300">Nom:</strong> {adminData.name}</p>
                    <p><strong className="font-medium text-gray-300">Prénom:</strong> {adminData.surname}</p>
                    <p><strong className="font-medium text-gray-300">Email:</strong> {adminData.email}</p>
                    {/* Add more profile details here as needed */}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Bottom Dock Navigation */}
      <BottomDockNavigation 
        userType="admin"
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
      />
    </div>
  );
};

export default AdminDashboard; 