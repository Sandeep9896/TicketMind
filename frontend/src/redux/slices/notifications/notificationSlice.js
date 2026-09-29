import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'tm_notifications';

const readStoredNotifications = () => {
  if (typeof localStorage === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: readStoredNotifications(),
  reducers: {
    addNotification: (state, action) => {
      state.unshift(action.payload);
      state.splice(10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    clearNotifications: (state) => {
      state.splice(0);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    dismissNotification: (state, action) => {
      const index = state.findIndex((item) => item.id === action.payload);
      if (index !== -1) state.splice(index, 1);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }
});

export const { addNotification, clearNotifications, dismissNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
