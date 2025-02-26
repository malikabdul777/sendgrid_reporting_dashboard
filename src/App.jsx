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

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* Private Routes */}
          <Route path="/" element={<Layout />}>
            <Route path="domain-auth" element={<DomainAuth />} />
            <Route path="template_builder" element={<TemplateBuilder />} />
            <Route path="domain-logs" element={<DomainLogs />} />
            <Route path="spam-reporters" element={<Reporters />} />
            <Route path="webform-blocks-check" element={<WebformBlocks />} />

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
