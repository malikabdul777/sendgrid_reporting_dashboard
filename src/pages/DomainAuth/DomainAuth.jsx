// React

// Thirdparty
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IoCopyOutline } from "react-icons/io5";
import { toast } from "react-toastify";

// Utils
import { useToast } from "@/hooks/use-toast";

// APISlices

// Slice

// CustomHooks

// Components

// Constants

// Enums

// Interfaces

// Styles
import styles from "./DomainAuth.module.css";
import { useState } from "react";
import AddDomainToCloudflare from "@/components/AddDomainToCloudflare/AddDomainToCloudflare";
import AddDNSRecordsToCloudflare from "@/components/AddDNSRecordsToCloudflare/AddDNSRecordsToCloudflare";
import SgDomainAuth from "@/components/SgDomainAuth/SgDomainAuth";

// Local enums

// Local constants

// Local Interfaces

const DomainAuth = () => {
  return (
    <div className={styles.container}>
      <AddDomainToCloudflare />
      <AddDNSRecordsToCloudflare />

      <SgDomainAuth />
    </div>
  );
};

export default DomainAuth;
