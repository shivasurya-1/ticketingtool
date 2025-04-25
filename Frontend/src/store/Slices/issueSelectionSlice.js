import { createSlice } from '@reduxjs/toolkit';
 
const initialState = {
  activeCategory: null,
  selectedService: null,
};
 
const issueSelectionSlice = createSlice({
  name: 'issueSelection',
  initialState,
  reducers: {
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    },
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    clearSelection: (state) => {
      state.activeCategory = null;
      state.selectedService = null;
    },
  },
});
 
export const { setActiveCategory, setSelectedService, clearSelection } = issueSelectionSlice.actions;
 
// Selectors
export const selectActiveCategory = (state) => state.issueSelection.activeCategory;
export const selectSelectedService = (state) => state.issueSelection.selectedService;
 
export default issueSelectionSlice.reducer;