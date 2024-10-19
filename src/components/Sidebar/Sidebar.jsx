// React

// Thirdparty
import { NavLink } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { FaListUl } from "react-icons/fa";
import { BsDatabase } from "react-icons/bs";
import { useLocation } from "react-router-dom";
import { GoShieldLock } from "react-icons/go";

// Utils

// APISlices

// Slice

// CustomHooks

// Components

// Constants

// Enums

// Interfaces

// Styles
import styles from "./Sidebar.module.css";

// Local enums

// Local constants

// Local Interfaces

const Sidebar = () => {
  const { pathname } = useLocation();

  // console.log(Cookies.get());

  return (
    <div>
      <div className={styles.container}>
        {/* <img src="./logo.png" alt="logo" className={styles.logo} /> */}

        <div className={styles.menu}>
          <NavLink
            to="domain-auth"
            className={`${styles.navLink} ${
              pathname === "/domain-auth" ? styles.activeNavLink : null
            }`}
            title={"Domain Auth"}
          >
            <div className={styles.item}>
              <GoShieldLock
                size={16}
                className={`${
                  pathname === "/domain-auth" ? styles.activeIcon : null
                }`}
              />
              <p className={styles.navLinkText}>Domain Auth</p>
            </div>
          </NavLink>
          <NavLink
            to="block_log"
            title={"Block Log"}
            className={`${styles.navLink} ${
              pathname === "/block_log" ? styles.activeNavLink : null
            }`}
          >
            <div className={styles.item}>
              <GoHomeFill
                size={20}
                className={`${
                  pathname === "/block_log" ? styles.activeIcon : null
                }`}
              />
              <p className={styles.navLinkText}>Block Log</p>
            </div>
          </NavLink>

          <NavLink
            to="domain-logs"
            className={`${styles.navLink} ${
              pathname === "/domain-logs" ? styles.activeNavLink : null
            }`}
            title={"Domain Logs"}
          >
            <div className={styles.item}>
              <FaListUl
                size={16}
                className={`${
                  pathname === "/domain-logs" ? styles.activeIcon : null
                }`}
              />
              <p className={styles.navLinkText}>Domain Logs</p>
            </div>
          </NavLink>

          <NavLink
            to="spam-reporters"
            className={`${styles.navLink} ${
              pathname === "/spam-reporters" ? styles.activeNavLink : null
            }`}
            title={"Spam Reporters"}
          >
            <div className={styles.item}>
              <BsDatabase
                size={20}
                className={`${
                  pathname === "/spam-reporters" ? styles.activeIcon : null
                }`}
              />
              <p className={styles.navLinkText}>Reporters</p>
            </div>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
