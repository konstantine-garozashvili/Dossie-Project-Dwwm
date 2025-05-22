import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Mail, Phone, Calendar } from "lucide-react";
import { ThemeToggleButton } from "@/components/ThemeToggleButton";
import { useTheme } from "@/context/ThemeProvider";

export const RequestConfirmation = () => {
  // In a real app, this would come from the server response
  const requestDetails = {
    requestId: "REQ-" + Math.floor(100000 + Math.random() * 900000),
    timestamp: new Date().toLocaleString(),
    estimatedResponse: "Within 2 business hours",
  };
  
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-500" />
          </div>
          <h1 
            className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text' : 'text-primary'}`}
          >
            Service Request Received!
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Thank you for submitting your repair request. Our support team will review your request and contact you with next steps.
          </p>
        </motion.div>

        <Card className="mb-8 bg-card border-border">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-medium">Request Details</h3>
                    <p className="text-muted-foreground">Request ID: {requestDetails.requestId}</p>
                    <p className="text-muted-foreground">Submitted: {requestDetails.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-medium">Email Confirmation</h3>
                    <p className="text-muted-foreground">We've sent a confirmation email with all the details of your request.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-medium">Next Steps</h3>
                    <p className="text-muted-foreground">A technician will contact you {requestDetails.estimatedResponse} to confirm your appointment.</p>
                  </div>
                </div>
                <div className="p-4 border border-primary/30 bg-primary/10 rounded-lg text-left">
                  <p className="text-sm"><span className="font-medium">Note:</span> If you need to make changes to your request, please contact our support team at support@it13.com or call (123) 456-7890.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" asChild>
            <Link to="/service-history">View My Service History</Link>
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RequestConfirmation;