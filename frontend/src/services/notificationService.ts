import type {
  Notification,
  NotificationPreferences,
} from "../types/notification";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export class NotificationService {
  // Get notifications with pagination and filtering
  static async getNotifications(
    page = 1,
    limit = 20,
    unreadOnly = false
  ): Promise<{
    notifications: Notification[];
    total: number;
    unreadCount: number;
    currentPage: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(unreadOnly && { unreadOnly: "true" }),
    });

    const response = await fetch(`${API_BASE}/notifications?${params}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch notifications");
    }

    return response.json();
  }

  // Get only unread count for performance
  static async getUnreadCount(): Promise<number> {
    const response = await fetch(`${API_BASE}/notifications/unread-count`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch unread count");
    }

    const data = await response.json();
    return data.count || 0;
  }

  // Mark single notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE}/notifications/${notificationId}/read`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Failed to mark notification as read"
      );
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(): Promise<void> {
    const response = await fetch(`${API_BASE}/notifications/read-all`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Failed to mark all notifications as read"
      );
    }
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE}/notifications/${notificationId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to delete notification");
    }
  }

  // Get notification preferences
  static async getPreferences(): Promise<NotificationPreferences> {
    const response = await fetch(`${API_BASE}/notifications/preferences`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Failed to fetch notification preferences"
      );
    }

    return response.json();
  }

  // Update notification preferences
  static async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    const response = await fetch(`${API_BASE}/notifications/preferences`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || "Failed to update notification preferences"
      );
    }
  }

  // Real-time notification polling (can be upgraded to WebSockets later)
  static startPolling(
    callback: (unreadCount: number) => void,
    interval = 30000
  ): () => void {
    const pollUnreadCount = async () => {
      try {
        const count = await this.getUnreadCount();
        callback(count);
      } catch (error) {
        console.error("Error polling notifications:", error);
      }
    };

    const intervalId = setInterval(pollUnreadCount, interval);

    // Initial call
    pollUnreadCount();

    // Return cleanup function
    return () => clearInterval(intervalId);
  }
}
