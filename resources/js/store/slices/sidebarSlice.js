import { createSlice } from '@reduxjs/toolkit';

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState: { isOpen: true },
  reducers: {
    toggleSidebar: (state) => { state.isOpen = !state.isOpen; },
    setSidebar: (state, action) => { state.isOpen = action.payload; },
  },
});

export const { toggleSidebar, setSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;
