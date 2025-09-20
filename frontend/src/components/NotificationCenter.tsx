import React, { useState, useEffect } from "react";
import { useNotifications } from "../contexts/NotificationContext";
import type { Notification } from "../types/notification";
import Button from "./Button";

const NotificationCenter: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesReadFilter = filter === "all" || !notification.isRead;
    const matchesCategory =
      selectedCategory === "all" || notification.category === selectedCategory;
    return matchesReadFilter && matchesCategory;
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(notifications.map((n) => n.category)));

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return "✅";
      case "ERROR":
        return "❌";
      case "WARNING":
        return "⚠️";
      case "INFO":
      default:
        return "📢";
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return "text-green-600 bg-green-100";
      case "ERROR":
        return "text-red-600 bg-red-100";
      case "WARNING":
        return "text-yellow-600 bg-yellow-100";
      case "INFO":
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatCategoryName = (category: string) => {
    return category
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Navigate to action URL if provided
    if (notification.metadata?.actionUrl) {
      window.location.href = notification.metadata.actionUrl;
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this notification?")) {
      deleteNotification(notificationId);
    }
  };

  // Refresh notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-3 bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Stay updated with your property and account activities
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" onClick={markAllAsRead}>
              Mark All Read
            </Button>
          )}
          <Button size="sm" onClick={fetchNotifications} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "unread")}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {formatCategoryName(category)}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredNotifications.length} of {notifications.length}{" "}
          notifications
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 && !loading ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {filter === "unread"
                ? "All caught up! Check back later for new updates."
                : "You'll receive notifications here when there are updates about your properties, messages, and account activity."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                !notification.isRead
                  ? "bg-blue-50 border-blue-200 border-l-4 border-l-blue-500"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium ${getTypeStyles(
                      notification.type
                    )}`}
                  >
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className={`font-semibold text-lg ${
                          !notification.isRead
                            ? "text-gray-900"
                            : "text-gray-700"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3 leading-relaxed">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                          {formatCategoryName(notification.category)}
                        </span>
                        {notification.metadata?.actionUrl && (
                          <span className="text-xs text-blue-600">
                            Click to view details →
                          </span>
                        )}
                      </div>
                      {!notification.isRead && (
                        <div className="flex items-center text-blue-600">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                          <span className="text-xs font-medium">NEW</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={(e) => handleDeleteClick(e, notification._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                    aria-label="Delete notification"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button (for future pagination implementation) */}
      {filteredNotifications.length > 0 && (
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Showing all notifications. Older notifications are automatically
            removed after 30 days.
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
