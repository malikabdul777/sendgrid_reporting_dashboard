// src/utils/axiosInstance.js
import axios from "axios";

// Define all three mandatory URLs
const localURL = "http://localhost:3000"; // Local development URL
const baseURL = "https://sendgrid-reporting-dashboard-server.onrender.com"; // Primary production URL
const baseURL2 = "https://sendgrid-reporting-dashboard-servera2.onrender.com"; // Secondary production URL (used elsewhere in code)

// Determine which baseURL to use for the axios instance
// In a real production app, you might use environment variables instead
const isDevelopment = process.env.NODE_ENV === "development";

// Create axios instance with the appropriate baseURL
// Use localURL for development, baseURL for production
const axiosInstance = axios.create({
  baseURL: isDevelopment ? localURL : baseURL,
  timeout: 30000, // 30 seconds timeout
});

console.log(
  `Using API baseURL: ${axiosInstance.defaults.baseURL} (${
    isDevelopment ? "development" : "production"
  } mode)`
);
console.log(
  `All available URLs: primary=${baseURL}, secondary=${baseURL2}, local=${localURL}`
);

// Add request interceptor for debugging
axiosInstance.interceptors.request.use((config) => {
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
export { baseURL, baseURL2, localURL };
export default axiosInstance;
