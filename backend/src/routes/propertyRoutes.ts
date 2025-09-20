import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { createProperty } from "../controllers/propertyController";

const router = Router();

// Cast middleware to any to satisfy type mismatch between custom request typing and express Request.
// Simple ping to confirm the route group is mounted (not auth protected for easier debugging)
router.get("/ping", (_req, res) => {
  res.json({ message: "Property routes alive" });
});

router.post("/", authenticateToken as any, createProperty as any);

export default router;
