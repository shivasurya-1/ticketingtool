// store/slices/userProfileSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { fetchUserDetails } from "../actions/userActions";

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState: {
    user: null,
    status: "idle",
    error: null,
  },
  reducers: {
    logoutUser: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetails.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserDetails.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(fetchUserDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logoutUser } = userProfileSlice.actions;
export default userProfileSlice.reducer;
