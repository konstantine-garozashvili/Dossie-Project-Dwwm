import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Marquee3D } from "@/components/magicui/Marquee3D";
import { fixLayoutOverflow } from "@/lib/utils";
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { FiMonitor, FiCpu, FiHardDrive, FiDatabase, FiShield, FiCloud } from "react-icons/fi";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const services = [
  {
    title: "Hardware Repairs",
    items: ["Motherboard Diagnostics", "Screen Replacement", "Keyboard Repair", "Battery Replacement"],
    icon: "💻"
  },
  {
    title: "Software Solutions",
    items: ["OS Installation", "Virus Removal", "Data Recovery", "Driver Updates"],
    icon: "🛠️"
  },
  {
    title: "Network Services",
    items: ["Wi-Fi Setup", "Router Configuration", "LAN Wiring", "Security Setup"],
    icon: "📶"
  }
];

const processSteps = [
  { title: "Diagnosis", description: "Comprehensive system analysis" },
  { title: "Quote", description: "Transparent pricing" },
  { title: "Repair", description: "Certified technician work" },
  { title: "Testing", description: "Quality assurance check" }
];

const testimonials = [
  {
    name: "Michael Johnson",
    role: "Business Owner",
    quote: "They saved my laptop when I thought all my data was lost. Fast service, fair prices!",
    image: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    name: "Sarah Thompson",
    role: "Graphic Designer",
    quote: "I rely on my workstation for my career, and their team keeps it running flawlessly.",
    image: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    name: "David Rodriguez",
    role: "Student",
    quote: "Same-day repair saved my final project when my laptop crashed before submission.",
    image: "https://randomuser.me/api/portraits/men/67.jpg"
  }
];

const stats = [
  { value: "5000+", label: "Repairs Completed" },
  { value: "98%", label: "Customer Satisfaction" },
  { value: "24/7", label: "Support Available" },
  { value: "15+", label: "Years Experience" }
];

