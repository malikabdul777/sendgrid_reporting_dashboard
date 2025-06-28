import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// Layout
import Layout from "./components/Layout/Layout";

// Pages
import Dashboard from "./pages/Dashboard/Dashboard";

// Toast
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import DomainLogs from "./pages/DomainLogs/DomainLogs";
import Reporters from "./pages/Reporters/Reporters";
import BlockLog from "./pages/BlockLog/BlockLog";
import DomainAuth from "./pages/DomainAuth/DomainAuth";
import AddWebformDomainDetails from "./components/AddWebformDomainDetails/AddWebformDomainDetails";
import WebformBlocks from "./pages/WebformBlocks/WebformBlocks";
import TemplateBuilder from "./pages/TemplateBuilder/TemplateBuilder";
import TemplateRebuild from "./pages/TemplateRebuild/TemplateRebuild";
// Make sure this import is correct
import MIMEBuster from "./pages/MIMEBuster/MIMEBuster";
import Mailer from "./pages/Mailer/Mailer";
import GmailHelper from "./pages/Tools/GmailHelper/GmailHelper";

function App() {
  return (
    <div className="app-container">
      {" "}
      {/* Changed from plain div to add a class */}
      <BrowserRouter>
        <Routes>
          {/* Private Routes */}
          <Route path="/" element={<Layout />}>
            <Route path="domain-auth" element={<DomainAuth />} />
            <Route path="template_builder" element={<TemplateBuilder />} />
            <Route path="domain-logs" element={<DomainLogs />} />
            <Route path="spam-reporters" element={<Reporters />} />
            <Route path="webform-blocks-check" element={<WebformBlocks />} />
            <Route path="template-rebuild" element={<TemplateRebuild />} />
            <Route path="MIME-buster" element={<MIMEBuster />} />
            <Route path="Mailer" element={<Mailer />} />
            <Route path="tools/gmail-helper" element={<GmailHelper />} />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/domain-auth" />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer position="bottom-center" />
    </div>
  );
}

export default App;
