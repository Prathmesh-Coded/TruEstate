import { Request, Response } from "express";
import { Property } from "../models/Property";
import { User } from "../models/User";
import { IAuthenticatedRequest } from "../types";
import { runAutoValidation } from "../utils/propertyValidation";
import {
  sendPropertySubmissionReceipt,
  sendPropertyRejected,
  sendPropertyApproved,
} from "../utils/messaging";
// @ts-ignore - JS module in TS project
import NotificationService from "../services/notificationService";

// POST /api/properties (user)
export const createProperty = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const ownerId = req.user.id;
    const payload = req.body as any;

    const property = new Property({
      ...payload,
      owner: ownerId,
      photos: [], // later integrate upload
      documents: {},
      verification: {
        status: "PENDING_AUTO",
        autoCheckRun: false,
        reasons: [],
      },
    });

    await property.save();

    // Send receipt message (if user has phone)
    const owner = await User.findById(ownerId).lean();
    if (owner?.phoneNumber) {
      sendPropertySubmissionReceipt({
        to: owner.phoneNumber,
        title: property.title,
      }).catch(() => {});
    }

    // Create initial notification
    try {
      await NotificationService.createPropertyVerificationNotification(
        (property as any)._id.toString(),
        ownerId,
        "PENDING_AUTO"
      );
    } catch (notifError) {
      console.error("Failed to create submission notification:", notifError);
    }

    // Run auto-validation asynchronously but respond with pending state
    setImmediate(async () => {
      try {
        const validation = runAutoValidation(property.toObject() as any);
        if (validation.outcome === "VALID") {
          property.verification.status = "AUTO_VALID";
        } else if (validation.outcome === "INVALID") {
          property.verification.status = "AUTO_INVALID";
        } else {
          property.verification.status = "FLAGGED";
        }
        property.verification.autoCheckRun = true;
        property.verification.autoScore = validation.score;
        property.verification.reasons = validation.reasons;
        await property.save();

        // Notify user based on outcome
        if (owner?.phoneNumber) {
          if (property.verification.status === "AUTO_INVALID") {
            const errors = validation.reasons
              .filter((r) => r.type === "ERROR")
              .map((r) => `${r.field}: ${r.message}`);
            sendPropertyRejected({
              to: owner.phoneNumber,
              title: property.title,
              reasons: errors,
            }).catch(() => {});
          }
        }

        // Create verification notification
        try {
          await NotificationService.createPropertyVerificationNotification(
            (property as any)._id.toString(),
            ownerId,
            property.verification.status
          );
        } catch (notifError) {
          console.error(
            "Failed to create verification notification:",
            notifError
          );
        }
      } catch (e) {
        console.error("Auto-validation task failed", e);
      }
    });

    return res.status(201).json({
      message: "Property submitted. Auto-validation in progress.",
      propertyId: property._id,
      verification: property.verification,
    });
  } catch (error) {
    console.error("Create property error", error);
    return res.status(500).json({ message: "Failed to create property" });
  }
};

// GET /api/admin/properties?status=FLAGGED,PENDING_AUTO
export const listPropertiesForAdmin = async (req: Request, res: Response) => {
  try {
    const statusParam = (req.query.status as string) || "";
    const statuses = statusParam.split(",").filter(Boolean);

    const query: any = {};
    if (statuses.length) {
      query["verification.status"] = { $in: statuses };
    }

    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return res.json({ properties });
  } catch (error) {
    console.error("List properties admin error", error);
    return res.status(500).json({ message: "Failed to fetch properties" });
  }
};

// PATCH /api/admin/properties/:id { action: APPROVE|REJECT }
export const updatePropertyStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body as { action?: string; reason?: string };

    const property = await Property.findById(id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    if (action === "APPROVE") {
      property.verification.status = "APPROVED";
      property.verification.decidedAt = new Date();
      property.verification.decidedBy = (req as any).user?.id;
      await property.save();

      // Notify owner via SMS
      const owner = await User.findById(property.owner).lean();
      if (owner?.phoneNumber) {
        sendPropertyApproved({
          to: owner.phoneNumber,
          title: property.title,
        }).catch(() => {});
      }

      // Create notification
      try {
        await NotificationService.createPropertyApprovalNotification(
          (property as any)._id.toString(),
          property.owner.toString(),
          "APPROVE",
          (req as any).user?.id
        );
      } catch (notifError) {
        console.error("Failed to create approval notification:", notifError);
      }
      return res.json({
        message: "Property approved",
        status: property.verification.status,
      });
    }

    if (action === "REJECT") {
      property.verification.status = "REJECTED";
      property.verification.decidedAt = new Date();
      property.verification.decidedBy = (req as any).user?.id;
      if (req.body.reason) {
        property.verification.reasons.push({
          type: "ERROR",
          field: "manual",
          message: req.body.reason,
        });
      }
      await property.save();

      const owner = await User.findById(property.owner).lean();
      if (owner?.phoneNumber) {
        const reasons = property.verification.reasons
          .filter((r) => r.type === "ERROR")
          .map((r) => `${r.field}: ${r.message}`);
        sendPropertyRejected({
          to: owner.phoneNumber,
          title: property.title,
          reasons,
        }).catch(() => {});
      }

      // Create notification
      try {
        await NotificationService.createPropertyApprovalNotification(
          (property as any)._id.toString(),
          property.owner.toString(),
          "REJECT",
          (req as any).user?.id,
          req.body.reason
        );
      } catch (notifError) {
        console.error("Failed to create rejection notification:", notifError);
      }
      return res.json({
        message: "Property rejected",
        status: property.verification.status,
      });
    }

    return res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    console.error("Update property status error", error);
    return res
      .status(500)
      .json({ message: "Failed to update property status" });
  }
};

