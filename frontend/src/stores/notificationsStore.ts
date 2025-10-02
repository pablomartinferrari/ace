import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

interface NotificationsState {
  // State
  notifications: Notification[];
  unreadCount: number;

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;

  // Computed getters
  hasUnread: boolean;
  recentNotifications: Notification[];
}

export const useNotificationsStore = create<NotificationsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      notifications: [],
      unreadCount: 0,

      // Actions
      addNotification: (notificationData) => {
        const notification: Notification = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          read: false,
          ...notificationData,
        };

        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },

      markAsRead: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
          );
          const newUnreadCount = updatedNotifications.filter(n => !n.read).length;

          return {
            notifications: updatedNotifications,
            unreadCount: newUnreadCount,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(notification => ({
            ...notification,
            read: true,
          })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id) => {
        set((state) => {
          const notificationToRemove = state.notifications.find(n => n.id === id);
          const updatedNotifications = state.notifications.filter(n => n.id !== id);

          return {
            notifications: updatedNotifications,
            unreadCount: notificationToRemove && !notificationToRemove.read
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        });
      },

      clearAll: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },

      // Computed getters
      get hasUnread() {
        return get().unreadCount > 0;
      },

      get recentNotifications() {
        return get().notifications.slice(0, 10);
      },
    }),
    {
      name: 'notifications-store',
    }
  )
);

// Helper functions for common notification types
export const notificationHelpers = {
  success: (title: string, message: string) =>
    useNotificationsStore.getState().addNotification({
      type: 'success',
      title,
      message,
    }),

  error: (title: string, message: string) =>
    useNotificationsStore.getState().addNotification({
      type: 'error',
      title,
      message,
    }),

  warning: (title: string, message: string) =>
    useNotificationsStore.getState().addNotification({
      type: 'warning',
      title,
      message,
    }),

  info: (title: string, message: string) =>
    useNotificationsStore.getState().addNotification({
      type: 'info',
      title,
      message,
    }),

  newPost: (username: string) =>
    useNotificationsStore.getState().addNotification({
      type: 'info',
      title: 'New Post',
      message: `${username} created a new post`,
    }),

  newConnection: (username: string) =>
    useNotificationsStore.getState().addNotification({
      type: 'success',
      title: 'New Connection',
      message: `${username} connected with you`,
    }),
};