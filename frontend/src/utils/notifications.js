import { store } from '../store/store';
import { addNotification } from '../redux/slices/notifications/notificationSlice';

export const pushNotification = (notification) => {
  const nextNotification = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: notification.title || 'Update',
    message: notification.message || '',
    type: notification.type || 'info',
    createdAt: notification.createdAt || new Date().toISOString(),
    read: false
  };

  store.dispatch(addNotification(nextNotification));
};
