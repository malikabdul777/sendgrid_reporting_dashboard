// src/utils/axiosInstance.js
import axios from "axios";

// Get URLs from environment variables
const localURL = import.meta.env.VITE_LOCAL_URL || "http://localhost:3000";
const baseURL1 =
  import.meta.env.VITE_BASE_URL1 ||
  "https://sendgrid-reporting-dashboard-server.onrender.com";
const baseURL2 =
  import.meta.env.VITE_BASE_URL2 ||
  "https://sendgrid-reporting-dashboard-servera2.onrender.com";

// Determine which baseURL to use for the axios instance
const isDevelopment = import.meta.env.MODE === "development";

// Create axios instance with the appropriate baseURL
// Use localURL for development, baseURL1 for production
const axiosInstance = axios.create({
  baseURL: isDevelopment ? localURL : baseURL1,
  timeout: 30000, // 30 seconds timeout
});

console.log(
  `Using API baseURL: ${axiosInstance.defaults.baseURL} (${
    isDevelopment ? "development" : "production"
  } mode)`
);

// Add request interceptor for debugging and auth token
axiosInstance.interceptors.request.use((config) => {
  // Add auth token to requests if available
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log(
    `API Request: ${config.method.toUpperCase()} ${config.baseURL}${
      config.url
    }`,
    config.data ? "with data" : "without data"
  );
  return config;
});

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(
      `API Response from ${response.config.url}: Status ${response.status}`
    );
    return response;
  },
  (error) => {
    console.error("API Error:", error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error("No response received", error.request);
    }
    return Promise.reject(error);
  }
);

// Export all URLs for use in components
// For backward compatibility, export baseURL1 as baseURL
export { baseURL1 as baseURL, baseURL2, localURL };
export default axiosInstance;
