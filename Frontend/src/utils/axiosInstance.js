import axios from "axios";

const baseAPI = "http://192.168.0.230:8000"
//  axios instance
export const axiosInstance = axios.create({
  baseURL: baseAPI,
  headers: {
    "Content-Type": "application/json",
  },
});
