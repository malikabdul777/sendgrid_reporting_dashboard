// React

// Thirdparty
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { CiBellOn } from "react-icons/ci";
import { MdOutlineWifiTetheringErrorRounded } from "react-icons/md";
import { useSelector } from "react-redux";

// Utils

// APISlices

// Slice

// CustomHooks

// Components

// Constants

// Enums

// Interfaces

// Styles
import styles from "./Layout.module.css";
import "./layout.css";
import Sidebar from "../Sidebar/Sidebar";
import Cookies from "js-cookie";

// Local enums

// Local constants

// Local Interfaces

const Layout = () => {
  const { pathname } = useLocation();

  return (
    <div className={styles.container}>
      {pathname === "/" && <Navigate to="/dashboard" />}
      <Sidebar />
      <div className={styles.dashboard}>
        <div className={styles.outlet}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
