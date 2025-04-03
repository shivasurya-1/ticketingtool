import axios from "axios";

const baseApiUrl = process.env.REACT_APP_BASE_API_URL;

export const axiosInstance = axios.create({
  baseURL: baseApiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});
