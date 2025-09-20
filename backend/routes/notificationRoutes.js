const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { authenticateToken } = require("../src/middleware/auth");

// Get user notifications with pagination and filtering
router.get("/", authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      category = null,
      type = null,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = { userId: req.user.id };

    if (unreadOnly === "true") {
      query.isRead = false;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (type && type !== "all") {
      query.type = type;
    }

    // Execute queries in parallel for better performance
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(), // Use lean() for better performance
      Notification.countDocuments(query),
      Notification.getUnreadCount(req.user.id),
    ]);

    res.json({
      success: true,
      notifications,
      total,
      unreadCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      hasNextPage: skip + notifications.length < total,
      hasPrevPage: parseInt(page) > 1,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get unread count only (lightweight endpoint)
router.get("/unread-count", authenticateToken, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user.id);

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
    });
  }
});

// Mark single notification as read
router.patch("/:id/read", authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (!notification.isRead) {
      await notification.markAsRead();
    }

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
});

// Mark all notifications as read
router.patch("/read-all", authenticateToken, async (req, res) => {
  try {
    const result = await Notification.markMultipleAsRead(req.user.id);

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
});

// Mark multiple specific notifications as read
router.patch("/read-multiple", authenticateToken, async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "notificationIds must be a non-empty array",
      });
    }

    const result = await Notification.markMultipleAsRead(
      req.user.id,
      notificationIds
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Mark multiple notifications as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
    });
  }
});

// Delete notification
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const result = await Notification.deleteOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
});

// Delete multiple notifications
router.delete("/bulk", authenticateToken, async (req, res) => {
  try {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "notificationIds must be a non-empty array",
      });
    }

    const result = await Notification.deleteMany({
      _id: { $in: notificationIds },
      userId: req.user.id,
    });

    res.json({
      success: true,
      message: `${result.deletedCount} notifications deleted`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Bulk delete notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notifications",
    });
  }
});

// Get notification preferences (placeholder - you can extend this)
router.get("/preferences", authenticateToken, async (req, res) => {
  try {
    // This could be stored in user model or separate preferences collection
    const defaultPreferences = {
      email: true,
      push: true,
      sms: false,
      categories: {
        PROPERTY_VERIFICATION: true,
        PROPERTY_APPROVAL: true,
        MESSAGE: true,
        SYSTEM: true,
        PAYMENT: true,
      },
    };

    res.json({
      success: true,
      preferences: defaultPreferences,
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch preferences",
    });
  }
});

// Update notification preferences (placeholder - you can extend this)
router.patch("/preferences", authenticateToken, async (req, res) => {
  try {
    const { email, push, sms, categories } = req.body;

    // Here you would update user preferences in database
    // For now, we'll just return success

    res.json({
      success: true,
      message: "Preferences updated successfully",
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update preferences",
    });
  }
});

// Get notification statistics (admin or user insights)
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] } },
          byCategory: {
            $push: {
              category: "$category",
              type: "$type",
              isRead: "$isRead",
            },
          },
        },
      },
    ]);

    const result = stats[0] || { total: 0, unread: 0, byCategory: [] };

    // Process category stats
    const categoryStats = {};
    result.byCategory.forEach((item) => {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = { total: 0, unread: 0 };
      }
      categoryStats[item.category].total++;
      if (!item.isRead) {
        categoryStats[item.category].unread++;
      }
    });

    res.json({
      success: true,
      stats: {
        total: result.total,
        unread: result.unread,
        read: result.total - result.unread,
        categoryStats,
      },
    });
  } catch (error) {
    console.error("Get notification stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification statistics",
    });
  }
});

module.exports = router;
