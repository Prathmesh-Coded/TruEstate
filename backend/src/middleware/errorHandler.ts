import { Request, Response, NextFunction } from "express";

/**
 * Global Error Handler Middleware
 * Handles all unhandled errors in the application
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("❌ Unhandled error:", error);

  // Handle JSON parsing errors
  if (error.type === "entity.parse.failed") {
    res.status(400).json({
      message: "Invalid JSON in request body",
      code: "INVALID_JSON",
    });
    return;
  }

  // Handle CORS errors
  if (error.message === "Not allowed by CORS") {
    res.status(403).json({
      message: "CORS policy violation",
      code: "CORS_ERROR",
    });
    return;
  }

  // Handle MongoDB duplicate key errors
  if (error.code === 11000) {
    res.status(400).json({
      message: "Duplicate entry found",
      code: "DUPLICATE_ERROR",
    });
    return;
  }

  // Handle MongoDB validation errors
  if (error.name === "ValidationError" && error.errors) {
    const field = Object.keys(error.errors)[0];
    if (field && error.errors[field]) {
      res.status(400).json({
        message: error.errors[field]?.message || "Validation error",
        code: "VALIDATION_ERROR",
        field,
      });
      return;
    }
  }

  // Handle MongoDB cast errors
  if (error.name === "CastError") {
    res.status(400).json({
      message: "Invalid ID format",
      code: "INVALID_ID",
    });
    return;
  }

  // Default server error
  res.status(500).json({
    message: "Internal server error",
    code: "SERVER_ERROR",
  });
};

/**
 * 404 Not Found Handler
 * Handles requests to non-existent endpoints
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    message: "Endpoint not found",
    code: "NOT_FOUND",
    path: req.originalUrl,
  });
};
