import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Authentication
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Auth from "./pages/Auth/Auth";

// Layout
import Layout from "./components/Layout/Layout";

// Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import DomainLogs from "./pages/DomainLogs/DomainLogs";
import Reporters from "./pages/Reporters/Reporters";
import BlockLog from "./pages/BlockLog/BlockLog";
import DomainAuth from "./pages/DomainAuth/DomainAuth";
import AddWebformDomainDetails from "./components/AddWebformDomainDetails/AddWebformDomainDetails";
import WebformBlocks from "./pages/WebformBlocks/WebformBlocks";
import TemplateBuilder from "./pages/TemplateBuilder/TemplateBuilder";
import TemplateRebuild from "./pages/TemplateRebuild/TemplateRebuild";
import MIMEBuster from "./pages/MIMEBuster/MIMEBuster";
import Mailer from "./pages/Mailer/Mailer";
import GmailHelper from "./pages/Tools/GmailHelper/GmailHelper";

// Toast
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={<Auth />} />

            {/* Layout wrapper for all routes */}
            <Route path="/" element={<Layout />}>
              {/* Protected Routes */}
              <Route
                path="domain-auth"
                element={
                  <ProtectedRoute>
                    <DomainAuth />
                  </ProtectedRoute>
                }
              />
              <Route
                path="Mailer"
                element={
                  <ProtectedRoute>
                    <Mailer />
                  </ProtectedRoute>
                }
              />

              {/* Public Routes within Layout */}
              <Route path="template_builder" element={<TemplateBuilder />} />
              <Route path="domain-logs" element={<DomainLogs />} />
              <Route path="spam-reporters" element={<Reporters />} />
              <Route path="webform-blocks-check" element={<WebformBlocks />} />
              <Route path="template-rebuild" element={<TemplateRebuild />} />
              <Route path="MIME-buster" element={<MIMEBuster />} />
              <Route path="tools/gmail-helper" element={<GmailHelper />} />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/template-rebuild" />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <ToastContainer position="bottom-center" />
      </div>
    </AuthProvider>
  );
}

export default App;
