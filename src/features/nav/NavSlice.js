import { createSlice } from '@reduxjs/toolkit';

const navSlice = createSlice({
  name: 'navigation',
  initialState: {
    items: [
      { name: 'Create Incident', link: '/create-ticket'},
      { name: 'Assigned to me', link: '/mytickets' },
      { name: 'Open Incidents', link: '/tickets/open' },
      { name: 'Resolved Incidents', link: '/tickets/resolved' },
      { name: 'Escalated Incidents', link: '/tickets/escalated' },
      { name: 'Create Problem Ticket', link: '/create-problem' },
      { name: 'Knowledge Article', link: '/knowledge-article' },
      { name: 'Support', link: '/support' },
      // { name: 'Add Shortcut', link: '/add-shortcut' },
      // { name: 'Project Settings', link: '/project-settings' },
    ],
  },
  reducers: {},
});

export const selectNavItems = (state) => state.navigation.items;
export default navSlice.reducer;
