// store/actions/userActions.js

import { createAsyncThunk } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import { axiosInstance } from "../../utils/axiosInstance";

export const fetchUserDetails = createAsyncThunk(
  "user/fetchUserDetails",
  async (accessToken, { rejectWithValue }) => {
    try {
      const decoded = jwtDecode(accessToken);
      const userId = decoded?.user_id;
      console.log(decoded);
      if (!userId) throw new Error("Invalid token payload");

      const response = await axiosInstance.get("/details/my_profile/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("User details response:", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
