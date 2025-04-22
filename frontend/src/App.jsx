import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceRequest from "./pages/ServiceRequest";
import RequestConfirmation from "./pages/RequestConfirmation";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Layout><Services /></Layout>} />
      <Route path="/service-request" element={<Layout><ServiceRequest /></Layout>} />
      <Route path="/request-confirmation" element={<Layout><RequestConfirmation /></Layout>} />
    </Routes>
  );
}

export default App; 