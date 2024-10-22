import React, { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";

import axios from "../../utils/axiosInstance";

import styles from "./GetWebfromDomainBlocksData.module.css";
import "../../spinner.css";

const GetWebformDomainBlocksData = () => {
  const [domainData, setDomainData] = useState("");
  const [responseData, setResponseData] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("/check-webform-domains", {
        domainData,
      });

      const data = response.data; // Get data from the axios response
      if (data.success) {
        setResponseData(data.data);

        toast.success(response.data.message, {
          position: "bottom-center",
        });
      } else {
        toast.error(data.message, {
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

  // Sort the data by totalBlocks in descending order
  const sortedData = responseData.sort((a, b) => b.totalBlocks - a.totalBlocks);

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit}>
        <Textarea
          placeholder="Enter domains (domain: number) separated by new lines"
          value={domainData}
          onChange={(e) => setDomainData(e.target.value)}
          rows={10}
          className="mb-4"
        />
        <div className={styles.buttonContainer}>
          <Button type="submit">Submit</Button>{" "}
          {isLoading && <div className="spinner" />}
        </div>
      </form>

      {responseData.length > 0 && (
        <div className={styles.tableContainer}>
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Webform ID</TableHead>
                <TableHead>Data Name</TableHead>
                <TableHead>Total Blocks</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item, index) => (
                <React.Fragment key={index}>
                  <TableRow>
                    <TableCell>{item.webformId}</TableCell>
                    <TableCell>{item.dataName}</TableCell>
                    <TableCell>{item.totalBlocks}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() =>
                          setExpandedRow(expandedRow === index ? null : index)
                        }
                      >
                        {expandedRow === index ? "Collapse" : "Expand"}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedRow === index && (
                    <Accordion type="single" collapsible>
                      <AccordionItem value={`item-${index}`}>
                        <AccordionTrigger>Domain List</AccordionTrigger>
                        <AccordionContent>
                          <ul>
                            {item.domainList.map((domain, idx) => (
                              <li key={idx}>{domain}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default GetWebformDomainBlocksData;
