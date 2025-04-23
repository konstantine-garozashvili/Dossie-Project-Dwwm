import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, ChevronRight, ChevronLeft, Calendar, Laptop, Server, Smartphone, Wifi, Shield, Clock, Info, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Hardware types
const deviceTypes = [
  { id: "laptop", name: "Laptop", icon: <Laptop className="w-6 h-6" /> },
  { id: "desktop", name: "Desktop Computer", icon: <Server className="w-6 h-6" /> },
  { id: "smartphone", name: "Smartphone", icon: <Smartphone className="w-6 h-6" /> },
  { id: "network", name: "Network Equipment", icon: <Wifi className="w-6 h-6" /> },
  { id: "storage", name: "Storage Device", icon: <Shield className="w-6 h-6" /> },
  { id: "other", name: "Other", icon: <Shield className="w-6 h-6" /> },
];

// Service types
const serviceTypes = [
  { id: "hardware-repair", name: "Hardware Repair", description: "Fix physical components of your device" },
  { id: "software-issue", name: "Software Issue", description: "Resolve software problems, crashes, or errors" },
  { id: "virus-removal", name: "Virus Removal", description: "Remove malware, viruses, and unwanted software" },
  { id: "data-recovery", name: "Data Recovery", description: "Recover lost or deleted files and data" },
  { id: "network-setup", name: "Network Setup", description: "Wi-Fi setup, router configuration, or network troubleshooting" },
  { id: "hardware-upgrade", name: "Hardware Upgrade", description: "Upgrade components for better performance" },
];

// Operating systems
const operatingSystems = [
  "Windows 11", "Windows 10", "Windows 8/8.1", "Windows 7", 
  "macOS Sonoma", "macOS Ventura", "macOS Monterey", "macOS Older Version",
  "Linux", "Chrome OS", "Android", "iOS/iPadOS", "Other"
];

// Available time slots
const timeSlots = [
  "9:00 AM - 11:00 AM",
  "11:00 AM - 1:00 PM", 
  "1:00 PM - 3:00 PM",
  "3:00 PM - 5:00 PM"
];

