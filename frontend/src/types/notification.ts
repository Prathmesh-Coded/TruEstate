export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  isRead: boolean;
  metadata?: {
    propertyId?: string;
    messageId?: string;
    actionUrl?: string;
    adminId?: string;
    originalStatus?: string;
    newStatus?: string;
    reason?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export const NotificationType = {
  SUCCESS: "SUCCESS",
  INFO: "INFO",
  WARNING: "WARNING",
  ERROR: "ERROR",
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const NotificationCategory = {
  PROPERTY_VERIFICATION: "PROPERTY_VERIFICATION",
  PROPERTY_APPROVAL: "PROPERTY_APPROVAL",
  MESSAGE: "MESSAGE",
  SYSTEM: "SYSTEM",
  PAYMENT: "PAYMENT",
} as const;

export type NotificationCategory =
  (typeof NotificationCategory)[keyof typeof NotificationCategory];

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: Record<NotificationCategory, boolean>;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  toasts: Toast[];
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  refreshUnreadCount: () => Promise<void>;
}
