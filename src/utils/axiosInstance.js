// src/utils/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://sendgrid-reporting-dashboard-server.onrender.com",
});

export default axiosInstance;
