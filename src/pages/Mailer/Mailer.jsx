import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import styles from "./Mailer.module.css";
import { baseURL } from "@/utils/axiosInstance";
import axiosInstance from "@/utils/axiosInstance";

const Mailer = () => {
  // State for OAuth flow
  const [oauthCredentials, setOauthCredentials] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // State for email content and recipients
  const [htmlContent, setHtmlContent] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [emailSubject, setEmailSubject] = useState("");
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // State for delivery status
  const [deliveryStatus, setDeliveryStatus] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [logMessages, setLogMessages] = useState([]);

  // WebSocket reference
  const wsRef = useRef(null);

  // Cleanup WebSocket on component unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Handle OAuth credentials file upload with enhanced validation
  const handleOAuthFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".json")) {
      toast.error("Please upload a valid JSON file");
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      toast.error("File size too large. Please upload a file smaller than 1MB");
      return;
    }

    // Extract email from filename (remove .json extension)
    const fileName = file.name;
    const emailFromFileName = fileName.endsWith(".json")
      ? fileName.substring(0, fileName.length - 5)
      : fileName;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedJson = JSON.parse(event.target.result);
        const missingFields = [];
        let jsonData = {};

        // Handle Google OAuth credentials format which has nested structure
        if (parsedJson.installed) {
          // Extract from nested structure
          jsonData = {
            client_id: parsedJson.installed.client_id,
            client_secret: parsedJson.installed.client_secret,
            user_email: parsedJson.installed.user_email || null,
          };
        } else {
          // Use flat structure
          jsonData = parsedJson;
        }

        // Enhanced validation
        if (!jsonData.client_id || typeof jsonData.client_id !== "string") {
          missingFields.push("client_id");
        }
        if (
          !jsonData.client_secret ||
          typeof jsonData.client_secret !== "string"
        ) {
          missingFields.push("client_secret");
        }

        // If user_email is missing, use the filename as email
        if (!jsonData.user_email) {
          if (emailFromFileName && emailFromFileName.includes("@")) {
            jsonData.user_email = emailFromFileName;
          } else {
            missingFields.push("user_email");
          }
        }

        // Validate email format
        if (
          jsonData.user_email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(jsonData.user_email)
        ) {
          toast.error("Invalid email format in OAuth credentials");
          return;
        }

        if (missingFields.length > 0) {
          toast.error(
            `Invalid OAuth credentials file. Missing required fields: ${missingFields.join(
              ", "
            )}`
          );
          return;
        }

        setOauthCredentials(jsonData);
        toast.success("OAuth credentials loaded successfully");
      } catch (error) {
        console.error("OAuth file parsing error:", error);
        toast.error(
          "Invalid JSON file. Please check the format and try again."
        );
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read file. Please try again.");
    };

    reader.readAsText(file);
  };

  // Initiate OAuth flow directly without backend token checking
  const handleAuthorize = () => {
    if (!oauthCredentials) {
      toast.error("Please upload OAuth credentials first");
      return;
    }

    if (!oauthCredentials.user_email) {
      toast.error("OAuth credentials must include a user email");
      return;
    }

    setAuthLoading(true);
    initiateOAuthFlow();
  };

  // Exchange authorization code for refresh and access tokens
  const exchangeCodeForToken = async (authCode) => {
    try {
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: oauthCredentials.client_id,
          client_secret: oauthCredentials.client_secret,
          code: authCode,
          grant_type: "authorization_code",
          redirect_uri: "urn:ietf:wg:oauth:2.0:oob",
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.refresh_token && tokenData.access_token) {
        setRefreshToken(tokenData.refresh_token);
        setAccessToken(tokenData.access_token);
        toast.success(
          "Gmail authorization successful! You can now send emails."
        );
      } else {
        toast.error("Failed to obtain tokens. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to exchange authorization code for token");
    } finally {
      setAuthLoading(false);
    }
  };

  // Generate access token from refresh token
  const generateAccessToken = async () => {
    if (!refreshToken || !oauthCredentials) {
      throw new Error("Missing refresh token or OAuth credentials");
    }

    try {
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: oauthCredentials.client_id,
          client_secret: oauthCredentials.client_secret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.access_token) {
        setAccessToken(tokenData.access_token);
        return tokenData.access_token;
      } else {
        throw new Error("Failed to generate access token");
      }
    } catch (error) {
      throw new Error("Failed to refresh access token: " + error.message);
    }
  };

  // Show manual code entry dialog as fallback
  const showManualCodeEntry = () => {
    const code = prompt(
      "Google should have displayed an authorization code in the popup window.\n\n" +
      "Please look for a page that says 'Please copy this code' or similar, " +
      "and copy the authorization code displayed there.\n\n" +
      "The code will look like: 4/0AX4XfWh...\n\n" +
      "Paste the authorization code below:"
    );
    if (code && code.trim()) {
      exchangeCodeForToken(code.trim());
    } else {
      setAuthLoading(false);
      toast.error("Authorization cancelled or invalid code entered");
    }
  };

  // Initiate OAuth flow with out-of-band redirect URI for manual code entry
  const initiateOAuthFlow = () => {
    if (!oauthCredentials || !oauthCredentials.client_id) {
      toast.error("OAuth credentials are invalid or missing client_id");
      setAuthLoading(false);
      return;
    }

    const { client_id } = oauthCredentials;

    // Use out-of-band flow - Google will display the code directly
    const redirectUri = encodeURIComponent("urn:ietf:wg:oauth:2.0:oob");
    const scope = encodeURIComponent("https://mail.google.com/");
    const responseType = "code";
    const accessType = "offline";
    const prompt = "consent";

    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${client_id}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=${accessType}&prompt=${prompt}`;

    // Open OAuth in a popup window
    const popupWidth = 800;
    const popupHeight = 700;
    const left = window.screenX + (window.outerWidth - popupWidth) / 2;
    const top = window.screenY + (window.outerHeight - popupHeight) / 2;

    const authWindow = window.open(
      authUrl,
      "Google OAuth",
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable,scrollbars=yes,status=1`
    );

    // Check if popup was blocked
    if (
      !authWindow ||
      authWindow.closed ||
      typeof authWindow.closed === "undefined"
    ) {
      toast.error("Popup was blocked. Opening OAuth page in new tab instead.");
      // Fallback: open in new tab
      window.open(authUrl, "_blank");
    }

    // Show instructions and prompt for manual code entry
    toast.info("Please complete the authorization in the popup window, then copy the code.");
    
    // Wait a moment for user to see the popup, then show code entry
    setTimeout(() => {
      showManualCodeEntry();
    }, 3000);
  };

  // Handle HTML file upload with enhanced validation
  const handleHtmlFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validExtensions = [".html", ".htm"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!validExtensions.includes(fileExtension)) {
      toast.error("Please upload a valid HTML file (.html or .htm)");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("HTML file too large. Please upload a file smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;

        // Basic HTML validation
        if (!content || content.trim().length === 0) {
          toast.error("HTML file appears to be empty");
          return;
        }

        // Check if content contains basic HTML structure
        const hasHtmlTags = /<[^>]+>/g.test(content);
        if (!hasHtmlTags) {
          toast.warning(
            "File doesn't appear to contain HTML tags. Proceeding anyway..."
          );
        }

        setHtmlContent(content);
        toast.success("HTML content loaded successfully");
      } catch (error) {
        console.error("HTML file processing error:", error);
        toast.error("Error processing HTML file. Please try again.");
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read HTML file. Please try again.");
    };

    reader.readAsText(file);
  };

  // Handle CSV file upload with enhanced validation
  const handleCsvFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a valid CSV file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "File size too large. Please upload a CSV file smaller than 5MB"
      );
      return;
    }

    // Store the actual file for FormData upload
    setCsvFile(file);

    // Also parse for preview/validation
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvContent = event.target.result;
        const lines = csvContent.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          toast.error("CSV must have at least a header row and one data row");
          setCsvFile(null);
          setCsvHeaders([]);
          setRecipients([]);
          return;
        }

        // Parse headers with better validation
        const headers = lines[0]
          .split(",")
          .map((header) => header.trim().replace(/"/g, ""));

        if (headers.length === 0 || headers.every((h) => !h)) {
          toast.error("Invalid CSV format: No valid headers found");
          setCsvFile(null);
          return;
        }

        setCsvHeaders(headers);

        // Parse data rows for preview with improved validation
        const recipientObjects = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i]
            .split(",")
            .map((value) => value.trim().replace(/"/g, ""));

          if (values.length >= headers.length) {
            const recipientObj = {};
            headers.forEach((header, index) => {
              recipientObj[header] = values[index] || "";
            });

            // Find email field with better detection
            const emailField =
              headers.find(
                (h) =>
                  h.toLowerCase().includes("email") ||
                  h.toLowerCase().includes("mail") ||
                  h.toLowerCase() === "e-mail"
              ) || headers[0];

            // Validate email format
            if (
              recipientObj[emailField] &&
              emailRegex.test(recipientObj[emailField])
            ) {
              recipientObjects.push(recipientObj);
            }
          }
        }

        if (recipientObjects.length === 0) {
          toast.error(
            "No valid email addresses found in CSV. Please ensure your CSV contains a column with valid email addresses."
          );
          setCsvFile(null);
          setCsvHeaders([]);
          setRecipients([]);
          return;
        }

        // Limit recipients to prevent overwhelming the system
        const maxRecipients = 1000;
        if (recipientObjects.length > maxRecipients) {
          toast.warning(
            `Too many recipients (${recipientObjects.length}). Only the first ${maxRecipients} will be processed.`
          );
          setRecipients(recipientObjects.slice(0, maxRecipients));
        } else {
          setRecipients(recipientObjects);
        }

        toast.success(
          `${Math.min(
            recipientObjects.length,
            maxRecipients
          )} recipients loaded successfully`
        );
      } catch (error) {
        console.error("CSV parsing error:", error);
        toast.error(
          "Error parsing CSV file. Please check the format and try again."
        );
        setCsvFile(null);
        setCsvHeaders([]);
        setRecipients([]);
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read CSV file. Please try again.");
      setCsvFile(null);
    };

    reader.readAsText(file);
  };

  // Send emails using FormData with file upload
  const sendEmails = async () => {
    if (!refreshToken) {
      toast.error("Please authenticate with Google first");
      return;
    }

    if (!htmlContent) {
      toast.error("Please upload HTML content for the email");
      return;
    }

    if (!csvFile) {
      toast.error("Please upload a CSV file");
      return;
    }

    if (!emailSubject) {
      toast.error("Please enter an email subject");
      return;
    }

    if (!oauthCredentials) {
      toast.error("Please upload OAuth credentials first");
      return;
    }

    setIsSending(true);
    setDeliveryStatus([]);

    try {
      // Connect to WebSocket for real-time updates
      connectWebSocket();

      // Generate fresh access token before sending
      let currentAccessToken = accessToken;
      if (!currentAccessToken) {
        try {
          currentAccessToken = await generateAccessToken();
        } catch (error) {
          toast.error("Failed to generate access token. Please reauthorize.");
          setIsSending(false);
          return;
        }
      }

      // Create FormData with all required parameters including access and refresh tokens
      const formData = new FormData();
      formData.append("user_email", oauthCredentials.user_email);
      formData.append("subject", emailSubject);
      formData.append("html_template", htmlContent);
      formData.append("access_token", currentAccessToken);
      formData.append("refresh_token", refreshToken);
      formData.append("client_id", oauthCredentials.client_id);
      formData.append("client_secret", oauthCredentials.client_secret);
      formData.append("csv_file", csvFile);

      // Send request using FormData (don't set Content-Type header)
      const response = await fetch(`${baseURL}/gmail/send`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Handle access token expiry
        if (data.error && data.error.includes("token")) {
          try {
            toast.info("Access token expired, refreshing...");
            const newAccessToken = await generateAccessToken();
            // Retry with new access token using FormData
            const retryFormData = new FormData();
            retryFormData.append("user_email", oauthCredentials.user_email);
            retryFormData.append("subject", emailSubject);
            retryFormData.append("html_template", htmlContent);
            retryFormData.append("access_token", newAccessToken);
            retryFormData.append("refresh_token", refreshToken);
            retryFormData.append("client_id", oauthCredentials.client_id);
            retryFormData.append(
              "client_secret",
              oauthCredentials.client_secret
            );
            retryFormData.append("csv_file", csvFile);

            const retryResponse = await fetch(`${baseURL}/gmail/send`, {
              method: "POST",
              body: retryFormData,
            });
            const retryData = await retryResponse.json();
            if (retryResponse.ok && retryData.success) {
              toast.success("Email sending started successfully");
              return;
            }
          } catch (refreshError) {
            toast.error("Token refresh failed. Please reauthorize.");
            setAccessToken(null);
            setRefreshToken(null);
            setIsSending(false);
            return;
          }
        }
        toast.error(data.message || "Failed to start sending emails");
        setIsSending(false);
      } else {
        toast.success("Email sending started successfully");
      }
    } catch (error) {
      toast.error(error.message || "Failed to send emails");
      setIsSending(false);
    }
  };

  const addLogMessage = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogMessages((prev) => [...prev, { message, type, timestamp }]);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const logContent = document.querySelector(`.${styles.logContent}`);
    if (logContent) {
      logContent.scrollTop = logContent.scrollHeight;
    }
  }, [logMessages, deliveryStatus]);

  const clearLogs = () => {
    setDeliveryStatus([]);
    setLogMessages([]);
  };

  // Connect to WebSocket for real-time delivery status updates
  const connectWebSocket = () => {
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    addLogMessage("Connecting to WebSocket...", "info");
    // Create new WebSocket connection
    // Convert http:// to ws:// for WebSocket connection
    const wsUrl =
      (baseURL.startsWith("https") ? "wss://" : "ws://") +
      baseURL.replace(/^https?:\/\//, "") +
      "/api/email-status";
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Check if the message has both status and recipient fields
        if (data.status && data.recipient) {
          // Format the log message as "recipient | status"
          const recipient = data.recipient;
          const status = data.status;

          // Determine the log type based on status
          let logType = "info";
          if (status === "success") {
            logType = "success";
          } else if (status === "error") {
            logType = "error";
          }

          // Create the formatted message
          const formattedMessage = `${recipient} | ${status}`;
          addLogMessage(formattedMessage, logType);
        } else if (data.status === "complete") {
          setIsSending(false);
          toast.success("Email sending process completed");
          setTimeout(() => {
            ws.close();
          }, 1000);
        }
      } catch (error) {
        console.error("WebSocket message parsing error:", error);
        // Don't add log message for parsing errors to keep the log clean
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
      console.log("WebSocket disconnected");
    };

    ws.onerror = (error) => {
      setWsConnected(false);
      toast.error("Error in real-time status connection");
      console.error("WebSocket error:", error);
    };

    wsRef.current = ws;
  };

  // Handle OAuth callback parameters
  useEffect(() => {
    // Check if this is an OAuth callback (URL contains code and state parameters)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");
    const state = urlParams.get("state");

    // If this is the popup window (has code and state)
    if (code && state) {
      // Verify state parameter to prevent CSRF attacks
      const savedState = sessionStorage.getItem("oauth_state");

      if (!savedState || state !== savedState) {
        // Send error message to parent window
        window.opener.postMessage(
          {
            type: "oauth_callback",
            success: false,
            error: "Invalid state parameter",
            state,
          },
          window.location.origin
        );
        window.close();
        return;
      }

      // Clear the state from storage
      sessionStorage.removeItem("oauth_state");

      if (error) {
        // Send error message to parent window
        window.opener.postMessage(
          {
            type: "oauth_callback",
            success: false,
            error,
            state,
          },
          window.location.origin
        );
        window.close();
        return;
      }

      // Exchange code for refresh token
      window.opener.postMessage(
        {
          type: "oauth_callback",
          success: true,
          code,
          state,
        },
        window.location.origin
      );

      // Close the popup window
      window.close();
    } else if (code || error) {
      // If not a popup, handle the callback directly
      // This happens if the user opens the OAuth URL directly

      // Verify state to prevent CSRF attacks
      const savedState = sessionStorage.getItem("oauth_state");

      if (!state || !savedState) {
        toast.error(
          "Authentication failed: Missing security verification parameter"
        );
        // Clean up the URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        return;
      }

      if (state !== savedState) {
        toast.error("Authentication failed: Security verification failed");
        // Clean up the URL
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
        return;
      }

      // Clear the state from session storage
      sessionStorage.removeItem("oauth_state");

      if (code) {
        // Exchange the authorization code for a refresh token
        if (!oauthCredentials || !oauthCredentials.user_email) {
          toast.error(
            "Authentication failed: Missing user email in credentials"
          );
          // Clean up the URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
          return;
        }

        exchangeCodeForToken(code);
      } else {
        toast.error(`Authentication failed: ${error || "Unknown error"}`);
      }

      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [oauthCredentials]);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.container}>
          <h1 className={styles.title}>Gmail Mailer</h1>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Step 1: OAuth Credentials</h2>
            <div className={styles.uploadContainer}>
              <Label htmlFor="oauth-file">
                Upload OAuth Credentials (JSON)
              </Label>
              <Input
                id="oauth-file"
                type="file"
                accept=".json"
                onChange={handleOAuthFileUpload}
                disabled={isSending}
              />
              {oauthCredentials && (
                <div className={styles.credentialsInfo}>
                  <p>✓ OAuth credentials loaded</p>
                  <p>Client ID: {oauthCredentials.client_id}</p>
                  <p>User Email: {oauthCredentials.user_email}</p>
                </div>
              )}

              {oauthCredentials && !refreshToken && (
                <Button
                  onClick={handleAuthorize}
                  disabled={authLoading || isSending}
                  className={styles.button}
                >
                  {authLoading ? "Authorizing..." : "Authorize with Google"}
                </Button>
              )}

              {refreshToken && (
                <div className={styles.authSuccess}>
                  ✓ Successfully authorized! Ready to send emails.
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Step 2: Email Content & Recipients
            </h2>
            <div className={styles.uploadContainer}>
              <Label htmlFor="html-file">Upload Email Content (HTML)</Label>
              <Input
                id="html-file"
                type="file"
                accept=".html,.htm"
                onChange={handleHtmlFileUpload}
                disabled={!refreshToken || isSending}
              />
              {htmlContent && (
                <p>
                  ✓ HTML content loaded (
                  {(htmlContent.length / 1024).toFixed(2)} KB)
                </p>
              )}

              <Label htmlFor="email-subject" className="mt-4">
                Email Subject
              </Label>
              <Input
                id="email-subject"
                type="text"
                placeholder="Enter email subject line"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                disabled={!refreshToken || isSending}
                className="mb-4"
              />

              <Label htmlFor="csv-file">Upload Recipients (CSV)</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleCsvFileUpload}
                disabled={!refreshToken || isSending}
              />
              {recipients.length > 0 && (
                <p>✓ {recipients.length} recipients loaded</p>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <Button
              onClick={sendEmails}
              disabled={
                !refreshToken ||
                !htmlContent ||
                !emailSubject ||
                !csvFile ||
                isSending
              }
              className={styles.sendButton}
            >
              {isSending ? "Sending..." : "Send Emails"}
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.logPanel}>
          <div className={styles.logHeader}>
            <h2 className={styles.logTitle}>WebSocket Log</h2>
            <div className={styles.connectionStatus}>
              <span
                className={`${styles.statusDot} ${
                  wsConnected ? styles.connected : styles.disconnected
                }`}
              ></span>
              {wsConnected ? "Connected" : "Disconnected"}
              {(deliveryStatus.length > 0 || logMessages.length > 0) && (
                <button
                  className={styles.clearButton}
                  onClick={clearLogs}
                  title="Clear logs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className={styles.logContent}>
            {deliveryStatus.length === 0 &&
              logMessages.length === 0 &&
              !isSending && (
                <div className={styles.emptyLog}>
                  <p>
                    No activity yet. Start sending emails to see real-time
                    updates.
                  </p>
                </div>
              )}

            {isSending && deliveryStatus.length === 0 && (
              <div className={styles.loadingLog}>
                <div className={styles.spinner}></div>
                <p>Initializing email sending...</p>
              </div>
            )}

            {deliveryStatus.length > 0 && (
              <div className={styles.logSummary}>
                <div className={styles.summaryStats}>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>
                      {deliveryStatus.filter((s) => s.success).length}
                    </span>
                    <span className={styles.statLabel}>Sent</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>
                      {deliveryStatus.filter((s) => !s.success).length}
                    </span>
                    <span className={styles.statLabel}>Failed</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>
                      {deliveryStatus.length}
                    </span>
                    <span className={styles.statLabel}>Total</span>
                  </div>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${
                        recipients.length > 0
                          ? (deliveryStatus.length / recipients.length) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <div className={styles.progressText}>
                  {recipients.length > 0
                    ? `${Math.round(
                        (deliveryStatus.length / recipients.length) * 100
                      )}% Complete`
                    : "0% Complete"}
                </div>
              </div>
            )}

            {logMessages.length > 0 && (
              <div className={styles.logEntries}>
                {logMessages.map((log, index) => (
                  <div
                    key={`log-${index}`}
                    className={`${styles.logEntry} ${
                      styles[
                        `log${
                          log.type.charAt(0).toUpperCase() + log.type.slice(1)
                        }`
                      ]
                    }`}
                  >
                    <div className={styles.logTimestamp}>{log.timestamp}</div>
                    <div className={styles.logDetails}>
                      <div className={styles.logMessage} title={log.message}>
                        {log.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mailer;
