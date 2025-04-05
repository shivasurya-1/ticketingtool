// src/redux/userProfileSlice.js

import { createSlice } from "@reduxjs/toolkit";

/**
 * Redux slice to store user profile details globally.
 */
const initialState = {
  userProfile: null,
};

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    clearUserProfile: (state) => {
      state.userProfile = null;
    },
  },
});

export const { setUserProfile, clearUserProfile } = userProfileSlice.actions;
export default userProfileSlice.reducer;
