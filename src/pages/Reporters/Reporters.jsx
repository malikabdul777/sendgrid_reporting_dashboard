// React
import { useState } from "react";

// Thirdparty
import { toast } from "react-toastify";
import { ImSpinner8 } from "react-icons/im";
import { IoCopyOutline } from "react-icons/io5";

// Utils
import axios from "@/utils/axiosInstance";

// Components
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Constants

// Enums

// Interfaces

// Styles
import styles from "./Reporters.module.css";

// Local enums

// Local constants

// Local Interfaces

const Reporters = () => {
  const [spamEmails, setSpamEmails] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleFetchSpamReports = async () => {
    try {
      setIsFetching(true);
      const response = await axios.get("/spam-reports");

      console.log(response.data);

      if (response.data.success && response.data.data.length > 0) {
        // Extract unique emails and sort them
        const emails = [
          ...new Set(response.data.data.map((item) => item.email)),
        ]
          .sort()
          .join("\n");

        setSpamEmails(emails);
        toast.success(`Found ${response.data.count} spam reports`, {
          position: "bottom-center",
        });
      } else {
        setSpamEmails("");
        toast.info("No spam reports found", {
          position: "bottom-center",
        });
      }
    } catch (error) {
      console.error("Error fetching spam reports:", error);
      toast.error("Failed to fetch spam reports", {
        position: "bottom-center",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(spamEmails);
      toast.success("Copied to clipboard!", {
        position: "bottom-center",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast.error("Failed to copy to clipboard", {
        position: "bottom-center",
      });
    }
  };

  const handleClearConfirm = () => {
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await axios.delete("/spam-reports");

      if (response.data.success) {
        setSpamEmails("");
        toast.success("Successfully cleared all spam reports", {
          position: "bottom-center",
        });
      }
    } catch (error) {
      console.error("Error clearing spam reports:", error);
      toast.error("Failed to clear spam reports", {
        position: "bottom-center",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className="space-y-4">
          <div className={styles.header}>
            <div className="flex items-center gap-2">
              <h3 className={styles.subHeading}>Spam Reports</h3>
              {isFetching && (
                <ImSpinner8 className="animate-spin text-black" size={20} />
              )}
            </div>
          </div>
          <div className="relative">
            <Textarea
              value={spamEmails}
              onChange={(e) => setSpamEmails(e.target.value)}
              placeholder="Spam email addresses will appear here..."
              className={`${styles.textarea} p-6`}
            />
            {spamEmails && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-colors"
                aria-label="Copy to clipboard"
              >
                <IoCopyOutline className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleFetchSpamReports}
              disabled={isFetching || isDeleting}
              className={styles.button}
            >
              {isFetching ? "Fetching..." : "Fetch Reporters"}
            </Button>
            <Button
              variant="ghost"
              onClick={handleClearConfirm}
              disabled={!spamEmails || isDeleting}
              className={`${styles.button} text-red-500 hover:text-red-600 hover:bg-red-50`}
            >
              {isDeleting ? "Clearing..." : "Clear"}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Spam Reports</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all spam reports? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              {isDeleting ? "Clearing..." : "Clear All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reporters;
