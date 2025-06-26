// React

// Thirdparty
import { NavLink } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { FaListUl } from "react-icons/fa";
import { BsDatabase } from "react-icons/bs";
import { useLocation } from "react-router-dom";
import { GoShieldLock } from "react-icons/go";
import { FiEdit } from "react-icons/fi";
import { IoBuild } from "react-icons/io5";
import { GiMagickTrick } from "react-icons/gi";
import { IoIosMail } from "react-icons/io";

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
              <p className={styles.navLinkText}>TRM Domains</p>
            </div>
          </NavLink>

          <NavLink
            to="MIME-buster"
            className={`${styles.navLink} ${
              pathname === "/MIME-buster" ? styles.activeNavLink : null
            }`}
            title={"MIME Buster"}
          >
            <div className={styles.item}>
              <GiMagickTrick
                size={16}
                className={`${
                  pathname === "/MIME-buster" ? styles.activeIcon : null
                }`}
              />
              <p className={styles.navLinkText}>MIME Buster</p>
            </div>
          </NavLink>

          <NavLink
            to="template_builder"
            title={"Template Builder"}
            className={`${styles.navLink} ${
              pathname === "/template_builder" ? styles.activeNavLink : null
            }`}
          >
            <div className={styles.item}>
              <FiEdit
                size={20}
                className={`${
                  pathname === "/template_builder" ? styles.activeIcon : null
                }`}
              />
              <p className={styles.navLinkText}>Template Bui</p>
            </div>
          </NavLink>

          <NavLink
            to="template-rebuild"
            className={`${styles.navLink} ${
              pathname === "/template-rebuild" ? styles.activeNavLink : null
            }`}
            title={"Template Rebuilder"}
          >
            <div className={styles.item}>
              <IoBuild
                size={20}
                className={`${
                  pathname === "/template-rebuild" ? styles.activeIcon : null
                }`}
              />
              <p className={styles.navLinkText}>Template Reb</p>
            </div>
          </NavLink>

          <NavLink
            to="mailer"
            className={`${styles.navLink} ${
              pathname === "/mailer" ? styles.activeNavLink : null
            }`}
            title={"Mailer"}
          >
            <div className={styles.item}>
              <IoIosMail
                size={20}
                className={`${
                  pathname === "/mailer" ? styles.activeIcon : null
                }`}
              />
              <p className={styles.navLinkText}>Mailer</p>
            </div>
          </NavLink>

          {/* <NavLink
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
          </NavLink> */}

          {/* <NavLink
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
          </NavLink> */}

          {/* <NavLink
            to="webform-blocks-check"
            className={`${styles.navLink} ${
              pathname === "/webform-blocks-check" ? styles.activeNavLink : null
            }`}
            title={"Spam Reporters"}
          >
            <div className={styles.item}>
              <BsDatabase
                size={20}
                className={`${
                  pathname === "/webform-blocks-check"
                    ? styles.activeIcon
                    : null
                }`}
              />
              <p className={styles.navLinkText}>WF Blocks</p>
            </div>
          </NavLink> */}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
