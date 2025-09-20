const Notification = require("../models/Notification");

class NotificationService {
  // Create a property approval/rejection notification
  static async createPropertyApprovalNotification(
    propertyId,
    userId,
    action,
    adminId,
    reason = null
  ) {
    try {
      let message, title;

      if (action === "APPROVE") {
        title = "Property Approved";
        message = "Your property listing has been approved and is now live!";
      } else {
        title = "Property Rejected";
        message = reason
          ? `Your property listing was rejected. Reason: ${reason}`
          : "Your property listing was rejected. Please contact support for more details.";
      }

      const notification = new Notification({
        userId,
        type: action === "APPROVE" ? "SUCCESS" : "WARNING",
        category: "PROPERTY_APPROVAL",
        title,
        message,
        metadata: {
          propertyId,
          action,
          adminId,
          reason,
        },
        isRead: false,
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error("Error creating property approval notification:", error);
      throw error;
    }
  }

  // Create a general message notification
  static async createMessageNotification(
    userId,
    title,
    message,
    category = "MESSAGE"
  ) {
    try {
      const notification = new Notification({
        userId,
        type: "INFO",
        category,
        title,
        message,
        isRead: false,
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error("Error creating message notification:", error);
      throw error;
    }
  }

  // Get notifications for a user
  static async getUserNotifications(userId, limit = 20, offset = 0) {
    try {
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .lean();

      return notifications;
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // Get unread count for a user
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        userId,
        isRead: false,
      });

      return count;
    } catch (error) {
      console.error("Error getting unread count:", error);
      throw error;
    }
  }

  // Delete a notification
  static async deleteNotification(notificationId, userId) {
    try {
      await Notification.findOneAndDelete({ _id: notificationId, userId });
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  // Cleanup old notifications (called by cron job or scheduled task)
  static async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        createdAt: { $lt: cutoffDate },
      });

      console.log(`Cleaned up ${result.deletedCount} old notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error("Error cleaning up old notifications:", error);
      throw error;
    }
  }
}

module.exports = NotificationService;
