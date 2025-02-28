// React
import { useState } from "react";

// Thirdparty
import { toast } from "react-toastify";
import { ImSpinner8 } from "react-icons/im";
import { IoAdd } from "react-icons/io5";
import { IoRemove } from "react-icons/io5";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Utils
import axios from "@/utils/axiosInstance";

// APISlices

// Slice

// CustomHooks

// Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Constants

// Enums

// Interfaces

// Styles
import styles from "./DomainLogs.module.css";

// Local enums

// Local constants

// Local Interfaces

const DomainLogs = () => {
  const [selectedSG, setSelectedSG] = useState("");
  const [domainsData, setDomainsData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const handleSendgridChange = async (value) => {
    setSelectedSG(value);
    try {
      setIsFetching(true);
      const response = await axios.get(`/sg-reports/${value}`);

      if (response.data.success) {
        // Separate "not found" domain and other domains
        const notFoundDomain = response.data.data.find(
          (item) => item.domain === "not found"
        );
        const otherDomains = response.data.data.filter(
          (item) => item.domain !== "not found"
        );

        // Sort other domains by blocked count in descending order
        const sortedDomains = otherDomains.sort(
          (a, b) => b.eventCounts.blocked - a.eventCounts.blocked
        );

        // Append "not found" domain at the end if it exists
        const finalSortedData = notFoundDomain
          ? [...sortedDomains, notFoundDomain]
          : sortedDomains;

        setDomainsData(finalSortedData);
      }
    } catch (error) {
      console.error("Error fetching Sendgrid reports:", error);
      toast.error("Account not found,Failed to fetch reports", {
        position: "bottom-center",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const barColors = {
    Gmail: "#EA4335", // Google Red
    Outlook: "#0078D4", // Microsoft Blue
    Yahoo: "#720E9E", // Yahoo Purple
    Hotmail: "#00A4EF", // Hotmail Blue
    iCloud: "#157EFB", // iCloud Blue
    otherDomain: "#6B7280", // Gray
  };

  const prepareChartData = (blockedEmailHosts) => {
    return Object.entries(blockedEmailHosts).map(([host, count]) => ({
      name: host,
      value: count,
      color: barColors[host],
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded-md shadow-sm">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-sm text-gray-600">Blocked: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-screen overflow-y-auto p-6">
      <div className="max-w-[1200px]">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">Sendgrid Reports</h3>
                {isFetching && (
                  <ImSpinner8 className="animate-spin text-black" size={20} />
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Delivered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600">Blocked</span>
                </div>
              </div>
            </div>

            <div className="w-[200px]">
              <Select onValueChange={handleSendgridChange} value={selectedSG}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Sendgrid" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">Sendgrid 2</SelectItem>
                  <SelectItem value="3">Sendgrid 3</SelectItem>
                  <SelectItem value="4">Sendgrid 4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {domainsData.length > 0 && (
              <div className="mt-4">
                <Accordion type="multiple" className="space-y-2">
                  {domainsData.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={item.domain}
                      className="border border-gray-200 rounded-md bg-white px-4"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex justify-between items-center w-full">
                          <span className="text-sm">{item.domain}</span>
                          <div className="flex items-center gap-4 mr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="text-sm text-gray-600">
                                {item.eventCounts.delivered}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              <span className="text-sm text-gray-600">
                                {item.eventCounts.blocked}
                              </span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="py-6 px-4 border-t">
                          <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={prepareChartData(item.blockedEmailHosts)}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 30,
                                  bottom: 60,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  vertical={false}
                                />
                                <XAxis
                                  dataKey="name"
                                  angle={-45}
                                  textAnchor="end"
                                  height={60}
                                  interval={0}
                                  tick={{ fontSize: 12 }}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                  {prepareChartData(item.blockedEmailHosts).map(
                                    (entry, index) => (
                                      <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                      />
                                    )
                                  )}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainLogs;
