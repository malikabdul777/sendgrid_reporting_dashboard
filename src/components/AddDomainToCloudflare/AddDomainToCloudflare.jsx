// React
import { useState } from "react";

// Thirdparty
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IoCopyOutline } from "react-icons/io5";
import { toast } from "react-toastify";

// Utils
import axios from "@/utils/axiosInstance"; // Import the Axios instance

// Styles
import styles from "./AddDomainToCloudflare.module.css";
import "../../spinner.css";

const AddDomainToCloudflare = () => {
  const [cloudflareDomain, setCloudflareDomain] = useState("");
  const [cloudFlareNameServers, setCloudFlareNameServers] = useState([]);
  const [zoneId, setZoneId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`/cloudflare-add-domains`, {
        domainName: cloudflareDomain,
      });

      console.log(response.data);

      if (response.data.success) {
        toast.success(response.data.message, {
          position: "bottom-center",
        });

        setCloudFlareNameServers(response.data.data.result.name_servers);
        setZoneId(response.data.data.result.id);
      } else {
        toast.error("Something went wrong", {
          position: "bottom-center",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "Error: " + (error.response?.data?.message || "Something went wrong"),
        {
          position: "bottom-center",
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNameServerCopy = (index) => {
    const nameServer = cloudFlareNameServers[index];
    if (nameServer) {
      navigator.clipboard.writeText(nameServer);
      toast.success("Copied", {
        position: "bottom-center",
      });
    } else {
      toast.error("No Name Server Found", {
        position: "bottom-center",
      });
    }
  };

  const getDomainStatusHandler = async () => {
    try {
      const response = await axios.post(`/cloudflare-domain-status`, {
        domainName: cloudflareDomain,
      });

      console.log(response.data);

      if (response.data.success) {
        toast.success("Domain is Active on Cloudflare", {
          position: "bottom-center",
        });
      } else {
        toast.error("Domain Status is Inactive", {
          position: "bottom-center",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "Error: " + (error.response?.data?.message || "Something went wrong"),
        {
          position: "bottom-center",
        }
      );
    }
  };

  return (
    <div className={styles.wrapper}>
      <div>
        <div className={styles.header}>
          <img src="./cloudflareIcon.svg" alt="logo" className={styles.logo} />
          <h3 className={styles.subHeading}>Adding Domain to CloudFlare</h3>
          {isLoading && <div className="spinner" />}
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
          {cloudFlareNameServers.map((nameServer, index) => (
            <div key={index} className={styles.nameServerInputsContainer}>
              <Input
                value={nameServer}
                className={styles.nameServerInputs}
                readOnly
              />
              <IoCopyOutline
                size={20}
                className={styles.copyIcon}
                onClick={() => handleNameServerCopy(index)}
              />
            </div>
          ))}

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
