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
      if (!userId) throw new Error("Invalid token payload");

      const response = await axiosInstance.get("/details/my_profile/", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Add this new thunk for updating the profile
export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async ({ formData, accessToken }, { dispatch, rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/details/my_profile/', formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        }
      });
      
      // After successful update, fetch the latest user data
      dispatch(fetchUserDetails(accessToken));
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);