import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type {
  Notification,
  NotificationContextType,
  Toast,
} from "../types/notification";
import { NotificationService } from "../services/notificationService";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // const [toasts, setToasts] = useState<Toast[]>([]); // Disabled - no floating notifications
  const [loading, setLoading] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    // Only fetch if user is authenticated
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await NotificationService.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      showToast({
        title: "Error",
        message: "Failed to load notifications",
        type: "ERROR",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh unread count only (lightweight)
  const refreshUnreadCount = useCallback(async () => {
    // Only refresh if user is authenticated
    if (!user) return;

    try {
      const count = await NotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to refresh unread count:", error);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      showToast({
        title: "Error",
        message: "Failed to mark notification as read",
        type: "ERROR",
      });
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showToast({
        title: "Success",
        message: "All notifications marked as read",
        type: "SUCCESS",
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      showToast({
        title: "Error",
        message: "Failed to mark all notifications as read",
        type: "ERROR",
      });
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        await NotificationService.deleteNotification(id);
        const notification = notifications.find((n) => n._id === id);
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        showToast({
          title: "Success",
          message: "Notification deleted",
          type: "SUCCESS",
        });
      } catch (error) {
        console.error("Failed to delete notification:", error);
        showToast({
          title: "Error",
          message: "Failed to delete notification",
          type: "ERROR",
        });
      }
    },
    [notifications]
  );

  // Show toast notification (disabled - no floating notifications)
  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    // Toast notifications are disabled to avoid floating notifications
    // Users will only receive notifications via:
    // 1. WhatsApp messages
    // 2. Notification bell dropdown
    // 3. Notifications page
    console.log("Toast notification (disabled):", toast);
  }, []);

  // Remove toast (disabled - no floating notifications)
  const removeToast = useCallback((id: string) => {
    // Toast removal is disabled
    console.log("Remove toast (disabled):", id);
  }, []);

  // Initialize notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Set up polling for real-time updates
  useEffect(() => {
    // Only start polling if user is authenticated
    if (!user) return;

    const cleanup = NotificationService.startPolling((count) => {
      setUnreadCount(count);
    }, 30000);

    return cleanup;
  }, [user]);

  // Context value
  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    toasts: [], // Empty array - no floating notifications
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    showToast,
    removeToast,
    refreshUnreadCount,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
