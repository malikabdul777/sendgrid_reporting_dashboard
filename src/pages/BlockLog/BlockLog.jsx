// React

// Thirdparty
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Utils

// APISlices
import { useGetAllDomainsQuery } from "@/store/apiSlices/childApiSlices/domainsApiSlice";
import { useGetDomainEventsQuery } from "@/store/apiSlices/childApiSlices/eventsApiSlice";

// Slice

// CustomHooks

// Components

// Constants

// Enums

// Interfaces

// Styles
import styles from "./BlockLog.module.css";
import { useState } from "react";
import OverviewGraph from "@/components/OverviewGraph/OverviewGraph";

// Local enums

// Local constants

// Local Interfaces

const BlockLog = () => {
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [numberOfRecords, setNumberOfRecords] = useState(100);

  const { data: domains } = useGetAllDomainsQuery();

  const { data: domainEventsData } = useGetDomainEventsQuery({
    domain: selectedDomain,
    limit: numberOfRecords,
  });

  console.log(domainEventsData);

  const onDomainDropdownValueChange = (value) => {
    setSelectedDomain(value);
    console.log(domains);
  };

  return <div>Block Logs</div>;
};

export default BlockLog;
