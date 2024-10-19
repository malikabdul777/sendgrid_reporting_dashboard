// React
import { useState } from "react";

// Thirdparty
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IoCopyOutline } from "react-icons/io5";
import { toast } from "react-toastify";

// Utils

// APISlices
import {
  useAddDomainMutation,
  useGetDomainStatusMutation,
} from "@/store/apiSlices/childApiSlices/cloudflareApiSlice";

// Slice

// CustomHooks

// Components

// Constants

// Enums

// Interfaces

// Styles
import styles from "./AddDomainToCloudflare.module.css";
import "../../spinner.css";

const AddDomainToCloudflare = () => {
  const [addDomain, { isLoading: addDomainLoading }] = useAddDomainMutation();
  const [cloudflareDomain, setCloudflareDomain] = useState("");
  const [cloudFlareNameServers, setCloudFlareNameServers] = useState([]);
  const [zoneId, setZoneId] = useState("");

  const [getDomainStatus, { isLoading: getDomainStatusLoading }] =
    useGetDomainStatusMutation();

  const handleSubmit = async () => {
    const response = await addDomain({ domainName: cloudflareDomain });

    console.log(response.data);

    if (response?.data?.success) {
      // Show Toast
      toast.success(response?.data?.message, {
        position: "bottom-center",
      });

      setCloudFlareNameServers(response?.data?.data?.result.name_servers);
      setZoneId(response?.data?.data?.result.id);
    } else {
      // Show Toast
      toast.error("Something went wrong", {
        position: "bottom-center",
      });
    }
  };

  const handleNameServerOneCopy = () => {
    console.log(cloudFlareNameServers[0]);
    if (cloudFlareNameServers[0] === undefined) {
      toast.error("No Name Server Found", {
        position: "bottom-center",
      });
    } else {
      toast.success("Copied", {
        position: "bottom-center",
      });

      navigator.clipboard.writeText(cloudFlareNameServers[0]);
    }
  };

  const handleNameServerTwoCopy = () => {
    if (cloudFlareNameServers[1] === undefined) {
      toast.error("No Name Server Found", {
        position: "bottom-center",
      });
    } else {
      toast.success("Copied", {
        position: "bottom-center",
      });

      navigator.clipboard.writeText(cloudFlareNameServers[1]);
    }
  };

  const getDomainStatusHandler = async () => {
    const response = await getDomainStatus({ domainName: cloudflareDomain });

    console.log(response.data);

    if (response?.data?.success) {
      toast.success("Domain is Active on Cloudflare", {
        position: "bottom-center",
      });
    } else {
      toast.error("Domain Status is Inactive", {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className={styles.wrapper}>
      <div>
        <div className={styles.header}>
          <img src="./cloudflareIcon.svg" alt="logo" className={styles.logo} />
          <h3 className={styles.subHeading}>Adding Domain to CloudFlare</h3>
          {addDomainLoading ||
            (getDomainStatusLoading && <div className="spinner" />)}
        </div>

        <div className={styles.domainFormContainer}>
          <div className={styles.domainInputContainer}>
            <Label htmlFor="domain">Enter Domain</Label>
            <Input
              id="domain"
              value={cloudflareDomain}
              onChange={(e) => setCloudflareDomain(e.target.value)}
            />
          </div>

          <Button
            className={styles.addDomainBtnCF}
            onClick={handleSubmit}
            disabled={!cloudflareDomain}
          >
            Add Domain to Cloudflare
          </Button>
        </div>

        <div className={styles.nameServerContainer}>
          <h4>Name Servers</h4>
          <div className={styles.nameServerInputsContainer}>
            <Input
              value={
                cloudFlareNameServers.length !== 0
                  ? cloudFlareNameServers[0]
                  : ""
              }
              className={styles.nameServerInputs}
            />
            <IoCopyOutline
              size={20}
              className={styles.copyIcon}
              onClick={handleNameServerOneCopy}
            />
          </div>

          <div className={styles.nameServerInputsContainer}>
            <Input
              value={
                cloudFlareNameServers.length !== 0
                  ? cloudFlareNameServers[1]
                  : ""
              }
              className={styles.nameServerInputs}
            />
            <IoCopyOutline
              size={20}
              className={styles.copyIcon}
              onClick={handleNameServerTwoCopy}
            />
          </div>

          {/* <div className={styles.nameServerContainer}>
            <h4>Domain ID</h4>
            <div className={styles.nameServerInputsContainer}>
              <Input
                defaultValue={zoneId}
                className={styles.nameServerInputs}
              />
              <IoCopyOutline
                size={20}
                className={styles.copyIcon}
                onClick={handleNameServerTwoCopy}
              />
            </div>
          </div> */}

          <div className={styles.checkDomainStatusBtnContainer}>
            <Button
              onClick={getDomainStatusHandler}
              disabled={!cloudflareDomain}
            >
              Check Domain Status
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDomainToCloudflare;
