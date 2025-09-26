import { useState, useEffect } from "react";
import { useNotifications } from "../../contexts/NotificationContext";
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Transition } from "@headlessui/react";

const categoryColors = {
  PROPERTY_VERIFICATION: "bg-blue-100 text-blue-800",
  PROPERTY_APPROVAL: "bg-green-100 text-green-800",
  MESSAGE: "bg-purple-100 text-purple-800",
  SYSTEM: "bg-gray-100 text-gray-800",
  PAYMENT: "bg-yellow-100 text-yellow-800",
};

const categoryNames = {
  PROPERTY_VERIFICATION: "Property Verification",
  PROPERTY_APPROVAL: "Property Approval",
  MESSAGE: "Message",
  SYSTEM: "System",
  PAYMENT: "Payment",
};

export default function DashboardNotifications() {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter((notification) => {
    const matchesFilter =
      filter === "all" || (filter === "unread" && !notification.isRead);
    const matchesCategory =
      categoryFilter === "all" || notification.category === categoryFilter;
    const matchesSearch =
      searchQuery === "" ||
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesCategory && matchesSearch;
  });

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (id: string) => {
    await deleteNotification(id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl font-bold text-gray-900">
                Notifications
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Stay updated with your latest activities and messages
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto sm:flex-shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full sm:w-auto"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Mark all as read
                </button>
              )}
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 w-full sm:w-auto">
                {unreadCount} unread
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter toggles */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FunnelIcon className="h-4 w-4 mr-1" />
                Filters
              </button>

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "all" | "unread")}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="all">All notifications</option>
                <option value="unread">Unread only</option>
              </select>
            </div>
          </div>

          {/* Extended filters */}
          <Transition
            show={showFilters}
            enter="transition-all duration-200 ease-out"
            enterFrom="opacity-0 max-h-0"
            enterTo="opacity-100 max-h-96"
            leave="transition-all duration-200 ease-in"
            leaveFrom="opacity-100 max-h-96"
            leaveTo="opacity-0 max-h-0"
          >
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    categoryFilter === "all"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Categories
                </button>
                {Object.entries(categoryNames).map(([key, name]) => (
                  <button
                    key={key}
                    onClick={() => setCategoryFilter(key)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      categoryFilter === key
                        ? categoryColors[key as keyof typeof categoryColors]
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </Transition>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">
              Loading notifications...
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No notifications
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === "unread"
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredNotifications.map((notification, index) => (
              <Transition
                key={notification._id}
                appear
                show={true}
                enter="transition-all duration-300 ease-out"
                enterFrom="opacity-0 translate-y-4"
                enterTo="opacity-100 translate-y-0"
              >
                <li
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-blue-50/30" : ""
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start space-x-3">
                    {/* Notification icon/indicator */}
                    <div
                      className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        !notification.isRead ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${
                              !notification.isRead
                                ? "text-gray-900"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {notification.message}
                          </p>
                          <div className="mt-2 flex items-center space-x-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                categoryColors[
                                  notification.category as keyof typeof categoryColors
                                ]
                              }`}
                            >
                              {
                                categoryNames[
                                  notification.category as keyof typeof categoryNames
                                ]
                              }
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Mark as read"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleDeleteNotification(notification._id)
                            }
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete notification"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </Transition>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
