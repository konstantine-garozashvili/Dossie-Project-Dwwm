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
import CollapsibleSidebar from '@/components/CollapsibleSidebar';
import useResponsive from '@/hooks/useResponsive';
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
  const isSmallScreen = useResponsive(); // Hook for responsive behavior
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for sidebar

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
    setAdminData({ id: null, email: '', name: '', surname: '' }); // Clear admin data
    setProfilePictureUrl(''); // Clear profile picture
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

  const currentTitle = pageTitles[activeTab] || "Tableau de Bord";

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Navigation: Render based on screen size */}
      {isSmallScreen ? (
        <CollapsibleSidebar
          userType="admin"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          handleLogout={handleLogout}
        />
      ) : (
        <BottomDockNavigation
          userType="admin"
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
          <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            {currentTitle}
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Input 
            type="search" 
            placeholder="Rechercher..." 
            className="hidden md:block bg-slate-700 border-slate-600 placeholder-slate-400 text-sm w-64" 
          />
          <Button variant="ghost" size="icon" className="text-slate-300 hover:text-cyan-400">
            <Bell className="h-6 w-6" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9 border-2 border-transparent hover:border-cyan-400 transition-colors">
                  <AvatarImage src={profilePictureUrl} alt={adminData.name || "Admin"} />
                  <AvatarFallback>
                    {adminData.name ? adminData.name.charAt(0).toUpperCase() : 'A'}
                    {adminData.surname ? adminData.surname.charAt(0).toUpperCase() : 'D'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700 text-slate-200" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{adminData.name} {adminData.surname}</p>
                  <p className="text-xs leading-none text-slate-400">{adminData.email}</p>
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
          <TabsContent value="apercu" className="h-full">
            {renderContent()}
          </TabsContent>
          <TabsContent value="utilisateurs">
            {renderContent()}
          </TabsContent>
          <TabsContent value="services">
            {renderContent()}
          </TabsContent>
          <TabsContent value="rapports">
            {renderContent()}
          </TabsContent>
          <TabsContent value="parametres">
            {renderContent()}
          </TabsContent>
          <TabsContent value="profile">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle>Mon Profil</CardTitle>
                <CardDescription>Gérez vos informations personnelles et votre photo de profil.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <ProfilePictureUploader
                    userType="admin"
                    userId={adminData.id}
                    currentPictureUrl={profilePictureUrl}
                    onUploadSuccess={fetchProfilePicture}
                    avatarSizeClassName="w-32 h-32 text-4xl"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Informations:</h3>
                  <p><strong>Nom:</strong> {adminData.name} {adminData.surname}</p>
                  <p><strong>Email:</strong> {adminData.email}</p>
                  {/* Add more profile fields and edit functionality here */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard; 