// GET /api/properties/my-properties - Get user's own properties
export const getUserProperties = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    console.log("🔍 getUserProperties called for userId:", req.user?.id);

    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const properties = await Property.find({ owner: req.user.id })
      .populate("owner", "name phone email")
      .sort({ createdAt: -1 });

    console.log(
      "📋 Found properties for user:",
      req.user.id,
      "Count:",
      properties.length
    );

    // Transform the properties to match frontend interface
    const transformedProperties = properties.map((prop: any) => ({
      _id: prop._id,
      title: prop.title,
      description: prop.description,
      price: prop.price,
      location: {
        address: prop.address?.street || "",
        city: prop.address?.city || "",
        state: prop.address?.state || "",
        zipCode: prop.address?.pincode || "",
      },
      type: prop.propertyType || "apartment", // Map propertyType to type
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      area: prop.floors || 1, // Map floors to area for now
      images: prop.photos || [], // Map photos to images
      amenities: [], // Default empty array
      status: (() => {
        const verificationStatus = prop.verification?.status;
        switch (verificationStatus) {
          case "AUTO_VALID":
          case "APPROVED":
            return "active";
          case "AUTO_INVALID":
            return "inactive";
          case "REJECTED":
            return "rejected";
          case "PENDING_AUTO":
          case "FLAGGED":
          default:
            return "under-verification";
        }
      })(),
      owner: {
        _id: prop.owner._id,
        name: prop.owner.name || "User",
        phone: prop.owner.phone,
        email: prop.owner.email,
      },
      views: prop.views || 0,
      likes: prop.likes || 0,
      createdAt: prop.createdAt,
      updatedAt: prop.updatedAt,
    }));

    console.log(
      "� Transformed properties:",
      JSON.stringify(transformedProperties, null, 2)
    );

    return res.json({
      success: true,
      properties: transformedProperties,
    });
  } catch (error) {
    console.error("Get user properties error:", error);
    return res.status(500).json({ message: "Failed to fetch properties" });
  }
};

// GET /api/properties/saved - Get user's saved/liked properties
export const getSavedProperties = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(req.user.id).populate({
      path: "savedProperties",
      populate: {
        path: "owner",
        select: "name phone email",
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const savedProperties = ((user as any).savedProperties || []).map(
      (property: any) => ({
        _id: `saved_${property._id}`,
        property,
        savedAt: new Date(),
      })
    );

    return res.json({
      success: true,
      savedProperties,
    });
  } catch (error) {
    console.error("Get saved properties error:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch saved properties" });
  }
};

// POST /api/properties/:id/save - Save a property
export const saveProperty = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const propertyId = req.params.id;
    const userId = req.user.id;

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Add property to user's saved properties
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { savedProperties: propertyId } },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Property saved successfully",
    });
  } catch (error) {
    console.error("Save property error:", error);
    return res.status(500).json({ message: "Failed to save property" });
  }
};

// DELETE /api/properties/:id/unsave - Unsave a property
export const unsaveProperty = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const propertyId = req.params.id;
    const userId = req.user.id;

    // Remove property from user's saved properties
    await User.findByIdAndUpdate(
      userId,
      { $pull: { savedProperties: propertyId } },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Property removed from saved list",
    });
  } catch (error) {
    console.error("Unsave property error:", error);
    return res.status(500).json({ message: "Failed to unsave property" });
  }
};

// GET /api/dashboard/stats - Get dashboard statistics
export const getDashboardStats = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userId = req.user.id;

    // Get total properties count
    const totalProperties = await Property.countDocuments({ owner: userId });

    // Get total views (sum of all property views)
    const viewsResult = await Property.aggregate([
      { $match: { owner: userId } },
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);
    const totalViews = viewsResult[0]?.totalViews || 0;

    // Get saved properties count
    const user = await User.findById(userId).select("savedProperties");
    const savedProperties = (user as any)?.savedProperties?.length || 0;

    return res.json({
      success: true,
      totalProperties,
      totalViews,
      savedProperties,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};
