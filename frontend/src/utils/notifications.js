export const NOTIFICATION_EVENT = 'tm-notification';
export const NOTIFICATION_STORAGE_KEY = 'tm_notifications';

const readNotifications = () => {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(localStorage.getItem(NOTIFICATION_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeNotifications = (notifications) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
};

export const pushNotification = (notification) => {
  if (typeof window === 'undefined') return;

  const nextNotification = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: notification.title || 'Update',
    message: notification.message || '',
    type: notification.type || 'info',
    createdAt: notification.createdAt || new Date().toISOString(),
    read: false
  };

  const nextList = [nextNotification, ...readNotifications()].slice(0, 10);
  writeNotifications(nextList);
  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: nextNotification }));
};

export const getStoredNotifications = () => readNotifications();
export const saveNotifications = writeNotifications;
