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
  User,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from '@/components/ui/input';
import ProfilePictureUploader from "@/components/ProfilePictureUploader";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import BottomDockNavigation from '@/components/SidebarNavigation';
import CollapsibleSidebar from '@/components/CollapsibleSidebar';
import useResponsive from '@/hooks/useResponsive';
import { PROFILE_ENDPOINTS } from '@/config/api';
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Admin specific components
import TechnicianTable from '@/components/admin/TechnicianTable';
import TechnicianFormDialog from '@/components/admin/TechnicianFormDialog';
import TechnicianDetailsDialog from '@/components/admin/TechnicianDetailsDialog';

// Define pageTitles mapping here for better organization
const pageTitles = {
  apercu: "Tableau de Bord",
  techniciens: "Gestion des Techniciens",
  services: "Gestion des Services",
  rapports: "Rapports et Analyses",
  parametres: "Paramètres du Compte",
  profile: "Mon Profil",
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  // State for Technicians CRUD
  const [technicians, setTechnicians] = useState([]);
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false);
  const [technicianError, setTechnicianError] = useState(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [currentTechnician, setCurrentTechnician] = useState(null); // For editing or viewing details
  const [isSubmittingForm, setIsSubmittingForm] = useState(false); // For form submission loading state

  // Pagination and Filtering State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTechnicians, setTotalTechnicians] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // e.g., 'active', 'inactive'
  const [limitPerPage, setLimitPerPage] = useState(10);

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

  // Fetch technicians function
  const fetchTechnicians = async (page = currentPage, limit = limitPerPage, search = searchTerm, status = statusFilter) => {
    setIsLoadingTechnicians(true);
    setTechnicianError(null);
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      toast({ title: "Erreur d'authentification", description: "Veuillez vous reconnecter.", variant: "destructive" });
      setIsLoadingTechnicians(false);
      navigate('/adminlog');
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) queryParams.append('search', search);
      if (status && status !== '_all_') queryParams.append('status', status);

      const response = await fetch(`/api/admin/technicians?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Erreur lors de la récupération des techniciens." }));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setTechnicians(data.technicians || []);
        setCurrentPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages);
        setTotalTechnicians(data.pagination.total);
      } else {
        throw new Error(data.message || "Échec de la récupération des techniciens.");
      }
    } catch (err) {
      console.error("Fetch technicians error:", err);
      setTechnicianError(err.message);
      setTechnicians([]); // Clear data on error
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsLoadingTechnicians(false);
    }
  };

  // useEffect for initial fetch when 'techniciens' tab is active
  useEffect(() => {
    if (activeTab === 'techniciens') {
      fetchTechnicians(1, limitPerPage, '', ''); // Reset to page 1 and clear filters on tab switch
    } else {
      // Clear technician data and reset pagination when navigating away from the tab
      setTechnicians([]);
      setCurrentPage(1);
      setTotalPages(1);
      setTotalTechnicians(0);
      setSearchTerm('');
      setStatusFilter('');
      setTechnicianError(null);
    }
  }, [activeTab]); // Only re-run if activeTab changes

  // Handlers for Technicians CRUD
  const handleOpenAddForm = () => {
    setCurrentTechnician(null); // Clear any existing data for "Add" mode
    setIsFormDialogOpen(true);
  };

  const handleOpenEditForm = (technician) => {
    setCurrentTechnician(technician);
    setIsFormDialogOpen(true);
  };

  const handleOpenDetails = (technician) => {
    setCurrentTechnician(technician);
    setIsDetailsDialogOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmittingForm(true);
    setTechnicianError(null);
    const adminToken = localStorage.getItem('adminToken');

    const method = currentTechnician ? 'PUT' : 'POST';
    const url = currentTechnician 
      ? `/api/admin/technicians/${currentTechnician.id}` 
      : '/api/admin/technicians';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || (currentTechnician ? "Erreur lors de la mise à jour du technicien." : "Erreur lors de la création du technicien."));
      }

      toast({
        title: currentTechnician ? "Technicien Mis à Jour" : "Technicien Ajouté",
        description: `Le technicien ${formData.name} ${formData.surname} a été ${currentTechnician ? 'mis à jour' : 'ajouté'} avec succès.`,
        variant: "success",
      });
      setIsFormDialogOpen(false);
      fetchTechnicians(currentPage); // Refresh the list, stay on current page if possible
    } catch (err) {
      console.error("Submit technician error:", err);
      setTechnicianError(err.message);
      toast({ title: "Erreur de Soumission", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleDeleteTechnician = async (technicianId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce technicien ? Cette action est irréversible.")) {
      return;
    }
    setIsLoadingTechnicians(true); // Can use a specific loading state or general table loading
    setTechnicianError(null);
    const adminToken = localStorage.getItem('adminToken');

    try {
      const response = await fetch(`/api/admin/technicians/${technicianId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Accept': 'application/json'
        }
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Erreur lors de la suppression du technicien.");
      }
      toast({
        title: "Technicien Supprimé",
        description: result.message || "Le technicien a été supprimé avec succès.",
        variant: "success",
      });
      // If current page becomes empty after deletion, try to go to previous page or first page
      if (technicians.length === 1 && currentPage > 1) {
        fetchTechnicians(currentPage - 1);
      } else {
        fetchTechnicians(currentPage);
      }
    } catch (err) {
      console.error("Delete technician error:", err);
      setTechnicianError(err.message);
      toast({ title: "Erreur de Suppression", description: err.message, variant: "destructive" });
    } finally {
      setIsLoadingTechnicians(false);
    }
  };
  
  // Pagination and Filter Handlers
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset to page 1 when applying new filters
    fetchTechnicians(1, limitPerPage, searchTerm, statusFilter);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCurrentPage(1);
    fetchTechnicians(1, limitPerPage, '', '');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchTechnicians(newPage, limitPerPage, searchTerm, statusFilter);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "apercu":
        return (
          <>
            {renderStatsCards()}
            {renderRecentRequests()}
          </>
        );
      case "techniciens":
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-100">Gestion des Techniciens</h2>
                <p className="text-slate-400">Ajouter, voir, modifier et supprimer des techniciens.</p>
              </div>
              <Button onClick={handleOpenAddForm} className="bg-cyan-600 hover:bg-cyan-700">
                <PlusCircle className="mr-2 h-5 w-5" />
                Ajouter un Technicien
              </Button>
            </div>

            {/* Filters and Search */} 
            <Card className="bg-slate-800/60 border-slate-700 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2 lg:col-span-2">
                        <Label htmlFor="search-technician" className="text-slate-400 mb-1 block">Rechercher</Label>
                        <div className="relative">
                            <Input 
                                id="search-technician"
                                type="text" 
                                placeholder="Nom, email, spécialisation..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="bg-slate-700 border-slate-600 pr-10"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="status-filter" className="text-slate-400 mb-1 block">Statut</Label>
                        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                            <SelectTrigger className="bg-slate-700 border-slate-600">
                                <SelectValue placeholder="Tous les statuts" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                                <SelectItem value="_all_" className="hover:bg-slate-700 focus:bg-slate-700">Tous</SelectItem>
                                <SelectItem value="active" className="hover:bg-slate-700 focus:bg-slate-700">Actif</SelectItem>
                                <SelectItem value="inactive" className="hover:bg-slate-700 focus:bg-slate-700">Inactif</SelectItem>
                                <SelectItem value="pending_approval" className="hover:bg-slate-700 focus:bg-slate-700">En attente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex space-x-2 items-end">
                        <Button onClick={handleApplyFilters} className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700">
                            <Search className="mr-2 h-4 w-4" /> Filtrer
                        </Button>
                        <Button onClick={handleResetFilters} variant="outline" className="w-full sm:w-auto border-slate-600 hover:bg-slate-700">
                            <RefreshCw className="mr-2 h-4 w-4" /> Réinitialiser
                        </Button>
                    </div>
                </div>
            </Card>

            {isLoadingTechnicians && (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                <p className="ml-3 text-slate-400">Chargement des techniciens...</p>
              </div>
            )}
            {technicianError && !isLoadingTechnicians && (
              <div className="text-center py-10 bg-red-900/20 border border-red-700 rounded-md p-4">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                <p className="text-red-400">Erreur: {technicianError}</p>
                <Button onClick={() => fetchTechnicians(currentPage, limitPerPage, searchTerm, statusFilter)} variant="outline" className="mt-4 border-red-500 text-red-400 hover:bg-red-800/30">
                  Réessayer
                </Button>
              </div>
            )}
            {!isLoadingTechnicians && !technicianError && (
              <TechnicianTable 
                technicians={technicians} 
                onEdit={handleOpenEditForm} 
                onDelete={handleDeleteTechnician} 
                onViewDetails={handleOpenDetails} 
              />
            )}
            
            {/* Pagination Controls */} 
            {!isLoadingTechnicians && !technicianError && totalTechnicians > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
                    <p className="text-sm text-slate-400">
                        Page {currentPage} sur {totalPages}. Total: {totalTechnicians} techniciens.
                    </p>
                    <div className="flex space-x-1">
                        <Button 
                            onClick={() => handlePageChange(1)} 
                            disabled={currentPage === 1 || isLoadingTechnicians}
                            variant="outline" size="icon" className="border-slate-600 hover:bg-slate-700">
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button 
                            onClick={() => handlePageChange(currentPage - 1)} 
                            disabled={currentPage === 1 || isLoadingTechnicians}
                            variant="outline" size="icon" className="border-slate-600 hover:bg-slate-700">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        {/* Consider a more advanced pagination component for many pages */}
                        <Button 
                            onClick={() => handlePageChange(currentPage + 1)} 
                            disabled={currentPage === totalPages || isLoadingTechnicians}
                            variant="outline" size="icon" className="border-slate-600 hover:bg-slate-700">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button 
                            onClick={() => handlePageChange(totalPages)} 
                            disabled={currentPage === totalPages || isLoadingTechnicians}
                            variant="outline" size="icon" className="border-slate-600 hover:bg-slate-700">
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Dialogs */} 
            <TechnicianFormDialog 
                open={isFormDialogOpen}
                onOpenChange={setIsFormDialogOpen}
                onSubmit={handleFormSubmit}
                initialData={currentTechnician}
                isLoading={isSubmittingForm}
            />
            <TechnicianDetailsDialog 
                open={isDetailsDialogOpen}
                onOpenChange={setIsDetailsDialogOpen}
                technician={currentTechnician}
            />
          </div>
        );
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
                <h3 className="text-lg font-semibold text-slate-100">Informations:</h3>
                <p className="text-slate-300"><strong className="font-medium text-slate-400">Nom:</strong> {adminData.name} {adminData.surname}</p>
                <p className="text-slate-300"><strong className="font-medium text-slate-400">Email:</strong> {adminData.email}</p>
                {/* Add more profile fields and edit functionality here */}
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
          <TabsContent value="techniciens">
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
            {renderContent()}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;