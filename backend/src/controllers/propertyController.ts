import { Request, Response } from "express";
import { Property } from "../models/Property";
import { IAuthenticatedRequest } from "../types";
import { runAutoValidation } from "../utils/propertyValidation";
import {
  sendPropertySubmissionReceipt,
  sendPropertyRejected,
  sendPropertyApproved,
} from "../utils/messaging";
import { User } from "../models/User";
// @ts-ignore - JS module in TS project
import NotificationService from "../../services/notificationService";

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
