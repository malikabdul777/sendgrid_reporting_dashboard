// src/utils/axiosInstance.js
import axios from "axios";

const baseURL = "https://sendgrid-reporting-dashboard-server.onrender.com";
const baseURL2 = "https://hessel-net.onrender.com/";

const axiosInstance = axios.create({
  baseURL,
});

// https://sendgrid-reporting-dashboard-server.onrender.com
// http://localhost:3000

export { baseURL, baseURL2 };
export default axiosInstance;
