const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxLength: 1000,
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
      messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
      actionUrl: String,
      adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      originalStatus: String,
      newStatus: String,
      reason: String,
      // Additional flexible metadata
      additionalData: mongoose.Schema.Types.Mixed,
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
notificationSchema.statics.createNotification = async function (data) {
  try {
    const notification = new this(data);
    await notification.save();

    // Here you can add real-time notification logic
    // For example, emit socket event or push notification
    console.log(`Notification created for user ${data.userId}: ${data.title}`);

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Get unread count for a user
notificationSchema.statics.getUnreadCount = async function (userId) {
  return await this.countDocuments({ userId, isRead: false });
};

// Mark multiple notifications as read
notificationSchema.statics.markMultipleAsRead = async function (
  userId,
  notificationIds = null
) {
  const query = { userId, isRead: false };
  if (notificationIds) {
    query._id = { $in: notificationIds };
  }

  return await this.updateMany(query, { isRead: true });
};

// Instance methods
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  return this.save();
};

// Pre-save middleware
notificationSchema.pre("save", function (next) {
  // Ensure metadata exists
  if (!this.metadata) {
    this.metadata = {};
  }
  next();
});

// Virtual for formatted creation time
notificationSchema.virtual("timeAgo").get(function () {
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

module.exports = mongoose.model("Notification", notificationSchema);
