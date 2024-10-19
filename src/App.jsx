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

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          {/* Private Routes */}
          <Route path="/" element={<Layout />}>
            <Route path="domain-auth" element={<DomainAuth />} />
            <Route path="block_log" element={<BlockLog />} />
            <Route path="domain-logs" element={<DomainLogs />} />
            <Route path="spam-reporters" element={<Reporters />} />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/block_log" />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer position="bottom-center" />
    </div>
  );
}

export default App;
