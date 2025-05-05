import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Monitor, Cpu, Shield, Wifi, Clock, Zap, Star, ChevronRight, Wrench, HardDrive, Lock } from "lucide-react";

// Enhanced service data with additional fields for better UI presentation
const servicesData = [
  {
    id: "hardware-repair",
    title: "Réparation Matérielle",
    icon: <Monitor className="w-8 h-8" />,
    color: "blue",
    tagline: "Diagnostic et réparation par experts",
    description: "Services de réparation pour tous types de problèmes matériels, des réparations simples aux remplacements de composants complexes.",
    features: [
      "Diagnostic et réparation de carte mère",
      "Remplacement d'écran et d'affichage",
      "Remplacement de clavier et de pavé tactile",
      "Remplacement et test de batterie",
      "Problèmes d'alimentation et de charge",
      "Mises à niveau de RAM et de stockage",
      "Réparations et entretien du système de refroidissement"
    ],
    pricing: [
      { name: "Diagnostic", price: "49€", popular: false },
      { name: "Réparation de base", price: "99€", popular: true },
      { name: "Remplacement de composants", price: "À partir de 149€", popular: false },
      { name: "Révision complète du système", price: "À partir de 299€", popular: false },
    ],
    turnaround: "24 à 72 heures selon la complexité",
    image: "https://images.pexels.com/photos/3568520/pexels-photo-3568520.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: "software-issues",
    title: "Solutions Logicielles",
    icon: <Cpu className="w-8 h-8" />,
    color: "cyan",
    tagline: "Résolution de tous problèmes logiciels",
    description: "Services logiciels complets pour assurer le bon fonctionnement de votre ordinateur, de l'optimisation système au dépannage.",
    features: [
      "Installation et mises à niveau de système d'exploitation",
      "Dépannage et réparations logicielles",
      "Optimisation des performances",
      "Sauvegarde et récupération du système",
      "Mises à jour de pilotes et corrections de compatibilité",
      "Résolution de conflits logiciels",
      "Configuration et personnalisation de logiciels"
    ],
    pricing: [
      { name: "Installation OS", price: "79€", popular: false },
      { name: "Optimisation système", price: "69€", popular: true },
      { name: "Dépannage logiciel", price: "89€", popular: false },
      { name: "Restauration complète", price: "129€", popular: false },
    ],
    turnaround: "1 à 24 heures pour la plupart des problèmes logiciels",
    image: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: "data-recovery",
    title: "Récupération de Données",
    icon: <HardDrive className="w-8 h-8" />,
    color: "green",
    tagline: "Récupérez vos données précieuses",
    description: "Services spécialisés pour récupérer des données perdues ou inaccessibles à partir de périphériques de stockage, même dans les cas de dommages graves.",
    features: [
      "Récupération à partir de disques formatés ou corrompus",
      "Réparation et reconstruction de systèmes de fichiers",
      "Récupération de données sur supports endommagés",
      "Processus sécurisé de récupération de données",
      "Récupération suite à une suppression accidentelle",
      "Récupération à partir de disques défaillants et matrices RAID",
      "Techniques de récupération avec outils spécialisés"
    ],
    pricing: [
      { name: "Récupération standard", price: "149€", popular: false },
      { name: "Récupération avancée", price: "249€", popular: true },
      { name: "Récupération RAID/Serveur", price: "À partir de 499€", popular: false },
      { name: "Récupération d'urgence", price: "À partir de 299€", popular: false },
    ],
    turnaround: "2 à 5 jours pour la plupart des cas, service accéléré disponible",
    image: "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: "security",
    title: "Suppression de Virus",
    icon: <Lock className="w-8 h-8" />,
    color: "red",
    tagline: "Protégez votre sécurité numérique",
    description: "Services de protection et de suppression contre les logiciels malveillants, les virus et autres menaces de sécurité pour garder vos données en sécurité.",
    features: [
      "Suppression complète de virus et logiciels malveillants",
      "Assistance de récupération après ransomware",
      "Évaluation et renforcement de la sécurité",
      "Installation de logiciels de sécurité",
      "Configuration de pare-feu et d'outils de sécurité",
      "Mise en œuvre de sauvegarde sécurisée",
      "Formation aux meilleures pratiques de sécurité"
    ],
    pricing: [
      { name: "Suppression de virus basique", price: "79€", popular: false },
      { name: "Nettoyage avancé de malwares", price: "129€", popular: true },
      { name: "Récupération ransomware", price: "À partir de 199€", popular: false },
      { name: "Mise en place suite sécurité", price: "99€", popular: false },
    ],
    turnaround: "24 à 48 heures pour la plupart des problèmes de sécurité",
    image: "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: "networking",
    title: "Services Réseau",
    icon: <Wifi className="w-8 h-8" />,
    color: "purple",
    tagline: "Optimisez votre connectivité",
    description: "Solutions complètes pour configurer, sécuriser et optimiser votre infrastructure réseau domestique ou professionnelle.",
    features: [
      "Configuration et optimisation de réseau Wi-Fi",
      "Configuration de routeur et de modem",
      "Mise en œuvre de sécurité réseau",
      "Installation de réseau filaire",
      "Dépannage réseau",
      "Configuration et mise en place de VPN",
      "Optimisation des performances réseau"
    ],
    pricing: [
      { name: "Configuration Wi-Fi basique", price: "79€", popular: false },
      { name: "Configuration réseau avancée", price: "149€", popular: true },
      { name: "Configuration réseau entreprise", price: "À partir de 299€", popular: false },
      { name: "Audit de sécurité réseau", price: "199€", popular: false },
    ],
    turnaround: "Le jour même pour les configurations basiques, 1 à 3 jours pour les réseaux complexes",
    image: "https://images.pexels.com/photos/3762927/pexels-photo-3762927.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: "maintenance",
    title: "Maintenance Préventive",
    icon: <Wrench className="w-8 h-8" />,
    color: "amber",
    tagline: "Prévenez les problèmes avant qu'ils n'arrivent",
    description: "Services de maintenance régulière pour prévenir les problèmes et prolonger la durée de vie de vos ordinateurs et de votre infrastructure informatique.",
    features: [
      "Nettoyage matériel et élimination de poussière",
      "Optimisation des performances système",
      "Mises à jour logicielles et correctifs",
      "Vérification et réparation des erreurs de disque",
      "Évaluation de la santé de la batterie",
      "Maintenance du système de refroidissement",
      "Diagnostics préventifs et rapports"
    ],
    pricing: [
      { name: "Maintenance de base", price: "59€", popular: false },
      { name: "Mise au point complète", price: "99€", popular: true },
      { name: "Plan de maintenance annuel", price: "199€/an", popular: false },
      { name: "Maintenance entreprise (par appareil)", price: "À partir de 39€/mois", popular: false },
    ],
    turnaround: "Généralement terminé dans les 24 heures",
    image: "https://images.pexels.com/photos/6804612/pexels-photo-6804612.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
];

export const Services = () => {
  const [selectedTab, setSelectedTab] = useState("hardware-repair");
  
  // Create refs for each service section
  const serviceRefs = useRef({});
  
  // Initialize refs for each service
  useEffect(() => {
    servicesData.forEach(service => {
      serviceRefs.current[service.id] = serviceRefs.current[service.id] || React.createRef();
    });
  }, []);
  
  // Function to handle tab changes and scrolling
  const handleTabChange = (value) => {
    console.log("Tab changed to:", value);
    setSelectedTab(value);
    
    // Add a class to body to enable scroll-padding
    document.body.classList.add('has-scroll-padding');
    
    // Use a longer timeout to ensure content is rendered
    setTimeout(() => {
      const elementId = `service-section-${value}`;
      const element = document.getElementById(elementId);
      
      console.log("Looking for element with ID:", elementId);
      console.log("Element found:", !!element);
      
      if (element) {
        try {
          // Use scrollIntoView for more reliable scrolling
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          console.log("Scrolled to element");
        } catch (error) {
          console.error("Error scrolling:", error);
        }
      } else {
        console.warn("Element not found:", elementId);
      }
    }, 150); // Longer timeout to ensure content is rendered
  };
  
  // Add global scroll padding on component mount
  useEffect(() => {
    // Add CSS to handle scroll padding
    const style = document.createElement('style');
    style.innerHTML = `
      html {
        scroll-padding-top: 150px;
      }
      .has-scroll-padding {
        scroll-padding-top: 150px;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      // Clean up
      document.head.removeChild(style);
      document.body.classList.remove('has-scroll-padding');
    };
  }, []);
  
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // IntersectionObserver hooks for animating sections as they come into view
  const [heroRef, heroInView] = useInView({ 
    threshold: 0.1,
    triggerOnce: true
  });
  
  const [highlightsRef, highlightsInView] = useInView({ 
    threshold: 0.1,
    triggerOnce: true 
  });
  
  const [tabsRef, tabsInView] = useInView({ 
    threshold: 0.1,
    triggerOnce: true 
  });
  
  const [chooseUsRef, chooseUsInView] = useInView({ 
    threshold: 0.1,
    triggerOnce: true 
  });

  // Get the current selected service
  const currentService = servicesData.find(service => service.id === selectedTab);
  
  // Color mapping for services
  const colorMap = {
    blue: "from-blue-500 to-blue-700 border-blue-400 text-blue-400 bg-blue-500/10",
    cyan: "from-cyan-500 to-cyan-700 border-cyan-400 text-cyan-400 bg-cyan-500/10",
    green: "from-emerald-500 to-emerald-700 border-emerald-400 text-emerald-400 bg-emerald-500/10",
    red: "from-rose-500 to-rose-700 border-rose-400 text-rose-400 bg-rose-500/10",
    purple: "from-purple-500 to-purple-700 border-purple-400 text-purple-400 bg-purple-500/10",
    amber: "from-amber-500 to-amber-700 border-amber-400 text-amber-400 bg-amber-500/10",
  };

  // Helper function to get color classes
  const getColorClasses = (service, type) => {
    const color = service.color || "blue";
    
    if (type === "badge") {
      return `bg-${color}-500/20 text-${color}-400 border-${color}-500`;
    }
    
    if (type === "gradient") {
      return `from-${color}-400 to-${color}-300`;
    }
    
    if (type === "button") {
      return `bg-${color}-500 hover:bg-${color}-600`;
    }
    
    if (type === "icon") {
      return `text-${color}-400`;
    }
    
    return "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white py-12 md:py-20 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section with enhanced animations */}
        <motion.div 
          ref={heroRef}
          initial={{ opacity: 0, y: 30 }}
          animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 px-3 py-1 bg-cyan-500/20 text-cyan-400 border-cyan-500 inline-flex w-auto">
            Solutions Professionnelles
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Services de Réparation<br className="hidden sm:inline" /> d'Ordinateurs
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
            De la réparation matérielle aux problèmes logiciels, nos techniciens experts offrent une gamme complète de services pour maintenir votre technologie en parfait état de fonctionnement.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white" size="lg" asChild>
              <Link to="/service-request">Demander une réparation</Link>
            </Button>
            <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10" size="lg">
              <Link to="/#contact">Nous contacter</Link>
            </Button>
          </div>
        </motion.div>

        {/* Service Highlights - Enhanced with better animations and visuals */}
        <motion.div 
          ref={highlightsRef}
          initial="hidden"
          animate={highlightsInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16"
        >
          <motion.div 
            variants={itemVariants}
            className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-lg hover:shadow-cyan-900/20 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-cyan-400 transition-colors">Délai de Réparation Rapide</h3>
            <p className="text-gray-400">La plupart des réparations sont effectuées dans un délai de 24 à 48 heures, avec un service le jour même disponible pour les urgences.</p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-lg hover:shadow-cyan-900/20 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-cyan-400 transition-colors">Garantie de Qualité</h3>
            <p className="text-gray-400">Toutes les réparations sont couvertes par notre garantie de 90 jours. Si le problème revient, nous le réparerons sans frais supplémentaires.</p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 shadow-lg hover:shadow-cyan-900/20 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Check className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 group-hover:text-cyan-400 transition-colors">Techniciens Certifiés</h3>
            <p className="text-gray-400">Nos techniciens experts sont certifiés et possèdent des années d'expérience dans la résolution de problèmes informatiques complexes.</p>
          </motion.div>
        </motion.div>

        {/* Tabs for Service Categories - Enhanced with better animations and responsiveness */}
        <motion.div
          ref={tabsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={tabsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="mb-16">
            <div className="sticky top-16 z-20 bg-slate-950/90 backdrop-blur-sm pt-4 pb-2 -mx-4 px-4">
              <div className="relative mb-8 overflow-x-auto pb-2 no-scrollbar">
                <div className="inline-flex min-w-full md:w-auto bg-slate-800/50 rounded-full p-1">
                  {servicesData.map(service => (
                    <button 
                      key={service.id} 
                      onClick={() => handleTabChange(service.id)}
                      className={`rounded-full transition-all duration-300 px-4 py-2 inline-flex items-center justify-center ${
                        selectedTab === service.id ? `text-white bg-gradient-to-r ${colorMap[service.color]}` : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      <span className="hidden md:inline mr-2">{service.icon}</span>
                      <span className="truncate">{service.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {servicesData.map(service => (
                service.id === selectedTab && (
                  <div key={service.id}>
                    <div id={`service-section-${service.id}`} className="scroll-mt-40 pt-2">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 lg:grid-cols-5 gap-8"
                      >
                        <div className="lg:col-span-3">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden rounded-2xl mb-8 group"
                          >
                            <img 
                              src={service.image} 
                              alt={service.title} 
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-6 md:p-8">
                              <Badge className={`mb-3 px-3 py-1 ${getColorClasses(service, "badge")} inline-flex w-auto`}>
                                {service.tagline}
                              </Badge>
                              <div className="flex items-center space-x-3">
                                <div className={`w-12 h-12 rounded-full bg-${service.color}-500/20 flex items-center justify-center`}>
                                  {service.icon}
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold">{service.title}</h2>
                              </div>
                            </div>
                          </motion.div>
                          
                          <div className="mb-8">
                            <h3 className={`text-xl font-semibold mb-3 text-${service.color}-400`}>Description</h3>
                            <p className="text-gray-300 text-lg">{service.description}</p>
                          </div>
                          
                          <div className="mb-6">
                            <h3 className={`text-xl font-semibold mb-4 text-${service.color}-400`}>Caractéristiques</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {service.features.map((feature, idx) => (
                                <motion.div 
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }} 
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 + 0.2 }}
                                  className="flex items-start"
                                >
                                  <div className={`h-6 w-6 rounded-full bg-${service.color}-500/20 flex-shrink-0 flex items-center justify-center mr-3 mt-0.5`}>
                                    <Check className={`h-3.5 w-3.5 text-${service.color}-400`} />
                                  </div>
                                  <span className="text-gray-300">{feature}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="lg:col-span-2 space-y-6">
                          <Card className="bg-slate-800/50 border-slate-700 shadow-xl backdrop-blur-sm overflow-hidden">
                            <CardHeader className="relative pb-0">
                              <div className="absolute top-0 right-0 h-24 w-24 -mr-6 -mt-6 blur-3xl rounded-full opacity-20 bg-gradient-to-br from-cyan-400 to-blue-500"></div>
                              <CardTitle className={`text-xl text-${service.color}-400`}>Tarification</CardTitle>
                              <CardDescription>Prix transparents sans frais cachés</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                              <div className="space-y-1">
                                {service.pricing.map((item, idx) => (
                                  <div 
                                    key={idx} 
                                    className={`flex justify-between py-3 px-3 rounded-lg ${item.popular ? `bg-${service.color}-500/10 border border-${service.color}-500/20` : 'border-b border-slate-700'}`}
                                  >
                                    <div className="flex items-center">
                                      <span className="font-medium">{item.name}</span>
                                      {item.popular && (
                                        <Badge className="ml-2 bg-cyan-500/20 text-cyan-400 border-cyan-500">
                                          Populaire
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="font-semibold">{item.price}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                            <CardFooter className="text-sm text-gray-400 border-t border-slate-700/50 mt-2">
                              Tous les prix sont des estimations de départ. Les prix finaux peuvent varier en fonction de la marque, du modèle et de l'état de l'appareil.
                            </CardFooter>
                          </Card>
                          
                          <Card className="bg-slate-800/50 border-slate-700 shadow-xl backdrop-blur-sm">
                            <CardHeader>
                              <CardTitle className={`text-xl text-${service.color}-400`}>Délai d'Exécution</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex items-center mb-4">
                                <Clock className={`w-5 h-5 text-${service.color}-400 mr-2`} />
                                <span>{service.turnaround}</span>
                              </div>
                              <p className="text-gray-400 text-sm">
                                Nous savons que votre technologie est importante. Nous nous efforçons de terminer toutes les réparations aussi rapidement que possible tout en garantissant un travail de qualité.
                              </p>
                            </CardContent>
                          </Card>
                          
                          <div className="pt-4">
                            <Button className={`w-full mb-3 bg-${service.color}-500 hover:bg-${service.color}-600`} size="lg" asChild>
                              <Link to="/service-request" className="flex items-center justify-center">
                                Planifier une réparation
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="outline" className={`w-full border-${service.color}-400 text-${service.color}-400 hover:bg-${service.color}-400/10`}>
                              Demander un devis
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                )
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
        
        {/* Why Choose Us - Enhanced with better animations and layout */}
        <motion.div
          ref={chooseUsRef}
          initial="hidden"
          animate={chooseUsInView ? "visible" : "hidden"}
          variants={containerVariants}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-10 mb-16 border border-slate-700 shadow-xl"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
              Pourquoi Choisir DWWM Computer Shop?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Avec des milliers de clients satisfaits, voici pourquoi vous devriez nous confier vos besoins en réparation informatique.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={itemVariants} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Techniciens Experts</h3>
              <p className="text-gray-400">Professionnels certifiés avec des années d'expérience en réparation informatique.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Délai Rapide</h3>
              <p className="text-gray-400">Service rapide sans compromettre la qualité des réparations.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Prix Transparents</h3>
              <p className="text-gray-400">Pas de frais cachés ou de surprises sur votre facture finale.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Garantie de Service</h3>
              <p className="text-gray-400">Toutes les réparations sont couvertes par notre garantie de 90 jours.</p>
            </motion.div>
          </div>
        </motion.div>
        
        {/* CTA - Enhanced with better visuals and responsiveness */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 md:p-10 text-center">
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <svg className="absolute left-0 top-0 h-full" width="800" height="800" viewBox="0 0 800 800">
              <defs>
                <filter id="noise" x="0%" y="0%" width="100%" height="100%">
                  <feTurbulence baseFrequency="0.02" numOctaves="3" result="noise" seed="0"/>
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="5"/>
                </filter>
              </defs>
              <rect width="100%" height="100%" filter="url(#noise)" />
            </svg>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Prêt à réparer votre ordinateur?
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Planifiez une réparation ou demandez un devis en ligne et nous remettrons votre technologie en état de marche en un rien de temps.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-white text-cyan-600 hover:bg-gray-100 hover:shadow-lg transition-all" asChild>
                <Link to="/service-request" className="flex items-center justify-center">
                  Planifier une réparation maintenant
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contacter le support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;