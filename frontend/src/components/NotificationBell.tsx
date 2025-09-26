import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "../contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, refreshUnreadCount } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Refresh count when dropdown opens
  useEffect(() => {
    if (isOpen) {
      refreshUnreadCount();
    }
  }, [isOpen, refreshUnreadCount]);

  const recentNotifications = notifications.slice(0, 5);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

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

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    setIsOpen(false);

    // Navigate to action URL if provided
    if (notification.metadata?.actionUrl) {
      navigate(notification.metadata.actionUrl);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-white/80 transition-colors focus:outline-none rounded-full"
        aria-label="Notifications"
      >
        <svg
          className={`w-6 h-6 transition-all ${
            isOpen ? "fill-black stroke-black" : "fill-none stroke-black"
          }`}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:left-auto sm:right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden transform -translate-x-1/2 sm:translate-x-0">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/dashboard/notifications");
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                View All
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">🔔</div>
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  You'll see property updates and messages here
                </p>
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead
                      ? "bg-blue-50 border-l-4 border-l-blue-500"
                      : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">
                          {getTypeIcon(notification.type)}
                        </span>
                        <p
                          className={`text-sm font-medium ${
                            !notification.isRead
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                        <span className="text-xs text-gray-400 capitalize">
                          {notification.category
                            .replace("_", " ")
                            .toLowerCase()}
                        </span>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1 flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {recentNotifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate("/dashboard/notifications");
                }}
                className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                View All Notifications ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
