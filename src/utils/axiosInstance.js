import axios from "axios";

//  axios instance
export const axiosInstance = axios.create({
  // baseURL: "https://ticketing-tool-nug5.onrender.com/",
  baseURL: "http://192.168.0.230:8000/",
  headers: {
    "Content-Type": "application/json",
  },
});
