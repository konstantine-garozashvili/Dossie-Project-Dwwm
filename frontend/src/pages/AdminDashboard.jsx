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
  RefreshCw,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from '@/components/ui/input';
import ProfilePictureUploader from "@/components/ProfilePictureUploader";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import CollapsibleSidebar from '@/components/CollapsibleSidebar';
import useResponsive from '@/hooks/useResponsive';
import { PROFILE_ENDPOINTS, TECHNICIAN_ENDPOINTS, ADMIN_ENDPOINTS } from '@/config/api';
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { useEffect as useDebugEffect } from 'react';

// Admin specific components
import TechnicianTable from '@/components/admin/TechnicianTable';
import TechnicianFormDialog from '@/components/admin/TechnicianFormDialog';
import TechnicianDetailsDialog from '@/components/admin/TechnicianDetailsDialog';
import NotificationDropdown from '@/components/admin/NotificationDropdown';
import ApplicationManagement from '@/components/admin/ApplicationManagement';

// Define pageTitles mapping here for better organization
const pageTitles = {
  apercu: "Tableau de Bord",
  techniciens: "Gestion des Techniciens",
  candidatures: "Gestion des Candidatures",
  clients: "Gestion des Clients",
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

  // State for mobile bottom menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handler functions for technician management
  const handleOpenAddForm = () => {
    setCurrentTechnician(null); // Reset current technician data
    setIsFormDialogOpen(true); // Open the form dialog
  };

  const handleOpenEditForm = (technician) => {
    setCurrentTechnician(technician);
    setIsFormDialogOpen(true);
  };

  const handleOpenDetails = (technician) => {
    setCurrentTechnician(technician);
    setIsDetailsDialogOpen(true);
  };

  const handleFormSubmit = (formData) => {
    setIsSubmittingForm(true);
    // Here you would typically call an API to save the technician data
    console.log("Submitting technician data:", formData);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsSubmittingForm(false);
      setIsFormDialogOpen(false);
      toast({
        title: formData.id ? "Technicien mis à jour" : "Technicien ajouté",
        description: `${formData.name} ${formData.surname} a été ${formData.id ? 'mis à jour' : 'ajouté'} avec succès.`,
      });
      // Refresh technicians list
      fetchTechnicians(currentPage, limitPerPage, searchTerm, statusFilter);
    }, 1000);
  };

  const handleDeleteTechnician = (technicianId) => {
    // Here you would typically call an API to delete the technician
    console.log("Deleting technician with ID:", technicianId);
    
    // Simulate API call with timeout
    setTimeout(() => {
      toast({
        title: "Technicien supprimé",
        description: "Le technicien a été supprimé avec succès.",
      });
      // Refresh technicians list
      fetchTechnicians(currentPage, limitPerPage, searchTerm, statusFilter);
    }, 1000);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value === '_all_' ? '' : value);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchTechnicians(1, limitPerPage, searchTerm, statusFilter);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCurrentPage(1);
    fetchTechnicians(1, limitPerPage, '', '');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchTechnicians(page, limitPerPage, searchTerm, statusFilter);
  };

  const fetchTechnicians = async (page, limit, search, status) => {
    setIsLoadingTechnicians(true);
    setTechnicianError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }
      
      if (status) {
        params.append('status', status);
      }
      
      // Make API call to fetch technicians using admin endpoint
      const response = await fetch(`${ADMIN_ENDPOINTS.GET_TECHNICIANS}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // The admin endpoint returns { success: true, technicians, pagination }
        const technicians = data.technicians || [];
        const pagination = data.pagination || {};
        
        // Transform the data to match the expected format
        const transformedTechnicians = technicians.map(tech => ({
          id: tech.id,
          name: tech.name || '',
          surname: tech.surname || '',
          email: tech.email,
          phone_number: tech.phone_number,
          specialization: tech.specialization || 'Non spécifié',
          status: tech.status || 'active',
          profile_picture_url: tech.profile_picture_url || null,
        }));
        
        setTechnicians(transformedTechnicians);
        setTotalTechnicians(pagination.total || transformedTechnicians.length);
        setTotalPages(pagination.totalPages || Math.ceil((pagination.total || transformedTechnicians.length) / limit));
      } else {
        throw new Error(data.message || 'Erreur lors de la récupération des techniciens');
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
      setTechnicianError(error.message || 'Erreur lors de la récupération des techniciens');
      setTechnicians([]);
      setTotalTechnicians(0);
      setTotalPages(1);
    } finally {
      setIsLoadingTechnicians(false);
    }
  };

  useEffect(() => {
    const storedAdminInfo = localStorage.getItem('adminInfo');
    if (storedAdminInfo) {
      try {
        const parsedData = JSON.parse(storedAdminInfo);
        setAdminData(parsedData);
        setProfilePictureUrl(
          `https://ui-avatars.com/api/?name=${encodeURIComponent((parsedData.name || 'A') + ' ' + (parsedData.surname || 'D'))}&background=random&color=fff&size=128`
        );
      } catch (err) {
        console.error('Error parsing admin info:', err);
        setProfilePictureUrl(
          `https://ui-avatars.com/api/?name=Admin+User&background=random&color=fff&size=128`
        );
      }
    } else {
      setProfilePictureUrl(
        `https://ui-avatars.com/api/?name=Admin+User&background=random&color=fff&size=128`
      );
    }
  }, []);

  useEffect(() => {
    if (adminData && adminData.id) {
      fetchProfilePicture();
    }
  }, [adminData]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/adminlog');
    } else {
      setTimeout(() => setLoading(false), 500);
    }
  }, [navigate]);

  // Fetch technicians on initial load
  useEffect(() => {
    if (activeTab === 'techniciens') {
      fetchTechnicians(currentPage, limitPerPage, searchTerm, statusFilter);
    }
  }, [activeTab]);

  const fetchProfilePicture = async () => {
    const uiAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent((adminData?.name || 'A') + ' ' + (adminData?.surname || 'D'))}&background=random&color=fff&size=128`;
    setProfilePictureUrl(uiAvatarUrl); 

    if (!adminData.id) return;

    try {
      const response = await fetch(PROFILE_ENDPOINTS.GET_PICTURE('admin', adminData.id), {
        headers: { 'Accept': 'application/json' }
      });
      if (response.status === 404) {
        return; 
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
        // Keep UI Avatars URL on error
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    setAdminData({ id: null, email: '', name: '', surname: '' });
    setProfilePictureUrl(''); 
    navigate('/adminlog');
  };

  // Placeholder data
  const statsData = [
    { title: "Utilisateurs", value: "246", change: "+12%", icon: <Users className="h-5 w-5 text-primary" /> },
    { title: "Techniciens", value: "38", change: "+5%", icon: <Server className="h-5 w-5 text-primary" /> },
    { title: "Services", value: "152", change: "+24%", icon: <List className="h-5 w-5 text-primary" /> },
    { title: "Rendez-vous", value: "57", change: "+9%", icon: <Calendar className="h-5 w-5 text-primary" /> },
  ];

  const recentRequests = [
    { id: 1, user: "Martin Dupont", service: "Réparation PC", date: "15/05/2023", status: "En attente" },
    { id: 2, user: "Sophie Martin", service: "Récupération de données", date: "14/05/2023", status: "Terminé" },
    { id: 3, user: "Jean Boucher", service: "Installation Windows", date: "12/05/2023", status: "En cours" },
  ];

  const getStatusRequestColor = (status) => {
    switch (status) {
      case "En attente": return "bg-yellow-500/20 text-yellow-500"; // Adjusted for better visibility on potentially light/dark backgrounds
      case "En cours": return "bg-blue-500/20 text-blue-500";
      case "Terminé": return "bg-green-500/20 text-green-500";
      default: return "bg-muted text-muted-foreground";
    }
  };
  
  // Helper function to combine navigation and closing sidebar
  const setActiveTabAndCloseSidebar = (tab) => {
    setActiveTab(tab);
      setSidebarOpen(false);
  };
  
  // Handle notification click to navigate to applications
  const handleNotificationApplicationClick = (applicationId) => {
    setActiveTab('candidatures');
    setSidebarOpen(false);
    // You could also scroll to or highlight the specific application
  };

  // Navigation items for sidebar
  const navigationItems = [
    { name: 'Aperçu', icon: Home, tab: 'apercu' },
    { name: 'Techniciens', icon: Users, tab: 'techniciens' },
    { name: 'Candidatures', icon: FileText, tab: 'candidatures' },
    { name: 'Clients', icon: Users, tab: 'clients' },
    { name: 'Services', icon: List, tab: 'services' },
    { name: 'Rapports', icon: LineChart, tab: 'rapports' },
    { name: 'Paramètres', icon: Settings, tab: 'parametres' },
  ];

  const Header = () => (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-6">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-foreground">{pageTitles[activeTab] || "Tableau de Bord"}</h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Input 
            type="search" 
            placeholder="Rechercher..." 
            className="hidden md:block bg-input border-border placeholder:text-muted-foreground text-sm w-64" 
        />
        <ThemeToggleButton />
        <NotificationDropdown onApplicationClick={handleNotificationApplicationClick} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-9 w-9 border-2 border-transparent hover:border-primary transition-colors">
                <AvatarImage src={profilePictureUrl} alt={`${adminData.name} ${adminData.surname}`} />
                <AvatarFallback className="bg-muted text-muted-foreground">
                   {`${(adminData.name || 'A').charAt(0)}${(adminData.surname || 'D').charAt(0)}`}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover border-border text-popover-foreground">
            <DropdownMenuLabel>
              <p className="font-medium text-foreground">{`${adminData.name || ''} ${adminData.surname || ''}`.trim() || "Admin"}</p>
              <p className="text-xs text-muted-foreground">{adminData.email}</p>
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

  // Individual render functions for each tab
  const renderOverviewTab = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {statsData.map((stat, index) => (
          <Card key={index} className="bg-card border-border text-card-foreground">
            <CardContent className="p-4 sm:p-6">
                        <div className="flex justify-between items-start">
                          <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-xl sm:text-2xl font-bold mt-1 text-foreground">{stat.value}</h3>
                  <p className="text-xs text-green-500 mt-2">{stat.change} depuis le mois dernier</p>
                          </div>
                <div className="p-3 rounded-full bg-primary/20 text-primary">
                            {stat.icon}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
      <Card className="bg-card border-border text-card-foreground mt-6">
                  <CardHeader>
          <CardTitle className="text-foreground">Demandes récentes</CardTitle>
          <CardDescription className="text-muted-foreground">Liste des dernières demandes de service</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Service</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Statut</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentRequests.map((request) => (
                  <tr key={request.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm text-foreground">{request.id}</td>
                    <td className="px-4 py-3 text-foreground">{request.user}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{request.service}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{request.date}</td>
                              <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusRequestColor(request.status)}`}>
                                  {request.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                      <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">Voir</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
    </>
  );

  const renderTechniciansTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Gestion des Techniciens</h2>
          <p className="text-muted-foreground">Ajouter, voir, modifier et supprimer des techniciens.</p>
        </div>
        <Button onClick={handleOpenAddForm} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" />
          Ajouter un Technicien
        </Button>
      </div>

      <Card className="bg-card border-border text-card-foreground p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
              <div className="md:col-span-2 lg:col-span-2">
                  <Label htmlFor="search-technician" className="text-muted-foreground mb-1 block">Rechercher</Label>
                  <div className="relative">
                      <Input 
                          id="search-technician"
                          type="text" 
                          placeholder="Nom, email, spécialisation..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                          className="bg-input border-border pr-10 text-foreground placeholder:text-muted-foreground"
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
              </div>
              <div>
                  <Label htmlFor="status-filter" className="text-muted-foreground mb-1 block">Statut</Label>
                  <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                      <SelectTrigger className="bg-input border-border text-foreground">
                          <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground">
                          <SelectItem value="_all_">Tous</SelectItem>
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="inactive">Inactif</SelectItem>
                          <SelectItem value="pending_approval">En attente</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              <div className="flex space-x-2 items-end">
                  <Button onClick={handleApplyFilters} className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90">
                      <Search className="mr-2 h-4 w-4" /> Filtrer
                  </Button>
                  <Button onClick={handleResetFilters} variant="outline" className="w-full sm:w-auto border-border hover:bg-muted">
                      <RefreshCw className="mr-2 h-4 w-4" /> Réinitialiser
                  </Button>
              </div>
            </div>
        </Card>

      {isLoadingTechnicians && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Chargement des techniciens...</p>
        </div>
      )}
      {technicianError && !isLoadingTechnicians && (
        <div className="text-center py-10 bg-destructive/10 border border-destructive rounded-md p-4">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
          <p className="text-destructive-foreground">Erreur: {technicianError}</p>
          <Button onClick={() => fetchTechnicians(currentPage, limitPerPage, searchTerm, statusFilter)} variant="outline" className="mt-4 border-destructive text-destructive-foreground hover:bg-destructive/20">
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
      
      {!isLoadingTechnicians && !technicianError && totalTechnicians > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
              <p className="text-sm text-muted-foreground">
                  Page {currentPage} sur {totalPages}. Total: {totalTechnicians} techniciens.
              </p>
              <div className="flex space-x-1">
                  <Button 
                      onClick={() => handlePageChange(1)} 
                      disabled={currentPage === 1 || isLoadingTechnicians}
                      variant="outline" size="icon" className="border-border hover:bg-muted">
                      <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                      onClick={() => handlePageChange(currentPage - 1)} 
                      disabled={currentPage === 1 || isLoadingTechnicians}
                      variant="outline" size="icon" className="border-border hover:bg-muted">
                      <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                      onClick={() => handlePageChange(currentPage + 1)} 
                      disabled={currentPage === totalPages || isLoadingTechnicians}
                      variant="outline" size="icon" className="border-border hover:bg-muted">
                      <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button 
                      onClick={() => handlePageChange(totalPages)} 
                      disabled={currentPage === totalPages || isLoadingTechnicians}
                      variant="outline" size="icon" className="border-border hover:bg-muted">
                      <ChevronsRight className="h-4 w-4" />
                  </Button>
              </div>
            </div>
      )}

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

  const renderCandidaturesTab = () => (
    <ApplicationManagement />
  );

  const renderClientsTab = () => (
    <Card className="bg-card border-border text-card-foreground">
      <CardHeader>
        <CardTitle className="text-foreground">Gestion des Clients</CardTitle>
        <CardDescription className="text-muted-foreground">Gérer les informations et les comptes clients.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Contenu de la gestion des clients à venir.</p>
      </CardContent>
    </Card>
  );
  
  const renderServicesTab = () => (
    <Card className="bg-card border-border text-card-foreground">
      <CardHeader>
        <CardTitle className="text-foreground">Gestion des Services</CardTitle>
        <CardDescription className="text-muted-foreground">Configurer les types de services, tarifs, etc.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Contenu de la gestion des services à venir.</p>
      </CardContent>
    </Card>
  );

  const renderReportsTab = () => (
    <Card className="bg-card border-border text-card-foreground">
      <CardHeader>
        <CardTitle className="text-foreground">Rapports et Analyses</CardTitle>
        <CardDescription className="text-muted-foreground">Visualiser les données de performance et les tendances.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Contenu des rapports à venir.</p>
      </CardContent>
    </Card>
  );

  const renderSettingsTab = () => (
    <Card className="bg-card border-border text-card-foreground">
                <CardHeader>
        <CardTitle className="text-foreground">Paramètres du Compte</CardTitle>
        <CardDescription className="text-muted-foreground">Gérer les paramètres généraux du compte administrateur.</CardDescription>
                </CardHeader>
                <CardContent>
        <p className="text-muted-foreground">Contenu des paramètres du compte à venir.</p>
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
            userType="admin"
            userId={adminData.id}
            currentPictureUrl={profilePictureUrl}
            onUploadSuccess={fetchProfilePicture}
            avatarSizeClassName="w-32 h-32 text-4xl"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Informations:</h3>
          <p className="text-muted-foreground"><strong className="font-medium text-foreground">Nom:</strong> {adminData.name} {adminData.surname}</p>
          <p className="text-muted-foreground"><strong className="font-medium text-foreground">Email:</strong> {adminData.email}</p>
                  </div>
                </CardContent>
              </Card>
  );
  
  // Add debugging to console log
  useDebugEffect(() => {
    console.log('--- AdminDashboard mounted ---');
    console.log('Window width:', typeof window !== 'undefined' ? window.innerWidth : 'N/A');
    console.log('User agent:', typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A');
    console.log('Current tab:', activeTab);
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Chargement...</p>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header (both mobile and desktop) */}
      <Header />
      
      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 space-y-6 pb-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsContent value="apercu" className="mt-0">
            {renderOverviewTab()} 
          </TabsContent>
          <TabsContent value="techniciens" className="mt-0">
            {renderTechniciansTab()}
          </TabsContent>
          <TabsContent value="candidatures" className="mt-0">
            {renderCandidaturesTab()}
          </TabsContent>
          <TabsContent value="clients" className="mt-0">
            {renderClientsTab()}
          </TabsContent>
          <TabsContent value="services" className="mt-0">
            {renderServicesTab()}
          </TabsContent>
          <TabsContent value="rapports" className="mt-0">
            {renderReportsTab()}
          </TabsContent>
          <TabsContent value="parametres" className="mt-0">
            {renderSettingsTab()}
          </TabsContent>
          <TabsContent value="profile" className="mt-0">
            {renderProfileTab()}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* DESKTOP NAVIGATION BAR - Hidden on mobile */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-card border-t border-border text-card-foreground shadow-lg z-[9999]">
        <div className="flex justify-center">
          <div className="flex justify-around max-w-4xl w-full h-16">
            {[
              { id: 'apercu', label: 'Aperçu', icon: Home },
              { id: 'techniciens', label: 'Techniciens', icon: Users },
              { id: 'candidatures', label: 'Candidatures', icon: FileText },
              { id: 'clients', label: 'Clients', icon: Users },
              { id: 'services', label: 'Services', icon: List },
              { id: 'rapports', label: 'Rapports', icon: LineChart },
            ].map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center px-4 py-2 transition-all duration-200 rounded-lg mx-1 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <IconComponent className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* MOBILE HAMBURGER MENU BUTTON - Only visible on mobile */}
      <div className="md:hidden fixed bottom-4 right-4 z-[9999]">
        <Button
          onClick={() => setMobileMenuOpen(true)}
          className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-110"
          size="icon"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* MOBILE FULL-SCREEN BOTTOM MENU */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-[9998]"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Bottom Menu */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.4 
            }}
            className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-3xl z-[9999] max-h-[80vh] overflow-hidden"
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full"></div>
            </div>
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">Navigation</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Navigation Items */}
            <div className="p-6 space-y-2">
              {[
                { id: 'apercu', label: 'Aperçu', icon: Home },
                { id: 'techniciens', label: 'Techniciens', icon: Users },
                { id: 'candidatures', label: 'Candidatures', icon: FileText },
                { id: 'clients', label: 'Clients', icon: Users },
                { id: 'services', label: 'Services', icon: List },
                { id: 'rapports', label: 'Rapports', icon: LineChart },
              ].map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                    }`}
                  >
                    <IconComponent className="h-6 w-6" />
                    <span className="text-base font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-2 h-2 bg-primary-foreground rounded-full"
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
            
            {/* Footer with logout */}
            <div className="px-6 py-4 border-t border-border">
              <Button
                variant="ghost"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-4 p-4 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl"
              >
                <LogOut className="h-6 w-6" />
                <span className="text-base font-medium">Déconnexion</span>
              </Button>
        </div>
          </motion.div>
        </>
      )}
    </div>
  );


};

export default AdminDashboard; 