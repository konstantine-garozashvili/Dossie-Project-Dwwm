import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Monitor, Cpu, Shield, Wifi, Clock, Zap } from "lucide-react";

const servicesData = [
  {
    id: "hardware-repair",
    title: "Hardware Repair",
    icon: <Monitor className="w-8 h-8" />,
    description: "Expert repair services for all types of computer hardware issues.",
    features: [
      "Motherboard diagnostics and repair",
      "Screen and display replacement",
      "Keyboard and trackpad replacement",
      "Battery replacement and testing",
      "Power supply and charging issues",
      "RAM and storage upgrades",
      "Cooling system repairs and maintenance"
    ],
    pricing: [
      { name: "Diagnostics", price: "$49" },
      { name: "Basic Repair", price: "$99" },
      { name: "Component Replacement", price: "From $149" },
      { name: "Complete System Overhaul", price: "From $299" },
    ],
    turnaround: "24-72 hours depending on complexity",
    image: "https://images.pexels.com/photos/3568520/pexels-photo-3568520.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: "software-issues",
    title: "Software Solutions",
    icon: <Cpu className="w-8 h-8" />,
    description: "Comprehensive software services to keep your computer running smoothly.",
    features: [
      "Operating system installation and upgrades",
      "Software troubleshooting and repairs",
      "Performance optimization",
      "System backup and recovery",
      "Driver updates and compatibility fixes",
      "Software conflict resolution",
      "Custom software setup and configuration"
    ],
    pricing: [
      { name: "OS Installation", price: "$79" },
      { name: "System Optimization", price: "$69" },
      { name: "Software Troubleshooting", price: "$89" },
      { name: "Complete System Restore", price: "$129" },
    ],
    turnaround: "1-24 hours for most software issues",
    image: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: "data-recovery",
    title: "Data Recovery",
    icon: <Cpu className="w-8 h-8" />,
    description: "Specialized services to recover lost or inaccessible data from storage devices.",
    features: [
      "Recovery from formatted or corrupted drives",
      "File system repair and reconstruction",
      "Data retrieval from damaged storage media",
      "Secure data recovery process",
      "Recovery from accidental deletion",
      "Recovery from failed drives and RAID arrays",
      "Specialized tool recovery techniques"
    ],
    pricing: [
      { name: "Standard Recovery", price: "$149" },
      { name: "Advanced Recovery", price: "$249" },
      { name: "RAID/Server Recovery", price: "From $499" },
      { name: "Emergency Recovery", price: "From $299" },
    ],
    turnaround: "2-5 days for most cases, expedited service available",
    image: "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: "security",
    title: "Virus Removal",
    icon: <Shield className="w-8 h-8" />,
    description: "Protection and removal services for malware, viruses, and other security threats.",
    features: [
      "Comprehensive virus and malware removal",
      "Ransomware recovery assistance",
      "Security assessment and hardening",
      "Installation of security software",
      "Configuration of firewalls and security tools",
      "Secure data backup implementation",
      "Security best practices training"
    ],
    pricing: [
      { name: "Basic Virus Removal", price: "$79" },
      { name: "Advanced Malware Cleanup", price: "$129" },
      { name: "Ransomware Recovery", price: "From $199" },
      { name: "Security Suite Implementation", price: "$99" },
    ],
    turnaround: "24-48 hours for most security issues",
    image: "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: "networking",
    title: "Network Services",
    icon: <Wifi className="w-8 h-8" />,
    description: "Complete solutions for setting up, securing, and optimizing your home or business network.",
    features: [
      "Wi-Fi network setup and optimization",
      "Router and modem configuration",
      "Network security implementation",
      "Wired network installation",
      "Network troubleshooting",
      "VPN setup and configuration",
      "Network performance optimization"
    ],
    pricing: [
      { name: "Basic Wi-Fi Setup", price: "$79" },
      { name: "Advanced Network Configuration", price: "$149" },
      { name: "Business Network Setup", price: "From $299" },
      { name: "Network Security Audit", price: "$199" },
    ],
    turnaround: "Same day for basic setups, 1-3 days for complex networks",
    image: "https://images.pexels.com/photos/3762927/pexels-photo-3762927.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: "maintenance",
    title: "Preventive Maintenance",
    icon: <Clock className="w-8 h-8" />,
    description: "Regular maintenance services to prevent problems and extend the life of your computers.",
    features: [
      "Hardware cleaning and dust removal",
      "System performance optimization",
      "Software updates and patches",
      "Disk error checking and repair",
      "Battery health assessment",
      "Cooling system maintenance",
      "Preventive diagnostics and reporting"
    ],
    pricing: [
      { name: "Basic Maintenance", price: "$59" },
      { name: "Full System Tune-up", price: "$99" },
      { name: "Annual Maintenance Plan", price: "$199/year" },
      { name: "Business Maintenance (per device)", price: "From $39/month" },
    ],
    turnaround: "Usually completed within 24 hours",
    image: "https://images.pexels.com/photos/6804612/pexels-photo-6804612.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
];

const Services = () => {
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

  return (
    <div className="min-h-screen bg-slate-950 text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 px-3 py-1 bg-cyan-500/20 text-cyan-400 border-cyan-500 inline-flex w-auto">
            Professional Services
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Computer Repair & Support Services
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            From hardware repairs to software issues, our expert technicians offer a complete range of services to keep your technology running smoothly.
          </p>
        </div>

        {/* Service Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700 shadow-lg"
          >
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Turnaround</h3>
            <p className="text-gray-400">Most repairs completed within 24-48 hours, with same-day service available for emergencies.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700 shadow-lg"
          >
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quality Guarantee</h3>
            <p className="text-gray-400">All repairs backed by our 90-day warranty. If the problem returns, we'll fix it at no additional cost.</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700 shadow-lg"
          >
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Certified Technicians</h3>
            <p className="text-gray-400">Our expert technicians are certified and have years of experience solving complex computer problems.</p>
          </motion.div>
        </div>

        {/* Tabs for Service Categories */}
        <Tabs defaultValue="hardware-repair" className="mb-16">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8 bg-slate-800/50">
            {servicesData.map(service => (
              <TabsTrigger key={service.id} value={service.id} className="data-[state=active]:text-cyan-400">
                <span className="hidden md:inline mr-2">{service.icon}</span>
                <span className="truncate">{service.title.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {servicesData.map(service => (
            <TabsContent key={service.id} value={service.id}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full h-64 md:h-80 overflow-hidden rounded-xl mb-6"
                  >
                    <img 
                      src={service.image} 
                      alt={service.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                          {service.icon}
                        </div>
                        <h2 className="text-2xl font-bold">{service.title}</h2>
                      </div>
                    </div>
                  </motion.div>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3 text-cyan-400">Description</h3>
                    <p className="text-gray-300">{service.description}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3 text-cyan-400">Features</h3>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-cyan-400 mr-2 mt-1">▹</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <Card className="bg-slate-800 border-slate-700 shadow-lg mb-6">
                    <CardHeader>
                      <CardTitle className="text-xl text-cyan-400">Pricing</CardTitle>
                      <CardDescription>Transparent pricing with no hidden fees</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {service.pricing.map((item, idx) => (
                          <div key={idx} className="flex justify-between py-2 border-b border-slate-700">
                            <span>{item.name}</span>
                            <span className="font-semibold">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="text-sm text-gray-400">
                      All prices are starting estimates. Final pricing may vary based on device make, model, and condition.
                    </CardFooter>
                  </Card>
                  
                  <Card className="bg-slate-800 border-slate-700 shadow-lg mb-6">
                    <CardHeader>
                      <CardTitle className="text-xl text-cyan-400">Turnaround Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center mb-4">
                        <Clock className="w-5 h-5 text-cyan-400 mr-2" />
                        <span>{service.turnaround}</span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        We know your technology is important. We strive to complete all repairs as quickly as possible while ensuring quality work.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="bg-cyan-500 hover:bg-cyan-600" asChild>
                      <Link to="/service-request">Schedule Repair</Link>
                    </Button>
                    <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
                      Request Quote
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        {/* Why Choose Us */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="bg-slate-900 rounded-xl p-8 mb-16"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
              Why Choose DWWM Computer Shop?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              With thousands of satisfied customers, here's why you should trust us with your computer repair needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={itemVariants} className="bg-slate-800 rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-2">Expert Technicians</h3>
              <p className="text-gray-400">Certified professionals with years of experience in computer repair.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-slate-800 rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-2">Quick Turnaround</h3>
              <p className="text-gray-400">Fast service without compromising on quality.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-slate-800 rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-2">Transparent Pricing</h3>
              <p className="text-gray-400">No hidden fees or surprises on your final bill.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="bg-slate-800 rounded-lg p-5">
              <h3 className="text-lg font-semibold mb-2">Service Guarantee</h3>
              <p className="text-gray-400">All repairs backed by our 90-day warranty.</p>
            </motion.div>
          </div>
        </motion.div>
        
        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to fix your computer?</h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-6">
            Schedule a repair or request a quote online and we'll get your technology working again in no time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-cyan-600 hover:bg-gray-100" asChild>
              <Link to="/service-request">Schedule Repair Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services; 