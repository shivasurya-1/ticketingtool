import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  files: []
};

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    addFiles: (state, action) => {
      const newFiles = action.payload.map((file, index) => ({
        id: `${file.name}-${index}-${Date.now()}`, // Unique ID for each file
        file
      }));
      state.files.push(...newFiles);
    },
    removeFile: (state, action) => {
      state.files = state.files.filter((file) => file.id !== action.payload);
    }
  }
});

export const { addFiles, removeFile } = filesSlice.actions;

export default filesSlice.reducer;


