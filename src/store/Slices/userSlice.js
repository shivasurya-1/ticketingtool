import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  username: null,
  profilePic: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.username = action.payload.username;
      state.profilePic = action.payload.profile_pic_url;
    },
    logout: (state) => {
      state.username = null;
      state.profilePic = null;
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
