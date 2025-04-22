import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fixLayoutOverflow } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
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
              <div className="text-2xl font-bold text-cyan-400 cursor-pointer" onClick={() => navigate('/')}>DWWM</div>
              <div className="hidden md:block text-xl font-semibold cursor-pointer" onClick={() => navigate('/')}>Computer Shop</div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a onClick={() => {
                if (window.location.pathname === '/') {
                  const element = document.getElementById('services');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                } else {
                  navigate('/#services');
                }
              }} className="text-gray-300 hover:text-cyan-400 transition-colors cursor-pointer">Services</a>
              
              <a onClick={() => {
                if (window.location.pathname === '/') {
                  const element = document.getElementById('process');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                } else {
                  navigate('/#process');
                }
              }} className="text-gray-300 hover:text-cyan-400 transition-colors cursor-pointer">Process</a>
              
              <a onClick={() => {
                if (window.location.pathname === '/') {
                  const element = document.getElementById('testimonials');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                } else {
                  navigate('/#testimonials');
                }
              }} className="text-gray-300 hover:text-cyan-400 transition-colors cursor-pointer">Testimonials</a>
              
              <a onClick={() => {
                if (window.location.pathname === '/') {
                  const element = document.getElementById('contact');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                } else {
                  navigate('/#contact');
                }
              }} className="text-gray-300 hover:text-cyan-400 transition-colors cursor-pointer">Contact</a>
              
              <div className="pl-4 flex items-center space-x-3 border-l border-slate-700">
                <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10" onClick={() => navigate('/login')}>
                  Log In
                </Button>
                <Button className="bg-cyan-500 hover:bg-cyan-600" onClick={() => navigate('/register')}>
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
              <a onClick={() => {
                if (window.location.pathname === '/') {
                  const element = document.getElementById('services');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                } else {
                  navigate('/#services');
                }
                setMobileMenuOpen(false);
              }} className="block py-2 text-gray-300 hover:text-cyan-400 cursor-pointer">Services</a>
              
              <a onClick={() => {
                if (window.location.pathname === '/') {
                  const element = document.getElementById('process');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                } else {
                  navigate('/#process');
                }
                setMobileMenuOpen(false);
              }} className="block py-2 text-gray-300 hover:text-cyan-400 cursor-pointer">Process</a>
              
              <a onClick={() => {
                if (window.location.pathname === '/') {
                  const element = document.getElementById('testimonials');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                } else {
                  navigate('/#testimonials');
                }
                setMobileMenuOpen(false);
              }} className="block py-2 text-gray-300 hover:text-cyan-400 cursor-pointer">Testimonials</a>
              
              <a onClick={() => {
                if (window.location.pathname === '/') {
                  const element = document.getElementById('contact');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                } else {
                  navigate('/#contact');
                }
                setMobileMenuOpen(false);
              }} className="block py-2 text-gray-300 hover:text-cyan-400 cursor-pointer">Contact</a>
              
              <div className="pt-3 flex space-x-3 border-t border-slate-700">
                <Button variant="outline" className="flex-1 border-cyan-500 text-cyan-400" onClick={() => navigate('/login')}>
                  Log In
                </Button>
                <Button className="flex-1 bg-cyan-500 hover:bg-cyan-600" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 overflow-hidden">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-cyan-400 cursor-pointer" onClick={() => navigate('/')}>DWWM</h3>
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

export default Layout; 