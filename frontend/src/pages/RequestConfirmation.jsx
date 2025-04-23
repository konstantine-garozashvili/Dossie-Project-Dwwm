import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Mail, Phone, Calendar } from "lucide-react";

export const RequestConfirmation = () => {
  // In a real app, this would come from the server response
  const requestDetails = {
    requestId: "REQ-" + Math.floor(100000 + Math.random() * 900000),
    timestamp: new Date().toLocaleString(),
    estimatedResponse: "Within 2 business hours",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-20 px-4">
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
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Service Request Received!
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Thank you for submitting your repair request. Our support team will review your request and contact you with next steps.
          </p>
        </motion.div>

        <Card className="bg-slate-800 border-slate-700 shadow-xl mb-10">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="border-b border-slate-700 pb-4">
                <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Request Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-gray-400">Request ID:</p>
                    <p className="text-white font-semibold">{requestDetails.requestId}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Submitted On:</p>
                    <p className="text-white">{requestDetails.timestamp}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-gray-400">Expected Response Time:</p>
                    <p className="text-white">{requestDetails.estimatedResponse}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-cyan-400 text-left mb-2">What happens next?</h2>
                
                <div className="flex items-start space-x-4 text-left">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex-shrink-0 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Email Confirmation</h3>
                    <p className="text-gray-400">
                      You will receive an email confirmation with your request details and reference number.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 text-left">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex-shrink-0 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Support Contact</h3>
                    <p className="text-gray-400">
                      Our support team will review your request and may call you for additional information if needed.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 text-left">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex-shrink-0 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Appointment Scheduling</h3>
                    <p className="text-gray-400">
                      If your request is approved, our support team will contact you to schedule a convenient appointment time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            className="bg-cyan-500 hover:bg-cyan-600"
            asChild
          >
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RequestConfirmation;