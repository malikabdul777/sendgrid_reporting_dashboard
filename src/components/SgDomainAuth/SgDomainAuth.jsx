import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import styles from "./SgDomainAuth.module.css";
import "../../spinner.css";
import axios, { baseURL, baseURL2 } from "@/utils/axiosInstance";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Helper function to format DNS records from SendGrid response
 * @param {Object} dns - DNS records from SendGrid
 * @returns {Array} Formatted DNS records for display
 */
const formatDnsRecords = (dns) => {
  return [
    {
      type: "CNAME",
      name: dns.mail_cname.host,
      content: dns.mail_cname.data,
    },
    {
      type: "CNAME",
      name: dns.dkim1.host,
      content: dns.dkim1.data,
    },
    {
      type: "CNAME",
      name: dns.dkim2.host,
      content: dns.dkim2.data,
    },
  ];
};

/**
 * SendGrid Domain Authentication Component
 * Allows users to authenticate domains and senders in SendGrid
 */
const SgDomainAuth = () => {
  // State management
  const [domainName, setDomainName] = useState("");
  const [dnsRecords, setDnsRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("2"); // Default to Account 2
  const [nickname, setNickname] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [replyTo, setReplyTo] = useState("");

  const [fromName, setFromName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  /**
   * Get appropriate axios instance based on selected account
   * @returns {Object} Axios instance with correct base URL
   */
  const getAxiosInstance = () => {
    const url = selectedAccount === "1" ? baseURL : baseURL2;
    console.log(`Using Base URL: ${url}`);
    return selectedAccount === "1"
      ? axios
      : axios.create({ baseURL: baseURL2 });
  };
  /**
   * Handle sender authentication with SendGrid
   */
  const handleSenderAuth = async () => {
    try {
      setIsLoading(true);
      const axiosInstance = getAxiosInstance();
      const response = await axiosInstance.post("/sendgrid-sender-auth", {
        nickname,
        from_email: fromEmail,
        reply_to: replyTo,
        from_name: fromName,
        address,
        city,
        country,
        selectedAccount,
      });

      const { success, message } = response.data;

      if (success) {
        toast.success(message, {
          position: "bottom-center",
        });
      } else {
        toast.error(message, {
          position: "bottom-center",
        });
      }
    } catch (error) {
      toast.error("Error authenticating sender", {
        position: "bottom-center",
      });
    } finally {
      setIsLoading(false);
    }
  };
  /**
   * Handle domain input change and update related fields
   * @param {Event} event - Input change event
   */
  const handleDomainChange = (event) => {
    const domain = event.target.value.trim();
    setDomainName(domain);
    // Update prefilled values when domain changes
    if (domain) {
      setNickname(`Support ${domain}`);
      setFromEmail(`support@${domain}`);
      setReplyTo(`info@${domain}`);

      // Set default values for Account 2
      if (selectedAccount === "2") {
        setFromName("Support");
        setAddress("2967 Dundas St. W. #560D");
        setCity("Toronto");
        setCountry("Canada");
      }
    } else {
      setNickname("");
      setFromEmail("");
      setReplyTo("");
    }
  };
  // Add effect to update fields when account changes
  React.useEffect(() => {
    if (selectedAccount === "2" && domainName) {
      setFromName("Support");
      setAddress("2967 Dundas St. W. #560D");
      setCity("Toronto");
      setCountry("Canada");
    }
  }, [selectedAccount, domainName]);
  /**
   * Handle domain authentication with SendGrid
   */
  const addRecord = async () => {
    try {
      setIsLoading(true);
      const axiosInstance = getAxiosInstance();
      const response = await axiosInstance.post("/sendgrid-add-domain", {
        domainName,
        selectedAccount,
      });
      console.log(response?.data);
      const { success, message, data } = response.data;
      if (success) {
        toast.success(response.data.message, {
          position: "bottom-center",
        });
        // Extract DNS records and set them to state
        const formattedRecords = formatDnsRecords(data.dns);
        setDnsRecords(formattedRecords);
      } else {
        toast.error(message, {
          position: "bottom-center",
        });
      }
    } catch (error) {
      toast.error("Error authenticating domain", {
        position: "bottom-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add DNS records to Cloudflare
   */
  const addRecordsToCloudflare = async () => {
    try {
      setIsLoading(true);
      // Always use the default axios instance with baseURL
      console.log(`Using Base URL for Cloudflare: ${baseURL}`);
      for (const record of dnsRecords) {
        const response = await axios.post("/cloudflare-add-dns-record", {
          domainName,
          ...record,
        });
        const { success, message } = response.data;
        if (success) {
          toast.success(`Record ${record.name} added to Cloudflare!`, {
            position: "bottom-center",
          });
        } else {
          toast.error(`Failed to add record ${record.name}: ${message}`, {
            position: "bottom-center",
          });
        }
      }
    } catch (error) {
      toast.error("Error adding records to Cloudflare", {
        position: "bottom-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Validate authenticated domain in SendGrid
   */
  const validateAuthenticatedSGDomain = async () => {
    try {
      setIsLoading(true);
      const axiosInstance = getAxiosInstance();
      const response = await axiosInstance.post("/sendgrid-validate-domain", {
        domainName,
        selectedAccount,
      });
      if (response.data?.data.valid) {
        toast.success("Domain validated successfully", {
          position: "bottom-center",
        });
      } else {
        toast.error("Domain not validated yet, Try again after some time", {
          position: "bottom-center",
        });
      }
    } catch (error) {
      toast.error("Error validating authenticated domain", {
        position: "bottom-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.leftSection}>
          <img src="./sendgridIcon.svg" alt="logo" className={styles.logo} />
          <h2 className={styles.heading}>Authenticate Domain in SendGrid</h2>
        </div>
        <div className={styles.rightSection}>
          {isLoading && <div className="spinner" />}
          <Select value={selectedAccount} onValueChange={setSelectedAccount}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Account 1</SelectItem>
              <SelectItem value="2">Account 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Domain Input Section */}
      <div className={styles.inputContainer}>
        <div className={styles.input}>
          <Label htmlFor="domainName">Domain Name</Label>
          <Input
            type="text"
            placeholder="Enter your domain name"
            value={domainName}
            onChange={handleDomainChange}
            className="w-1/2 mt-2"
          />
        </div>
        <Button
          type="button"
          onClick={addRecord}
          className={styles.authButton}
          disabled={!domainName}
        >
          Authenticate Domain
        </Button>
      </div>

      {/* DNS Records Section */}
      {dnsRecords.length > 0 && (
        <div className={styles.dnsRecordsContainer}>
          <h3 className={styles.subHeading}>
            DNS Records from SendGrid to add in Cloudflare
          </h3>
          {dnsRecords.map((record, index) => (
            <div key={index} className="flex items-center space-x-4 mb-4">
              {/* Type (CNAME) */}
              <Input
                type="text"
                value={record.type}
                readOnly
                className="w-1/6"
              />
              {/* Name (host) */}
              <Input
                type="text"
                value={record.name}
                readOnly
                className="w-1/3"
              />
              {/* Content (data) */}
              <Input
                type="text"
                value={record.content}
                readOnly
                className="w-1/3"
              />
            </div>
          ))}
          <div className={styles.buttonContainer}>
            <Button
              type="button"
              onClick={addRecordsToCloudflare}
              className={styles.addButton}
            >
              1. Add Records to Cloudflare
            </Button>
            <Button
              type="button"
              onClick={validateAuthenticatedSGDomain}
              className={styles.addButton}
            >
              2. Validate Domain in Sendgrid
            </Button>
          </div>
        </div>
      )}

      {/* Light grey divider */}
      <div className="w-full h-px bg-gray-200 my-6"></div>

      {/* Sender Authentication Section */}
      <div className={styles.dnsRecordsContainer}>
        <h3 className={styles.subHeading}>Authenticate Sender</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="Enter nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="w-1/2">
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                type="text"
                placeholder="Enter from name"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                type="email"
                placeholder="Enter from email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="w-1/2">
              <Label htmlFor="replyTo">Reply To Email</Label>
              <Input
                id="replyTo"
                type="email"
                placeholder="Enter reply to email"
                value={replyTo}
                onChange={(e) => setReplyTo(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="w-1/2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-1/2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                type="text"
                placeholder="Enter country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="w-1/2 flex items-end">
              <Button
                type="button"
                onClick={handleSenderAuth}
                className={`${styles.addButton} w-full`}
                disabled={
                  !nickname ||
                  !fromEmail ||
                  !replyTo ||
                  !fromName ||
                  !address ||
                  !city ||
                  !country
                }
              >
                Authenticate Sender
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SgDomainAuth;
