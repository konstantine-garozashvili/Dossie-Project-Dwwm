import React from "react";
import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Services } from "./pages/Services";
import { ServiceRequest } from "./pages/ServiceRequest";
import { RequestConfirmation } from "./pages/RequestConfirmation";
import { BecomeTechnician } from "./pages/BecomeTechnician";
import { ApplicationSubmitted } from "./pages/ApplicationSubmitted";
import { Layout } from "./components/Layout";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { TechnicianLogin } from "./pages/TechnicianLogin";
import { TechnicianDashboard } from "./pages/TechnicianDashboard";
import { ChangePassword } from "./pages/ChangePassword";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Layout><Services /></Layout>} />
      <Route path="/service-request" element={<Layout><ServiceRequest /></Layout>} />
      <Route path="/request-confirmation" element={<Layout><RequestConfirmation /></Layout>} />
      <Route path="/become-technician" element={<Layout><BecomeTechnician /></Layout>} />
      <Route path="/application-submitted" element={<ApplicationSubmitted />} />
      <Route path="/adminlog" element={<AdminLogin />} />
      <Route path="/dashboardadmin" element={<AdminDashboard />} />
      <Route path="/techlog" element={<TechnicianLogin />} />
      <Route path="/technician-dashboard" element={<TechnicianDashboard />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}

export default App;