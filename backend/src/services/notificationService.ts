import Notification, {
  INotification,
  NotificationType,
  NotificationCategory,
} from "../models/Notification";
import mongoose from "mongoose";

export type PropertyAction = "APPROVE" | "REJECT";

class NotificationService {
  // Create a property approval/rejection notification
  static async createPropertyApprovalNotification(
    propertyId: mongoose.Types.ObjectId | string,
    userId: mongoose.Types.ObjectId | string,
    action: PropertyAction,
    adminId: mongoose.Types.ObjectId | string,
    reason: string | null = null
  ): Promise<INotification> {
    try {
      let message: string, title: string;

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
        type: (action === "APPROVE"
          ? "SUCCESS"
          : "WARNING") as NotificationType,
        category: "PROPERTY_APPROVAL" as NotificationCategory,
        title,
        message,
        metadata: {
          propertyId:
            typeof propertyId === "string"
              ? new mongoose.Types.ObjectId(propertyId)
              : propertyId,
          adminId:
            typeof adminId === "string"
              ? new mongoose.Types.ObjectId(adminId)
              : adminId,
          reason,
          additionalData: { action },
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

  // Create a property verification notification
  static async createPropertyVerificationNotification(
    propertyId: mongoose.Types.ObjectId | string,
    userId: mongoose.Types.ObjectId | string,
    status: string,
    reason?: string
  ): Promise<INotification> {
    try {
      let message: string, title: string, type: NotificationType;

      switch (status) {
        case "AUTO_VALID":
        case "APPROVED":
          title = "Property Verified";
          message = "Your property has been successfully verified!";
          type = "SUCCESS";
          break;
        case "AUTO_INVALID":
        case "REJECTED":
          title = "Property Verification Failed";
          message = reason
            ? `Property verification failed. Reason: ${reason}`
            : "Your property verification failed. Please review and resubmit.";
          type = "ERROR";
          break;
        case "FLAGGED":
          title = "Property Under Review";
          message = "Your property is being reviewed by our team.";
          type = "INFO";
          break;
        case "PENDING_AUTO":
        default:
          title = "Property Submitted";
          message = "Your property has been submitted for verification.";
          type = "INFO";
          break;
      }

      const notification = new Notification({
        userId,
        type,
        category: "PROPERTY_VERIFICATION" as NotificationCategory,
        title,
        message,
        metadata: {
          propertyId:
            typeof propertyId === "string"
              ? new mongoose.Types.ObjectId(propertyId)
              : propertyId,
          newStatus: status,
          reason,
        },
        isRead: false,
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error(
        "Error creating property verification notification:",
        error
      );
      throw error;
    }
  }

  // Create a general message notification
  static async createMessageNotification(
    userId: mongoose.Types.ObjectId | string,
    title: string,
    message: string,
    category: NotificationCategory = "MESSAGE"
  ): Promise<INotification> {
    try {
      const notification = new Notification({
        userId,
        type: "INFO" as NotificationType,
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
  static async getUserNotifications(
    userId: mongoose.Types.ObjectId | string,
    limit: number = 20,
    offset: number = 0
  ): Promise<INotification[]> {
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
  static async markAsRead(
    notificationId: mongoose.Types.ObjectId | string,
    userId: mongoose.Types.ObjectId | string
  ): Promise<INotification | null> {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(
    userId: mongoose.Types.ObjectId | string
  ): Promise<boolean> {
    try {
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );

      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // Get unread count for a user
  static async getUnreadCount(
    userId: mongoose.Types.ObjectId | string
  ): Promise<number> {
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
  static async deleteNotification(
    notificationId: mongoose.Types.ObjectId | string,
    userId: mongoose.Types.ObjectId | string
  ): Promise<boolean> {
    try {
      await Notification.findOneAndDelete({ _id: notificationId, userId });
      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  // Cleanup old notifications (called by cron job or scheduled task)
  static async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
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

export default NotificationService;