const Home = () => {
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.3]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const homeRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    // Apply the layout overflow fix
    if (rootRef.current) {
      fixLayoutOverflow(rootRef.current);
    }
    
    // Additional fix to ensure there's no overflow on the body
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    
    // Cleanup function
    return () => {
      document.body.style.overflowX = '';
      document.documentElement.style.overflowX = '';
    };
  }, []);

  return (
    <div className="bg-slate-950 text-white overflow-x-hidden" ref={rootRef}>
      {/* Fixed Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-cyan-400">DWWM</div>
              <div className="hidden md:block text-xl font-semibold">Computer Shop</div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-300 hover:text-cyan-400 transition-colors">Services</a>
              <a href="#process" className="text-gray-300 hover:text-cyan-400 transition-colors">Process</a>
              <a href="#testimonials" className="text-gray-300 hover:text-cyan-400 transition-colors">Testimonials</a>
              <a href="#contact" className="text-gray-300 hover:text-cyan-400 transition-colors">Contact</a>
              <div className="pl-4 flex items-center space-x-3 border-l border-slate-700">
                <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10">
                  Log In
                </Button>
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  Register
                </Button>
              </div>
            </nav>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-300"
              >
                {mobileMenuOpen ? "✕" : "☰"}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 space-y-3"
            >
              <a href="#services" className="block py-2 text-gray-300 hover:text-cyan-400">Services</a>
              <a href="#process" className="block py-2 text-gray-300 hover:text-cyan-400">Process</a>
              <a href="#testimonials" className="block py-2 text-gray-300 hover:text-cyan-400">Testimonials</a>
              <a href="#contact" className="block py-2 text-gray-300 hover:text-cyan-400">Contact</a>
              <div className="pt-3 flex space-x-3 border-t border-slate-700">
                <Button variant="outline" className="flex-1 border-cyan-500 text-cyan-400">
                  Log In
                </Button>
                <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600">
                  Register
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Full Screen Hero Section */}
      <motion.section 
        style={{ scale, opacity }}
        className="relative h-screen w-full flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 w-full h-full bg-[url('https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg')] bg-cover bg-center bg-fixed opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F172A]" />
        <div className="relative z-10 text-center max-w-5xl px-4 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="mb-4 px-3 py-1 bg-cyan-500/20 text-cyan-400 border-cyan-500 text-sm inline-flex w-auto">
              24/7 Support Available
            </Badge>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 mb-6"
          >
            Expert Computer Repair Services
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Professional solutions for all your tech needs - laptops, desktops, networks, and data recovery with guaranteed results
          </motion.p>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                Schedule Repair Now
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg border-white/20 hover:bg-white/5">
                View Services
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-cyan-400 flex justify-center pt-2">
            <motion.div 
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              animate={{ opacity: [0, 1, 0], y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-10 px-4 bg-slate-900 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center p-6"
            >
              <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">{stat.value}</div>
              <div className="text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-3 py-1 bg-cyan-500/20 text-cyan-400 border-cyan-500 inline-flex w-auto">
              Our Expertise
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
              Professional Computer Services
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From hardware repairs to software solutions, our expert technicians can solve your tech problems quickly and affordably.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: idx * 0.2 }}
              >
                <Card className="h-full bg-slate-800 border-slate-700 hover:border-cyan-400 transition-colors">
                  <CardHeader>
                    <div className="text-4xl mb-4">{service.icon}</div>
                    <CardTitle className="text-2xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {service.items.map((item, i) => (
                        <li key={i} className="flex items-center">
                          <span className="text-cyan-400 mr-2">▹</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
                      Learn More
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Repair Process Timeline */}
      <section id="process" className="py-20 px-4 bg-slate-800/50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-3 py-1 bg-cyan-500/20 text-cyan-400 border-cyan-500 inline-flex w-auto">
              Efficient Workflow
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
              Our Repair Process
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              We follow a streamlined process to ensure your device is fixed quickly without compromising quality.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto relative">
            {/* Timeline line */}
            <div className="absolute hidden md:block h-1 w-[calc(100%-4rem)] left-8 top-16 bg-slate-600 -z-10" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
              {processSteps.map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                    0{idx + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-slate-900 overflow-hidden">
        <div className="w-full max-w-full mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 min-h-[600px]">
            {/* 3D Marquee Reviews */}
            <div className="w-full lg:w-1/2 h-[600px] flex items-center justify-center order-2 lg:order-1 overflow-hidden">
              <Marquee3D />
            </div>
            
            {/* Text Content */}
            <div className="w-full lg:w-1/2 text-left mb-8 lg:mb-0 order-1 lg:order-2 lg:pl-10 lg:pr-8 flex flex-col justify-center">
              <div className="text-left">
                <Badge className="mb-4 px-3 py-1 bg-cyan-500/20 text-cyan-400 border-cyan-500 inline-flex w-auto">
                  Client Reviews
                </Badge>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                What Our Clients Think
              </h2>
              <p className="text-xl text-gray-400 mb-6">
                Real feedback from our satisfied customers who have experienced our exceptional service. Our commitment to quality and customer satisfaction is reflected in every review.
              </p>
              <div className="mb-8 space-y-4">
                <div className="flex items-start">
                  <span className="text-cyan-400 mr-2 text-xl">✓</span>
                  <p className="text-gray-300">Over 500 positive reviews from satisfied customers</p>
                </div>
                <div className="flex items-start">
                  <span className="text-cyan-400 mr-2 text-xl">✓</span>
                  <p className="text-gray-300">4.9/5 average rating across all service categories</p>
                </div>
                <div className="flex items-start">
                  <span className="text-cyan-400 mr-2 text-xl">✓</span>
                  <p className="text-gray-300">98% of clients recommend our services to friends and family</p>
                </div>
              </div>
              <p className="text-lg text-gray-400 italic mb-6">
                "We believe in letting our clients' experiences speak for themselves. These testimonials represent real people with real problems we've helped solve."
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
                  View All Reviews
                </Button>
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  Share Your Experience
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 px-3 py-1 bg-cyan-500/20 text-cyan-400 border-cyan-500 inline-flex w-auto">
              Get In Touch
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
              Need Immediate Help?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our experts are available 24/7 to assist you with any computer issues.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      📞
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">24/7 Support</h3>
                      <p className="text-cyan-400">(123) 456-7890</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      📍
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Our Location</h3>
                      <p className="text-cyan-400">123 Tech Street, Digital City</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      ✉️
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Email Us</h3>
                      <p className="text-cyan-400">support@dwwmcomputers.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      🕒
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Hours</h3>
                      <p className="text-cyan-400">Open Monday-Saturday, 9am-6pm</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm" htmlFor="name">Your Name</label>
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      className="w-full p-4 bg-slate-900 rounded-lg border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm" htmlFor="email">Your Email</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="w-full p-4 bg-slate-900 rounded-lg border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm" htmlFor="message">Your Message</label>
                    <textarea
                      id="message"
                      placeholder="Describe your issue"
                      rows="4"
                      className="w-full p-4 bg-slate-900 rounded-lg border border-slate-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full py-6 bg-cyan-500 hover:bg-cyan-600 text-lg">
                    Send Message
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-cyan-400">DWWM</h3>
            <p className="text-gray-400">Your trusted partner for all computer needs since 2023.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-cyan-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-cyan-400">Computer Repair</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400">Data Recovery</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400">Virus Removal</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400">Network Setup</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400">Hardware Upgrades</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-cyan-400">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400">Our Team</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400">Privacy Policy</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 mb-4">Subscribe to our newsletter for tips and updates.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-l-lg focus:outline-none focus:border-cyan-500"
              />
              <Button className="rounded-l-none bg-cyan-500 hover:bg-cyan-600">
                Join
              </Button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-800 text-center sm:text-left">
          <p className="text-gray-500">© {new Date().getFullYear()} DWWM Computer Shop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
