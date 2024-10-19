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

  const { currentUser } = useSelector((state) => state.persistedReducer?.user);

  return (
    <div className={styles.container}>
      {pathname === "/" && <Navigate to="/dashboard" />}
      <Sidebar />
      <div className={styles.dashboard}>
        {/* <div className={styles.header}>
          <p className={styles.heading}>SendGrid Reporting Dashboard</p>
        </div> */}
        <div className={styles.outlet}>
          {/* <div className={styles.dataLoadingContainer}>
            <div className="simple-spinner">
              <span></span>
            </div>
            <p className={styles.loadingText}>Data is being loaded...</p>
          </div> */}

          {/* <div className={styles.dataLoadingContainer}>
            <MdOutlineWifiTetheringErrorRounded size={40} color={"#df6555"} />
            <p className={styles.errorText}>Something went wrong...</p>
          </div> */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
