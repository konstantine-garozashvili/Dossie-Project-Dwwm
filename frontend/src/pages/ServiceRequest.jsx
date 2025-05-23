import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronRight, ChevronLeft, Calendar, Laptop, Server, Smartphone, Wifi, Shield, Clock, Info, AlertCircle, X, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { useTheme } from "@/context/ThemeProvider";

// Types d'appareils
const deviceTypes = [
  { id: "laptop", name: "Ordinateur Portable", icon: <Laptop className="w-6 h-6" /> },
  { id: "desktop", name: "Ordinateur de Bureau", icon: <Server className="w-6 h-6" /> },
  { id: "smartphone", name: "Smartphone", icon: <Smartphone className="w-6 h-6" /> },
  { id: "network", name: "Équipement Réseau", icon: <Wifi className="w-6 h-6" /> },
  { id: "storage", name: "Périphérique de Stockage", icon: <Shield className="w-6 h-6" /> },
  { id: "other", name: "Autre", icon: <Shield className="w-6 h-6" /> },
];

// Types de services
const serviceTypes = [
  { id: "hardware-repair", name: "Réparation Matérielle", description: "Réparation des composants physiques de votre appareil" },
  { id: "software-issue", name: "Problème Logiciel", description: "Résolution des problèmes logiciels, plantages ou erreurs" },
  { id: "virus-removal", name: "Suppression de Virus", description: "Élimination des logiciels malveillants, virus et programmes indésirables" },
  { id: "data-recovery", name: "Récupération de Données", description: "Récupération de fichiers et données perdus ou supprimés" },
  { id: "network-setup", name: "Configuration Réseau", description: "Configuration Wi-Fi, routeur ou dépannage réseau" },
  { id: "hardware-upgrade", name: "Mise à Niveau Matérielle", description: "Amélioration des composants pour de meilleures performances" },
];

// Systèmes d'exploitation
const operatingSystems = [
  "Windows 11", "Windows 10", "Windows 8/8.1", "Windows 7", 
  "macOS Sonoma", "macOS Ventura", "macOS Monterey", "macOS Version plus ancienne",
  "Linux", "Chrome OS", "Android", "iOS/iPadOS", "Autre"
];

// Créneaux horaires disponibles
const timeSlots = [
  "9h00 - 11h00",
  "11h00 - 13h00", 
  "13h00 - 15h00",
  "15h00 - 17h00"
];

// Marques d'appareils par catégorie
const deviceBrands = {
  laptop: ["Apple", "Dell", "HP", "Lenovo", "Asus", "Acer", "Microsoft", "Samsung", "MSI", "Toshiba", "Razer", "Autre"],
  desktop: ["Dell", "HP", "Lenovo", "Apple", "Asus", "Acer", "CyberPower", "iBUYPOWER", "Assemblé sur mesure", "Autre"],
  smartphone: ["Apple", "Samsung", "Google", "Xiaomi", "OnePlus", "Huawei", "Motorola", "Sony", "LG", "Nokia", "Autre"],
  network: ["Cisco", "Netgear", "TP-Link", "Linksys", "Asus", "Ubiquiti", "D-Link", "Belkin", "Aruba", "Autre"],
  storage: ["Western Digital", "Seagate", "Samsung", "SanDisk", "Crucial", "Kingston", "Toshiba", "LaCie", "Autre"],
  other: ["Autre"]
};

