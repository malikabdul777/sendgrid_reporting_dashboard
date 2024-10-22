// React

// Thirdparty

// Utils

// APISlices

// Slice

// CustomHooks

// Components
import AddWebformDomainDetails from "@/components/AddWebformDomainDetails/AddWebformDomainDetails";

// Constants

// Enums

// Interfaces

// Styles
import styles from "./WebformBlocks.module.css";
import GetWebfromDomainBlocksData from "@/components/GetWebfromDomainBlocksData/GetWebfromDomainBlocksData";

// Local enums

// Local constants

// Local Interfaces

const WebformBlocks = () => {
  return (
    <div className={styles.container}>
      <AddWebformDomainDetails />

      <GetWebfromDomainBlocksData />
    </div>
  );
};

export default WebformBlocks;
