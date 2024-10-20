// src/components/AddDNSRecordsToCloudflare/AddDNSRecordsToCloudflare.js
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MdDeleteForever } from "react-icons/md";
import { toast } from "react-toastify";
import axiosInstance from "@/utils/axiosInstance";
import styles from "./AddDNSRecordsToCloudflare.module.css";
import "../../spinner.css";

const AddDNSRecordsToCloudflare = () => {
  const [domainName, setDomainName] = useState("");
  const [records, setRecords] = useState([
    {
      type: "A",
      name: "",
      content: "144.126.137.229",
      proxied: true,
    },
    { type: "A", name: "www", content: "144.126.137.229", proxied: true },
    { type: "A", name: "e", content: "144.126.137.229", proxied: true },
    { type: "A", name: "safelinks", content: "144.126.137.229", proxied: true },
    { type: "A", name: "email", content: "15.204.199.95", proxied: false },
    {
      type: "MX",
      name: `${domainName}`,
      content: `email.${domainName}`,
      priority: 10,
    },
    { type: "MX", name: "info", content: `email.${domainName}`, priority: 10 },
    { type: "MX", name: "m", content: `email.${domainName}`, priority: 10 },
    {
      type: "MX",
      name: "update",
      content: `email.${domainName}`,
      priority: 10,
    },
    {
      type: "MX",
      name: "service",
      content: `email.${domainName}`,
      priority: 10,
    },
    // Add new TXT records
    {
      type: "TXT",
      name: `_dmarc${domainName}`,
      content: `"v=DMARC1; p=none;"`,
      initialName: "_dmarc.",
    },
    {
      type: "TXT",
      name: `_dmarc.info${domainName}`,
      content: `"v=DMARC1; p=none;"`,
      initialName: "_dmarc.info.",
    },
    {
      type: "TXT",
      name: `_dmarc.m${domainName}`,
      content: `"v=DMARC1; p=none;"`,
      initialName: "_dmarc.m.",
    },
    {
      type: "TXT",
      name: `_dmarc.update${domainName}`,
      content: `"v=DMARC1; p=none;"`,
      initialName: "_dmarc.update.",
    },
    {
      type: "TXT",
      name: `_dmarc.service${domainName}`,
      content: `"v=DMARC1; p=none;"`,
      initialName: "_dmarc.service.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addRecord = () => {
    setRecords([
      ...records,
      { type: "A", name: "", content: "", proxied: false },
    ]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedRecords = [...records];
    updatedRecords[index][field] = value;
    setRecords(updatedRecords);
  };

  const handleDeleteRecord = (index) => {
    const updatedRecords = records.filter((_, i) => i !== index);
    setRecords(updatedRecords);
  };

  const handleDomainChange = (e) => {
    const newDomainName = e.target.value.trim();
    setDomainName(newDomainName);

    const updatedRecords = records.map((record) => {
      if (record.type === "MX") {
        return {
          ...record,
          content: `email.${newDomainName}`,
        };
      } else if (record.type === "TXT" && record.name.includes("_dmarc")) {
        return {
          ...record,
          name: `${record.initialName}${newDomainName}`,
          content: `"v=DMARC1; p=none;"`,
        };
      }
      return record;
    });

    if (newDomainName === "") {
      const clearNameRecords = updatedRecords.map((record) => {
        if (record.type === "MX" || record.type === "TXT") {
          return { ...record, name: "" };
        }
        return record;
      });
      setRecords(clearNameRecords);
    } else {
      setRecords(updatedRecords);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("DNS Records Submitted: ", records);

    try {
      setIsLoading(true);
      for (const record of records) {
        await axiosInstance.post("/cloudflare-add-dns-record", {
          domainName,
          ...record,
        });
      }
      toast.success("DNS Records Added Successfully", {
        position: "bottom-center",
      });
    } catch (error) {
      console.error("Error adding DNS records:", error.response.data.message);
      toast.error(error.response.data.message || "Error adding DNS records:", {
        position: "bottom-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerContainer}>
        <div className={styles.header}>
          <img src="./cloudflareIcon.svg" alt="logo" className={styles.logo} />
          <h2 className={styles.heading}>Add DNS Records To Cloudflare</h2>
          {isLoading && <div className="spinner" />}
        </div>

        <Button type="button" onClick={addRecord}>
          + Add Record
        </Button>
      </div>

      <div>
        <Label htmlFor="domainName">Domain Name</Label>
        <Input
          type="text"
          placeholder="Enter your domain name"
          value={domainName}
          onChange={handleDomainChange}
          className="mb-10 w-1/4 mt-2"
        />
      </div>

      <div>
        <form onSubmit={handleSubmit}>
          {records.map((record, index) => (
            <div key={index} className="flex items-center space-x-4 mb-4">
              <Select
                onValueChange={(value) =>
                  handleInputChange(index, "type", value)
                }
                defaultValue={record.type}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Record Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Record Type</SelectLabel>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="CNAME">CNAME</SelectItem>
                    <SelectItem value="TXT">TXT</SelectItem>
                    <SelectItem value="MX">MX</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Input
                type="text"
                placeholder="Name (e.g. www)"
                value={record.name}
                onChange={(e) =>
                  handleInputChange(index, "name", e.target.value)
                }
                className="w-1/4"
              />

              <Input
                type="text"
                placeholder="Content (e.g. 192.168.1.1)"
                value={record.content}
                onChange={(e) =>
                  handleInputChange(index, "content", e.target.value)
                }
                className="w-1/4"
              />

              {record.type === "MX" && (
                <Input
                  type="number"
                  placeholder="Priority"
                  value={record.priority || ""}
                  onChange={(e) =>
                    handleInputChange(index, "priority", e.target.value)
                  }
                  className={styles.priorityInput}
                />
              )}

              {(record.type === "A" || record.type === "CNAME") && (
                <>
                  <Switch
                    id={`proxied-${index}`}
                    checked={record.proxied}
                    onCheckedChange={(value) =>
                      handleInputChange(index, "proxied", value)
                    }
                  />
                  <Label htmlFor={`proxied-${index}`}>Proxied?</Label>
                </>
              )}

              <div className={styles.deleteButtonContainer}>
                <MdDeleteForever
                  onClick={() => handleDeleteRecord(index)}
                  className="text-red-500"
                  size={20}
                />
              </div>
            </div>
          ))}

          <Button type="submit" className="mt-4" disabled={!domainName}>
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddDNSRecordsToCloudflare;
