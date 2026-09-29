import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/slices/auth/authSlice';
import notificationsReducer from '../redux/slices/notifications/notificationSlice';
import chatReducer from '../redux/slices/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
    chat: chatReducer
  }
});
