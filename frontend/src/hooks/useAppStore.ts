import { usePostsStore, useAuthStore, useNotificationsStore } from '../stores';
import type { Post } from '../../../shared/types';

type ConnectionNotificationPayload = {
  username: string;
};

// Custom hook that combines all stores for easy access
export const useAppStore = () => {
  const posts = usePostsStore();
  const auth = useAuthStore();
  const notifications = useNotificationsStore();

  return {
    // Posts
    posts: posts.filteredPosts,
    postsLoading: posts.loading,
    postsError: posts.error,
    hasPosts: posts.hasPosts,
    isSearching: posts.isSearching,
    searchQuery: posts.searchQuery,
    filterType: posts.filterType,
    setSearchQuery: posts.setSearchQuery,
    setFilterType: posts.setFilterType,
    triggerRefresh: posts.triggerRefresh,

    // Auth
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    authLoading: auth.isLoading,
    authError: auth.error,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,

    // Notifications
    notifications: notifications.notifications,
    unreadCount: notifications.unreadCount,
    hasUnread: notifications.hasUnread,
    recentNotifications: notifications.recentNotifications,
    addNotification: notifications.addNotification,
    markAsRead: notifications.markAsRead,
    markAllAsRead: notifications.markAllAsRead,
    removeNotification: notifications.removeNotification,
    clearAllNotifications: notifications.clearAll,
  };
};

// Example usage for future real-time features
export const useRealTimeUpdates = () => {
  const { addNotification } = useNotificationsStore();
  const { triggerRefresh } = usePostsStore();

  // This could be called when receiving WebSocket messages
  const handleNewPost = (postData: Pick<Post, 'userName'>) => {
    addNotification({
      type: 'info',
      title: 'New Post',
      message: `${postData.userName} created a new post`,
    });
    triggerRefresh();
  };

  const handleNewConnection = (userData: ConnectionNotificationPayload) => {
    addNotification({
      type: 'success',
      title: 'New Connection',
      message: `${userData.username} connected with you`,
    });
  };

  return {
    handleNewPost,
    handleNewConnection,
  };
};