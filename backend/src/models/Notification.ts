import mongoose, { Schema, Document, Model } from "mongoose";

export type NotificationType = "SUCCESS" | "INFO" | "WARNING" | "ERROR";
export type NotificationCategory =
  | "PROPERTY_VERIFICATION"
  | "PROPERTY_APPROVAL"
  | "MESSAGE"
  | "SYSTEM"
  | "PAYMENT";

export interface INotificationMetadata {
  propertyId?: mongoose.Types.ObjectId;
  messageId?: mongoose.Types.ObjectId;
  actionUrl?: string;
  adminId?: mongoose.Types.ObjectId;
  originalStatus?: string;
  newStatus?: string;
  reason?: string;
  additionalData?: any;
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  isRead: boolean;
  metadata: INotificationMetadata;
  createdAt: Date;
  updatedAt: Date;
  timeAgo: string; // virtual
  markAsRead(): Promise<INotification>;
}

// Interface for static methods
export interface INotificationModel extends Model<INotification> {
  createNotification(data: any): Promise<INotification>;
  getUnreadCount(userId: any): Promise<number>;
  markMultipleAsRead(userId: any, notificationIds?: any[]): Promise<any>;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ["SUCCESS", "INFO", "WARNING", "ERROR"],
      default: "INFO",
    },
    category: {
      type: String,
      enum: [
        "PROPERTY_VERIFICATION",
        "PROPERTY_APPROVAL",
        "MESSAGE",
        "SYSTEM",
        "PAYMENT",
      ],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      propertyId: {
        type: Schema.Types.ObjectId,
        ref: "Property",
      },
      messageId: {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
      actionUrl: String,
      adminId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      originalStatus: String,
      newStatus: String,
      reason: String,
      // Additional flexible metadata
      additionalData: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, category: 1 });
notificationSchema.index({ userId: 1, type: 1 });

// TTL index to auto-delete old notifications after 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

// Static methods
notificationSchema.statics.createNotification = async function (data: any) {
  try {
    const notification = new this(data);
    await notification.save();

    console.log(`Notification created for user ${data.userId}: ${data.title}`);
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

notificationSchema.statics.getUnreadCount = async function (userId: any) {
  return await this.countDocuments({ userId, isRead: false });
};

notificationSchema.statics.markMultipleAsRead = async function (
  userId: any,
  notificationIds?: any[]
) {
  const query: any = { userId, isRead: false };
  if (notificationIds) {
    query._id = { $in: notificationIds };
  }
  return await this.updateMany(query, { isRead: true });
};

// Instance methods
notificationSchema.methods.markAsRead = function (this: INotification) {
  this.isRead = true;
  return this.save();
};

// Pre-save middleware
notificationSchema.pre<INotification>("save", function (next) {
  if (!this.metadata) {
    this.metadata = {};
  }
  next();
});

// Virtual for formatted creation time
notificationSchema.virtual("timeAgo").get(function (this: INotification) {
  const now = new Date();
  const diffMs = now.getTime() - this.createdAt.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
});

// Ensure virtual fields are serialized
notificationSchema.set("toJSON", { virtuals: true });

const Notification = mongoose.model<INotification, INotificationModel>(
  "Notification",
  notificationSchema
);

export default Notification;
