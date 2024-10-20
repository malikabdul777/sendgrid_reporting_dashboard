// src/utils/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://sendgrid-reporting-dashboard-server.onrender.com",
});

// https://sendgrid-reporting-dashboard-server.onrender.com
// http://localhost:3000

export default axiosInstance;