export const ServiceRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceType: "",
    deviceType: "",
    deviceDetails: {
      make: "",
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
  
  return (
    <div className="min-h-screen bg-slate-950 text-white py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <Badge className="mb-4 px-3 py-1 bg-cyan-500/20 text-cyan-400 border-cyan-500 inline-flex w-auto">
            Service Request
          </Badge>
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Schedule Your Computer Repair
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Tell us about your issue, and our expert technicians will help you get your device working again.
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map(num => (
              <div key={num} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2
                    ${step >= num ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-400'}`}
                >
                  {step > num ? <Check className="w-5 h-5" /> : num}
                </div>
                <div className={`text-sm ${step >= num ? 'text-gray-200' : 'text-gray-500'}`}>
                  {num === 1 ? 'Service Type' : 
                   num === 2 ? 'Device Details' : 
                   num === 3 ? 'Schedule Service' : 
                   num === 4 ? 'Your Information' :
                   'Review & Submit'}
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute h-1 w-full bg-gray-700"></div>
            <div 
              className="absolute h-1 bg-cyan-500 transition-all duration-500"
              style={{ width: `${(step - 1) * 25}%` }}
            ></div>
          </div>
        </div>
        
        <Card className="bg-slate-800 border-slate-700 shadow-xl">
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
                  <h2 className="text-xl font-semibold text-cyan-400">What service do you need?</h2>
                  <p className="text-gray-400">Select the type of service that best describes your issue</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {serviceTypes.map(service => (
                    <div
                      key={service.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all
                        ${formData.serviceType === service.id 
                          ? 'border-cyan-400 bg-cyan-500/10' 
                          : 'border-slate-700 hover:border-slate-500'}`}
                      onClick={() => updateFormData(null, 'serviceType', service.id)}
                    >
                      <div className="flex items-start">
                        <div className={`w-5 h-5 rounded-full border mr-3 mt-1 flex items-center justify-center
                          ${formData.serviceType === service.id ? 'border-cyan-400' : 'border-slate-700'}`}
                        >
                          {formData.serviceType === service.id && 
                            <div className="w-3 h-3 rounded-full bg-cyan-400"></div>}
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{service.name}</h3>
                          <p className="text-sm text-gray-400">{service.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">What type of device do you need help with?</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {deviceTypes.map(device => (
                      <div
                        key={device.id}
                        className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-all
                          ${formData.deviceType === device.id 
                            ? 'border-cyan-400 bg-cyan-500/10' 
                            : 'border-slate-700 hover:border-slate-500'}`}
                        onClick={() => updateFormData(null, 'deviceType', device.id)}
                      >
                        <div className="text-cyan-400 mb-2">{device.icon}</div>
                        <div className="text-center">{device.name}</div>
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
                  <h2 className="text-xl font-semibold text-cyan-400">Tell us about your device</h2>
                  <p className="text-gray-400">The more details you provide, the better we can diagnose your issue</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="device-make">Device Make/Brand</Label>
                    <Input
                      id="device-make"
                      placeholder="e.g., Apple, Dell, HP"
                      className="bg-slate-900 border-slate-700"
                      value={formData.deviceDetails.make}
                      onChange={(e) => updateFormData('deviceDetails', 'make', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="device-model">Device Model</Label>
                    <Input
                      id="device-model"
                      placeholder="e.g., MacBook Pro, XPS 13"
                      className="bg-slate-900 border-slate-700"
                      value={formData.deviceDetails.model}
                      onChange={(e) => updateFormData('deviceDetails', 'model', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="operating-system">Operating System</Label>
                  <select
                    id="operating-system"
                    className="w-full h-10 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white ring-offset-slate-700 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    value={formData.deviceDetails.operatingSystem}
                    onChange={(e) => updateFormData('deviceDetails', 'operatingSystem', e.target.value)}
                  >
                    <option value="">Select operating system</option>
                    {operatingSystems.map(os => (
                      <option key={os} value={os}>{os}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="purchase-date">Approximate Purchase Date (optional)</Label>
                  <Input
                    id="purchase-date"
                    type="date"
                    className="bg-slate-900 border-slate-700"
                    value={formData.deviceDetails.purchaseDate}
                    onChange={(e) => updateFormData('deviceDetails', 'purchaseDate', e.target.value)}
                  />
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="problem-description">Describe the problem in detail</Label>
                  <Textarea
                    id="problem-description"
                    placeholder="Please provide as much detail as possible about the issue you're experiencing..."
                    className="bg-slate-900 border-slate-700 min-h-[150px]"
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
                  <h2 className="text-xl font-semibold text-cyan-400">Schedule Your Service</h2>
                  <p className="text-gray-400">Choose a convenient date and time for our technician to help you</p>
                </div>
                
                <div className="mb-8">
                  <Label className="block mb-3">Select a Date</Label>
                  <Input
                    type="date"
                    className="bg-slate-900 border-slate-700 w-full max-w-sm"
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
                            title: "Invalid Date",
                            description: "Please select a date that is not in the past.",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        if (date.getDay() === 0) {
                          toast({
                            title: "Unavailable Day",
                            description: "Sorry, Sundays are not available for appointments.",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        if (date > maxDate) {
                          toast({
                            title: "Date Too Far",
                            description: "Please select a date within the next 30 days.",
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
                  <p className="text-sm text-slate-400 mt-2">
                    * Select a date within the next 30 days. Sundays are not available.
                  </p>
                  
                  <Label className="block mb-3 mt-6">Select a Time Slot</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {timeSlots.map((slot, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-all
                          ${formData.schedulingDetails.timeSlot === slot 
                            ? 'border-cyan-400 bg-cyan-500/10' 
                            : 'border-slate-700 hover:border-slate-500'}`}
                        onClick={() => updateFormData('schedulingDetails', 'timeSlot', slot)}
                      >
                        <div className="text-cyan-400">
                          <Clock className="h-5 w-5" />
                        </div>
                        <span>{slot}</span>
                        {formData.schedulingDetails.timeSlot === slot && (
                          <Check className="h-5 w-5 ml-auto text-cyan-400" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 border border-cyan-800/30 bg-cyan-900/10 rounded-lg">
                    <h3 className="text-cyan-400 font-medium mb-2 flex items-center">
                      <Info className="h-5 w-5 mr-2" />
                      Appointment Information
                    </h3>
                    <p className="text-gray-300 text-sm mb-2">
                      Our technician will arrive during your selected time slot. Service visits typically last 1-2 hours depending on the complexity of the issue.
                    </p>
                    <p className="text-gray-300 text-sm">
                      If you need to reschedule, please contact us at least 24 hours in advance.
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
                  <h2 className="text-xl font-semibold text-cyan-400">Your Information</h2>
                  <p className="text-gray-400">Tell us how to contact you and where service is needed</p>
                </div>
                
                <div className="mb-6">
                  <Label className="text-lg font-medium mb-2">Are you an individual or business?</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="individual"
                        name="clientType"
                        value="individual"
                        checked={formData.clientType === "individual"}
                        onChange={() => updateFormData(null, 'clientType', 'individual')}
                        className="h-4 w-4 text-cyan-500"
                      />
                      <Label htmlFor="individual">Individual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="business"
                        name="clientType"
                        value="business"
                        checked={formData.clientType === "business"}
                        onChange={() => updateFormData(null, 'clientType', 'business')}
                        className="h-4 w-4 text-cyan-500"
                      />
                      <Label htmlFor="business">Business</Label>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      placeholder="Your full name"
                      className="bg-slate-900 border-slate-700"
                      value={formData.contactInfo.fullName}
                      onChange={(e) => updateFormData('contactInfo', 'fullName', e.target.value)}
                    />
                  </div>
                  
                  {formData.clientType === "business" && (
                    <div className="space-y-2">
                      <Label htmlFor="business-name">Business Name</Label>
                      <Input
                        id="business-name"
                        placeholder="Your business name"
                        className="bg-slate-900 border-slate-700"
                        value={formData.contactInfo.businessName}
                        onChange={(e) => updateFormData('contactInfo', 'businessName', e.target.value)}
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="bg-slate-900 border-slate-700"
                      value={formData.contactInfo.email}
                      onChange={(e) => updateFormData('contactInfo', 'email', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="Your phone number"
                      className="bg-slate-900 border-slate-700"
                      value={formData.contactInfo.phone}
                      onChange={(e) => updateFormData('contactInfo', 'phone', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <Label className="text-lg font-medium mb-2">Preferred Contact Method</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="contact-email"
                        name="preferredContact"
                        value="email"
                        checked={formData.contactInfo.preferredContact === "email"}
                        onChange={() => updateFormData('contactInfo', 'preferredContact', 'email')}
                        className="h-4 w-4 text-cyan-500"
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
                        className="h-4 w-4 text-cyan-500"
                      />
                      <Label htmlFor="contact-phone">Phone</Label>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <Label htmlFor="address">Service Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter the address where service is needed"
                    className="bg-slate-900 border-slate-700"
                    value={formData.contactInfo.address}
                    onChange={(e) => updateFormData('contactInfo', 'address', e.target.value)}
                  />
                </div>

                <div className="mt-6 text-gray-400">
                  <p>By submitting this request, you agree to our <a href="#" className="text-cyan-400 underline">Terms of Service</a> and <a href="#" className="text-cyan-400 underline">Privacy Policy</a>.</p>
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
                  <h2 className="text-xl font-semibold text-cyan-400">Review Your Request</h2>
                  <p className="text-gray-400">Please verify all information before submitting</p>
                </div>
                
                <div className="space-y-6">
                  <div className="border border-slate-700 rounded-lg p-4">
                    <h3 className="font-medium text-lg text-cyan-400 mb-2">Service Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                      <div>
                        <span className="text-gray-400">Service Type:</span>
                        <p>{serviceTypes.find(s => s.id === formData.serviceType)?.name || 'Not selected'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Device Type:</span>
                        <p>{deviceTypes.find(d => d.id === formData.deviceType)?.name || 'Not selected'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-slate-700 rounded-lg p-4">
                    <h3 className="font-medium text-lg text-cyan-400 mb-2">Device Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                      <div>
                        <span className="text-gray-400">Make/Brand:</span>
                        <p>{formData.deviceDetails.make || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Model:</span>
                        <p>{formData.deviceDetails.model || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Operating System:</span>
                        <p>{formData.deviceDetails.operatingSystem || 'Not selected'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Purchase Date:</span>
                        <p>{formData.deviceDetails.purchaseDate || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-gray-400">Problem Description:</span>
                      <p className="mt-1">{formData.deviceDetails.problemDescription || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="border border-slate-700 rounded-lg p-4">
                    <h3 className="font-medium text-lg text-cyan-400 mb-2">Appointment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                      <div>
                        <span className="text-gray-400">Service Date:</span>
                        <p>{formData.schedulingDetails.date ? format(formData.schedulingDetails.date, "PPP") : 'Not selected'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Time Slot:</span>
                        <p>{formData.schedulingDetails.timeSlot || 'Not selected'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-slate-700 rounded-lg p-4">
                    <h3 className="font-medium text-lg text-cyan-400 mb-2">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                      <div>
                        <span className="text-gray-400">Client Type:</span>
                        <p className="capitalize">{formData.clientType}</p>
                      </div>
                      {formData.clientType === "business" && (
                        <div>
                          <span className="text-gray-400">Business Name:</span>
                          <p>{formData.contactInfo.businessName || 'Not provided'}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-400">Full Name:</span>
                        <p>{formData.contactInfo.fullName || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Email:</span>
                        <p>{formData.contactInfo.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Phone:</span>
                        <p>{formData.contactInfo.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Preferred Contact:</span>
                        <p className="capitalize">{formData.contactInfo.preferredContact}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-gray-400">Service Address:</span>
                      <p className="mt-1">{formData.contactInfo.address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-gray-400">
                  <p>By submitting this request, you agree to our <a href="#" className="text-cyan-400 underline">Terms of Service</a> and <a href="#" className="text-cyan-400 underline">Privacy Policy</a>.</p>
                </div>
              </motion.div>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-between py-6 border-t border-slate-700">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="border-slate-600"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            )}
            {step < 5 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="ml-auto bg-cyan-500 hover:bg-cyan-600"
              >
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={handleSubmit}
                className="ml-auto bg-cyan-500 hover:bg-cyan-600"
              >
                Submit Request
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ServiceRequest;