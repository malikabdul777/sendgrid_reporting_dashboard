import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import styles from "./SgDomainAuth.module.css";
import { useAddDomainInSgMutation } from "@/store/apiSlices/childApiSlices/sendgridApiSlice";
import { useAddDNSRecordsMutation } from "@/store/apiSlices/childApiSlices/cloudflareApiSlice";
import "../../spinner.css";

// Helper function to format DNS records
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

const SgDomainAuth = () => {
  const [domainName, setDomainName] = useState("");
  const [dnsRecords, setDnsRecords] = useState([]);
  const [addDomainInSg, { isLoading: addDomainIsLoading }] =
    useAddDomainInSgMutation();
  const [addDnsRecord, { isLoading: addDnsIsLoading }] =
    useAddDNSRecordsMutation();

  // Handle domain input change
  const handleDomainChange = (event) => {
    setDomainName(event.target.value);
  };

  // Handle domain authentication
  const addRecord = async () => {
    try {
      const response = await addDomainInSg({ domainName });

      console.log(response?.data);

      if (response.data.success) {
        toast.success(response.data.message, {
          position: "bottom-center",
        });
        // Extract DNS records and set them to state
        const formattedRecords = formatDnsRecords(response.data.data.dns);
        setDnsRecords(formattedRecords);
      } else {
        toast.error(response.data.message, {
          position: "bottom-center",
        });
      }
    } catch (error) {
      toast.error("Error authenticating domain", {
        position: "bottom-center",
      });
    }
  };

  // Function to add DNS records to Cloudflare
  const addRecordsToCloudflare = async () => {
    try {
      for (const record of dnsRecords) {
        console.log(record);
        const response = await addDnsRecord({ domainName, ...record }); // Adjust this line according to your API
        if (response.data.success) {
          toast.success(`Record ${record.name} added to Cloudflare!`, {
            position: "bottom-center",
          });
        } else {
          toast.error(
            `Failed to add record ${record.name}: ${response.data.message}`,
            {
              position: "bottom-center",
            }
          );
        }
      }
    } catch (error) {
      toast.error("Error adding records to Cloudflare", {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <img src="./sendgridIcon.svg" alt="logo" className={styles.logo} />
        <h2 className={styles.heading}>Authenticate Domain in SendGrid</h2>
        {addDomainIsLoading || (addDnsIsLoading && <div className="spinner" />)}
      </div>

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

      {/* Render DNS records if available */}
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
          <Button
            type="button"
            onClick={addRecordsToCloudflare}
            className={styles.addButton}
          >
            Add Records to Cloudflare
          </Button>
        </div>
      )}
    </div>
  );
};

export default SgDomainAuth;
