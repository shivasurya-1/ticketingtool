import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL;
//  axios instance
export const axiosInstance = axios.create({
  // baseURL: process.env.REACT_APP_MAIN_API_URL,
  baseURL: apiURL,
  headers: {
    "Content-Type": "application/json",
  },
});