export const ServiceRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    serviceTypes: [],
    deviceTypes: [],
    deviceDetails: {
      makes: [],
      otherMake: "",
      model: "",
      operatingSystem: "",
      purchaseDate: "",
      problemDescription: "",
    },
    schedulingDetails: {
      date: undefined,
      timeSlot: "",
    },
    clientType: "individual",
    contactInfo: {
      fullName: "",
      email: "",
      phone: "",
      preferredContact: "email",
      address: "",
      businessName: "",
    }
  });
  
  // For brand selector dropdown
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [availableBrands, setAvailableBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setBrandDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);
  
  // Update available brands when device types change
  useEffect(() => {
    if (formData.deviceTypes.length > 0) {
      const brands = new Set();
      formData.deviceTypes.forEach(deviceType => {
        const brandsForType = deviceBrands[deviceType] || [];
        brandsForType.forEach(brand => brands.add(brand));
      });
      setAvailableBrands(Array.from(brands));
    } else {
      // If no device type selected, show all brands
      const allBrands = new Set();
      Object.values(deviceBrands).forEach(brands => {
        brands.forEach(brand => allBrands.add(brand));
      });
      setAvailableBrands(Array.from(allBrands));
    }
  }, [formData.deviceTypes]);
  
  // Toggle a brand in the selection
  const toggleBrand = (brand) => {
    setFormData(prev => {
      const currentMakes = [...prev.deviceDetails.makes];
      if (brand === "Other") {
        // If "Other" is selected, add it to the list if not already there
        if (!currentMakes.includes("Other")) {
          return {
            ...prev,
            deviceDetails: {
              ...prev.deviceDetails,
              makes: [...currentMakes, "Other"]
            }
          };
        }
        return prev;
      } else {
        // For normal brands
        if (currentMakes.includes(brand)) {
          return {
            ...prev,
            deviceDetails: {
              ...prev.deviceDetails,
              makes: currentMakes.filter(m => m !== brand)
            }
          };
        } else {
          return {
            ...prev,
            deviceDetails: {
              ...prev.deviceDetails,
              makes: [...currentMakes, brand]
            }
          };
        }
      }
    });
  };
  
  // Remove a brand from selection
  const removeBrand = (brand) => {
    setFormData(prev => ({
      ...prev,
      deviceDetails: {
        ...prev.deviceDetails,
        makes: prev.deviceDetails.makes.filter(m => m !== brand)
      }
    }));
  };
  
  const updateFormData = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the data to your backend
    console.log("Submitting service request:", formData);
    
    // Navigate to confirmation page
    navigate("/request-confirmation");
  };
  
  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
  
  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } }
  };
  
  // Add a function to toggle service types
  const toggleServiceType = (serviceId) => {
    setFormData(prev => {
      const currentServiceTypes = [...prev.serviceTypes];
      if (currentServiceTypes.includes(serviceId)) {
        // Remove the service if it's already selected
        return {
          ...prev,
          serviceTypes: currentServiceTypes.filter(id => id !== serviceId)
        };
      } else {
        // Add the service if it's not already selected
        return {
          ...prev,
          serviceTypes: [...currentServiceTypes, serviceId]
        };
      }
    });
  };
  
  // Add a function to toggle device types
  const toggleDeviceType = (deviceId) => {
    setFormData(prev => {
      const currentDeviceTypes = [...prev.deviceTypes];
      if (currentDeviceTypes.includes(deviceId)) {
        // Remove the device if it's already selected
        return {
          ...prev,
          deviceTypes: currentDeviceTypes.filter(id => id !== deviceId)
        };
      } else {
        // Add the device if it's not already selected
        return {
          ...prev,
          deviceTypes: [...currentDeviceTypes, deviceId]
        };
      }
    });
  };
  
  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <Badge className="mb-4 px-3 py-1 bg-primary/20 text-primary border-primary inline-flex w-auto">
            Demande de Service
          </Badge>
          <h1 
            className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text' : 'text-primary'}`}
          >
            Planifiez Votre Réparation Informatique
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Décrivez votre problème, et nos techniciens experts vous aideront à remettre votre appareil en état de marche.
          </p>
        </div>
        
        {/* Indicateur de progression */}
        <div className="mb-8">
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map(num => (
              <div key={num} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2
                    ${step >= num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  {step > num ? <Check className="w-5 h-5" /> : num}
                </div>
                <div className={`text-sm ${step >= num ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {num === 1 ? 'Type de Service' : 
                   num === 2 ? 'Détails de l\'Appareil' : 
                   num === 3 ? 'Planification' : 
                   num === 4 ? 'Vos Informations' :
                   'Vérification & Envoi'}
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute h-1 w-full bg-muted"></div>
            <div 
              className="absolute h-1 bg-primary transition-all duration-500"
              style={{ width: `${(step - 1) * 25}%` }}
            ></div>
          </div>
        </div>
        
        <Card className="bg-card border-border shadow-xl">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit}>
            
              {/* Step 1: Service Type */}
              <motion.div
                initial="hidden"
                animate={step === 1 ? "visible" : "hidden"}
                exit="exit"
                variants={containerVariants}
                className={step === 1 ? "block" : "hidden"}
              >
                <div className="mb-6 space-y-2">
                  <h2 className="text-xl font-semibold text-primary">De quels services avez-vous besoin ?</h2>
                  <p className="text-muted-foreground">Sélectionnez tous les services qui s'appliquent à votre problème</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {serviceTypes.map(service => (
                    <div
                      key={service.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all
                        ${formData.serviceTypes.includes(service.id) 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-muted-foreground'}`}
                      onClick={() => toggleServiceType(service.id)}
                    >
                      <div className="flex items-start">
                        <div className={`w-5 h-5 rounded-md border mr-3 mt-1 flex items-center justify-center
                          ${formData.serviceTypes.includes(service.id) ? 'border-primary bg-primary' : 'border-border'}`}
                        >
                          {formData.serviceTypes.includes(service.id) && 
                            <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Avec quels types d'appareils avez-vous besoin d'aide ?</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {deviceTypes.map(device => (
                      <div
                        key={device.id}
                        className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all
                          ${formData.deviceTypes.includes(device.id) 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-muted-foreground'}`}
                        onClick={() => toggleDeviceType(device.id)}
                      >
                        <div className="text-primary mb-2">{device.icon}</div>
                        <div className="text-center">{device.name}</div>
                        {formData.deviceTypes.includes(device.id) && (
                          <div className="mt-2 bg-primary rounded-full p-1">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
              
              {/* Step 2: Device Details */}
              <motion.div
                initial="hidden"
                animate={step === 2 ? "visible" : "hidden"}
                exit="exit"
                variants={containerVariants}
                className={step === 2 ? "block" : "hidden"}
              >
                <div className="mb-6 space-y-2">
                  <h2 className="text-xl font-semibold text-primary">Parlez-nous de votre appareil</h2>
                  <p className="text-muted-foreground">Plus vous fournissez de détails, mieux nous pourrons diagnostiquer votre problème</p>
                </div>
                
                <div className="mb-6">
                  <Label className="block mb-2">Marque de l'appareil</Label>
                  <div className="relative" ref={dropdownRef}>
                    <div 
                      className={`flex flex-wrap gap-2 min-h-10 p-2 border rounded-md cursor-pointer ${
                        brandDropdownOpen 
                          ? 'border-primary ring-2 ring-primary/50' 
                          : 'border-border'
                      } bg-background`}
                      onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
                    >
                      {formData.deviceDetails.makes.length === 0 ? (
                        <div className="text-muted-foreground py-1">Sélectionnez une ou plusieurs marques</div>
                      ) : (
                        <>
                          {formData.deviceDetails.makes.map(brand => (
                            <Badge 
                              key={brand} 
                              className="bg-primary/20 text-primary flex items-center gap-1"
                            >
                              {brand}
                              <button 
                                type="button" 
                                className="ml-1 hover:text-primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeBrand(brand);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </>
                      )}
                      <div className="ml-auto flex items-center">
                        <ChevronDown className={`h-4 w-4 transition-transform ${brandDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    
                    {brandDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
                        <div className="p-2">
                          <Input
                            type="text"
                            placeholder="Rechercher des marques..."
                            className="bg-background border-border"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <div className="max-h-60 overflow-auto p-2">
                          {availableBrands
                            .filter(brand => brand.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(brand => (
                              <div
                                key={brand}
                                className={`flex items-center px-2 py-1.5 cursor-pointer rounded hover:bg-border ${
                                  formData.deviceDetails.makes.includes(brand) ? 'bg-primary/20' : ''
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleBrand(brand);
                                }}
                              >
                                <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center
                                  ${formData.deviceDetails.makes.includes(brand) ? 'border-primary bg-primary' : 'border-border'}`}
                                >
                                  {formData.deviceDetails.makes.includes(brand) && 
                                    <Check className="w-3 h-3 text-primary-foreground" />}
                                </div>
                                <span>{brand}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {formData.deviceDetails.makes.includes("Autre") && (
                    <div className="mt-2">
                      <Label htmlFor="other-brand">Précisez la marque</Label>
                      <Input
                        id="other-brand"
                        placeholder="Entrez le nom de la marque"
                        className="bg-background border-border mt-1"
                        value={formData.deviceDetails.otherMake}
                        onChange={(e) => updateFormData('deviceDetails', 'otherMake', e.target.value)}
                      />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Vous pouvez sélectionner plusieurs marques si nécessaire
                  </p>
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="device-model">Modèle de l'appareil</Label>
                  <Input
                    id="device-model"
                    placeholder="ex: MacBook Pro, XPS 13"
                    className="bg-background border-border"
                    value={formData.deviceDetails.model}
                    onChange={(e) => updateFormData('deviceDetails', 'model', e.target.value)}
                  />
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="operating-system">Système d'exploitation</Label>
                  <select
                    id="operating-system"
                    className="w-full h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={formData.deviceDetails.operatingSystem}
                    onChange={(e) => updateFormData('deviceDetails', 'operatingSystem', e.target.value)}
                  >
                    <option value="">Sélectionnez un système d'exploitation</option>
                    {operatingSystems.map(os => (
                      <option key={os} value={os}>{os}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="purchase-date">Date d'achat approximative (optionnel)</Label>
                  <Input
                    id="purchase-date"
                    type="date"
                    className="bg-background border-border"
                    value={formData.deviceDetails.purchaseDate}
                    onChange={(e) => updateFormData('deviceDetails', 'purchaseDate', e.target.value)}
                  />
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="problem-description">Décrivez le problème en détail</Label>
                  <Textarea
                    id="problem-description"
                    placeholder="Veuillez fournir autant de détails que possible sur le problème que vous rencontrez..."
                    className="bg-background border-border min-h-[150px]"
                    value={formData.deviceDetails.problemDescription}
                    onChange={(e) => updateFormData('deviceDetails', 'problemDescription', e.target.value)}
                  />
                </div>
              </motion.div>
              
              {/* Step 3: Schedule Service */}
              <motion.div
                initial="hidden"
                animate={step === 3 ? "visible" : "hidden"}
                exit="exit"
                variants={containerVariants}
                className={step === 3 ? "block" : "hidden"}
              >
                <div className="mb-6 space-y-2">
                  <h2 className="text-xl font-semibold text-primary">Planifiez votre service</h2>
                  <p className="text-muted-foreground">Choisissez une date et une heure qui vous conviennent pour que notre technicien puisse vous aider</p>
                </div>
                
                <div className="mb-8">
                  <Label className="block mb-3">Sélectionnez une date</Label>
                  <Input
                    type="date"
                    className="bg-background border-border w-full max-w-sm"
                    value={formData.schedulingDetails.date ? format(formData.schedulingDetails.date, "yyyy-MM-dd") : ""}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : null;
                      // Check if the date is valid and not a Sunday
                      if (date) {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        // Calculate date 30 days from today
                        const maxDate = new Date();
                        maxDate.setDate(today.getDate() + 30);
                        
                        // Check if date is valid
                        if (date < today) {
                          toast({
                            title: "Date invalide",
                            description: "Veuillez sélectionner une date qui n'est pas dans le passé.",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        if (date.getDay() === 0) {
                          toast({
                            title: "Jour indisponible",
                            description: "Désolé, les dimanches ne sont pas disponibles pour les rendez-vous.",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        if (date > maxDate) {
                          toast({
                            title: "Date trop éloignée",
                            description: "Veuillez sélectionner une date dans les 30 prochains jours.",
                            variant: "destructive"
                          });
                          return;
                        }
                      }
                      updateFormData('schedulingDetails', 'date', date);
                    }}
                    min={format(new Date(), "yyyy-MM-dd")}
                    max={format(new Date(new Date().setDate(new Date().getDate() + 30)), "yyyy-MM-dd")}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    * Sélectionnez une date dans les 30 prochains jours. Les dimanches ne sont pas disponibles.
                  </p>
                  
                  <Label className="block mb-3 mt-6">Sélectionnez un créneau horaire</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all
                          ${formData.schedulingDetails.timeSlot === slot 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-muted-foreground'}`}
                        onClick={() => updateFormData('schedulingDetails', 'timeSlot', slot)}
                      >
                        <div className="text-primary">
                          <Clock className="h-5 w-5" />
                        </div>
                        <span>{slot}</span>
                        {formData.schedulingDetails.timeSlot === slot && (
                          <Check className="h-5 w-5 ml-auto text-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 border border-primary/30 bg-primary/10 rounded-lg">
                    <h3 className="text-primary font-medium mb-2 flex items-center">
                      <Info className="h-5 w-5 mr-2" />
                      Informations sur le rendez-vous
                    </h3>
                    <p className="text-foreground text-sm mb-2">
                      Notre technicien arrivera pendant le créneau horaire que vous avez sélectionné. Les visites de service durent généralement 1 à 2 heures selon la complexité du problème.
                    </p>
                    <p className="text-foreground text-sm">
                      Si vous devez reporter, veuillez nous contacter au moins 24 heures à l'avance.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/* Step 4: Customer Information (previously Step 3) */}
              <motion.div
                initial="hidden"
                animate={step === 4 ? "visible" : "hidden"}
                exit="exit"
                variants={containerVariants}
                className={step === 4 ? "block" : "hidden"}
              >
                <div className="mb-6 space-y-2">
                  <h2 className="text-xl font-semibold text-primary">Vos informations</h2>
                  <p className="text-muted-foreground">Indiquez-nous comment vous contacter et où le service est nécessaire</p>
                </div>
                
                <div className="mb-6">
                  <Label className="text-lg font-medium mb-2">Êtes-vous un particulier ou une entreprise ?</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="individual"
                        name="clientType"
                        value="individual"
                        checked={formData.clientType === "individual"}
                        onChange={() => updateFormData(null, 'clientType', 'individual')}
                        className="h-4 w-4 text-primary"
                      />
                      <Label htmlFor="individual">Particulier</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="business"
                        name="clientType"
                        value="business"
                        checked={formData.clientType === "business"}
                        onChange={() => updateFormData(null, 'clientType', 'business')}
                        className="h-4 w-4 text-primary"
                      />
                      <Label htmlFor="business">Entreprise</Label>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Nom complet</Label>
                    <Input
                      id="full-name"
                      placeholder="Votre nom complet"
                      className="bg-background border-border"
                      value={formData.contactInfo.fullName}
                      onChange={(e) => updateFormData('contactInfo', 'fullName', e.target.value)}
                    />
                  </div>
                  
                  {formData.clientType === "business" && (
                    <div className="space-y-2">
                      <Label htmlFor="business-name">Nom de l'entreprise</Label>
                      <Input
                        id="business-name"
                        placeholder="Nom de votre entreprise"
                        className="bg-background border-border"
                        value={formData.contactInfo.businessName}
                        onChange={(e) => updateFormData('contactInfo', 'businessName', e.target.value)}
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre.email@exemple.com"
                      className="bg-background border-border"
                      value={formData.contactInfo.email}
                      onChange={(e) => updateFormData('contactInfo', 'email', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Numéro de téléphone</Label>
                    <Input
                      id="phone"
                      placeholder="Votre numéro de téléphone"
                      className="bg-background border-border"
                      value={formData.contactInfo.phone}
                      onChange={(e) => updateFormData('contactInfo', 'phone', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <Label className="text-lg font-medium mb-2">Méthode de contact préférée</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="contact-email"
                        name="preferredContact"
                        value="email"
                        checked={formData.contactInfo.preferredContact === "email"}
                        onChange={() => updateFormData('contactInfo', 'preferredContact', 'email')}
                        className="h-4 w-4 text-primary"
                      />
                      <Label htmlFor="contact-email">Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="contact-phone"
                        name="preferredContact"
                        value="phone"
                        checked={formData.contactInfo.preferredContact === "phone"}
                        onChange={() => updateFormData('contactInfo', 'preferredContact', 'phone')}
                        className="h-4 w-4 text-primary"
                      />
                      <Label htmlFor="contact-phone">Téléphone</Label>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="address">Adresse de service</Label>
                  <Textarea
                    id="address"
                    placeholder="Entrez l'adresse où le service est nécessaire"
                    className="bg-background border-border"
                    value={formData.contactInfo.address}
                    onChange={(e) => updateFormData('contactInfo', 'address', e.target.value)}
                  />
                </div>

                <div className="mt-6 text-muted-foreground">
                  <p>En soumettant cette demande, vous acceptez nos <a href="#" className="text-primary underline">Conditions d'utilisation</a> et notre <a href="#" className="text-primary underline">Politique de confidentialité</a>.</p>
                </div>
              </motion.div>
              
              {/* Step 5: Review & Submit */}
              <motion.div
                initial="hidden"
                animate={step === 5 ? "visible" : "hidden"}
                exit="exit"
                variants={containerVariants}
                className={step === 5 ? "block" : "hidden"}
              >
                <div className="mb-6 space-y-2">
                  <h2 className="text-xl font-semibold text-primary">Vérifiez votre demande</h2>
                  <p className="text-muted-foreground">Veuillez vérifier toutes les informations avant de soumettre</p>
                </div>
                
                <div className="space-y-6">
                  <div className="border border-border rounded-lg p-4">
                    <h3 className="font-medium text-lg text-primary mb-2">Détails du service</h3>
                    <div>
                      <span className="text-muted-foreground">Types de services :</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {formData.serviceTypes.length > 0 ? (
                          formData.serviceTypes.map(serviceId => (
                            <Badge key={serviceId} className="bg-primary/20 text-primary border-primary">
                              {serviceTypes.find(s => s.id === serviceId)?.name}
                            </Badge>
                          ))
                        ) : (
                          <p>Aucun service sélectionné</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-muted-foreground">Types d'appareils :</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {formData.deviceTypes.length > 0 ? (
                          formData.deviceTypes.map(deviceId => (
                            <Badge key={deviceId} className="bg-primary/20 text-primary border-primary">
                              {deviceTypes.find(d => d.id === deviceId)?.name}
                            </Badge>
                          ))
                        ) : (
                          <p>Aucun appareil sélectionné</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-border rounded-lg p-4">
                    <h3 className="font-medium text-lg text-primary mb-2">Informations sur l'appareil</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                      <div>
                        <span className="text-muted-foreground">Marque :</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.deviceDetails.makes.length > 0 ? (
                            formData.deviceDetails.makes.map(brand => (
                              <Badge key={brand} className="bg-primary/20 text-primary border-primary">
                                {brand === "Autre" ? formData.deviceDetails.otherMake || "Autre" : brand}
                              </Badge>
                            ))
                          ) : (
                            <p>Non fourni</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Modèle :</span>
                        <p>{formData.deviceDetails.model || 'Non fourni'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Système d'exploitation :</span>
                        <p>{formData.deviceDetails.operatingSystem || 'Non sélectionné'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date d'achat :</span>
                        <p>{formData.deviceDetails.purchaseDate || 'Non fourni'}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-muted-foreground">Description du problème :</span>
                      <p className="mt-1">{formData.deviceDetails.problemDescription || 'Non fourni'}</p>
                    </div>
                  </div>
                  
                  <div className="border border-border rounded-lg p-4">
                    <h3 className="font-medium text-lg text-primary mb-2">Détails du rendez-vous</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                      <div>
                        <span className="text-muted-foreground">Date de service :</span>
                        <p>{formData.schedulingDetails.date ? format(formData.schedulingDetails.date, "PPP") : 'Non sélectionné'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Créneau horaire :</span>
                        <p>{formData.schedulingDetails.timeSlot || 'Non sélectionné'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-border rounded-lg p-4">
                    <h3 className="font-medium text-lg text-primary mb-2">Informations de contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                      <div>
                        <span className="text-muted-foreground">Type de client :</span>
                        <p className="capitalize">{formData.clientType === "individual" ? "Particulier" : "Entreprise"}</p>
                      </div>
                      {formData.clientType === "business" && (
                        <div>
                          <span className="text-muted-foreground">Nom de l'entreprise :</span>
                          <p>{formData.contactInfo.businessName || 'Non fourni'}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Nom complet :</span>
                        <p>{formData.contactInfo.fullName || 'Non fourni'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email :</span>
                        <p>{formData.contactInfo.email || 'Non fourni'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Téléphone :</span>
                        <p>{formData.contactInfo.phone || 'Non fourni'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contact préféré :</span>
                        <p className="capitalize">{formData.contactInfo.preferredContact === "email" ? "Email" : "Téléphone"}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-muted-foreground">Adresse de service :</span>
                      <p className="mt-1">{formData.contactInfo.address || 'Non fourni'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-muted-foreground">
                  <p>En soumettant cette demande, vous acceptez nos <a href="#" className="text-primary underline">Conditions d'utilisation</a> et notre <a href="#" className="text-primary underline">Politique de confidentialité</a>.</p>
                </div>
              </motion.div>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-between py-6 border-t border-border">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="border-border"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Retour
              </Button>
            )}
            {step < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Suivant <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={handleSubmit}
                className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Soumettre la demande
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ServiceRequest;