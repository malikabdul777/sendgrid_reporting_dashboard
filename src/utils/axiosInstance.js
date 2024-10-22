// src/utils/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
});

// https://sendgrid-reporting-dashboard-server.onrender.com
// http://localhost:3000

export default axiosInstance;
