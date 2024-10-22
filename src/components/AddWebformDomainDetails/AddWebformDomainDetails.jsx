import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";

import axios from "@/utils/axiosInstance";
import { toast } from "react-toastify";

import styles from "./AddWebformDomainDetails.module.css";
import "../../spinner.css";

const AddWebformDomainDetails = () => {
  const { register, handleSubmit, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    const { webformId, dataName, domainsList, domainAddedOnDate } = data;
    setIsLoading(true);

    // Trim and split domainList
    const domainsArray = domainsList.split("\n").map((domain) => domain.trim());

    console.log({
      webformId,
      dataName,
      domainsList: domainsArray,
      domainAddedOnDate,
    });

    try {
      const response = await axios.post("/submit-webfrom-domain-record", {
        webformId,
        dataName,
        domainsList: domainsArray,
        domainAddedOnDate,
      });

      console.log(response.data.success);

      if (response.data.success) {
        toast.success(response.data.message, {
          position: "bottom-center",
        });
      }
    } catch (error) {
      toast.error("Something went wrong", {
        position: "bottom-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className={styles.formGroup}>
          <div>
            <label className="block text-sm font-medium mb-2">Webform ID</label>
            <Input
              {...register("webformId", { required: true })}
              placeholder="Enter Webform ID"
              className={styles.input}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Data Name</label>
            <Input
              {...register("dataName", { required: true })}
              placeholder="Enter Data Name"
              className={styles.input}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Domains List</label>
          <Textarea
            {...register("domainsList", { required: true })}
            placeholder="Enter list of domains (one per line)"
            rows={8}
            className={styles.textAreaInput}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Domain Added On Date
          </label>
          <Input
            type="date"
            {...register("domainAddedOnDate", { required: true })}
            className={styles.datePicker}
          />
        </div>

        <div className={styles.buttonWrapper}>
          <Button type="submit">Associate Domains with Webform </Button>
          {isLoading && <div className="spinner" />}
        </div>
      </form>
    </div>
  );
};

export default AddWebformDomainDetails;
