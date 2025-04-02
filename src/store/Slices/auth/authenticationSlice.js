import { createSlice } from '@reduxjs/toolkit';

const authenticationSlice = createSlice({
  name: 'authentication',
  initialState: {
    isAuthenticated: false,
  },
  reducers: {
    login: (state) => {
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      localStorage.removeItem("access_token");
    },
  },
});

export const { login, logout } = authenticationSlice.actions;
export default authenticationSlice.reducer;
