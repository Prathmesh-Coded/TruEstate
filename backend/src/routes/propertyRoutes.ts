import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  createProperty,
  getUserProperties,
  getSavedProperties,
  saveProperty,
  unsaveProperty,
  getDashboardStats,
} from "../controllers/propertyController";

const router = Router();

// Cast middleware to any to satisfy type mismatch between custom request typing and express Request.
// Simple ping to confirm the route group is mounted (not auth protected for easier debugging)
router.get("/ping", (_req, res) => {
  res.json({ message: "Property routes alive" });
});

// Test route for debugging authentication
router.get("/test-auth", authenticateToken as any, (req: any, res) => {
  res.json({
    message: "Authentication working",
    userId: req.user?.id,
    user: req.user,
  });
});

// Property CRUD operations
router.post("/", authenticateToken as any, createProperty as any);

// Dashboard and user property routes
router.get(
  "/my-properties",
  authenticateToken as any,
  getUserProperties as any
);
router.get("/saved", authenticateToken as any, getSavedProperties as any);

// Save/unsave property routes
router.post("/:id/save", authenticateToken as any, saveProperty as any);
router.delete("/:id/unsave", authenticateToken as any, unsaveProperty as any);

export default router;
