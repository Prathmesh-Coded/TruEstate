import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IAuthenticatedRequest, IJWTPayload } from "../types";

/**
 * JWT Authentication Middleware
 * Verifies JWT token from cookies and attaches user data to request
 */
export const authenticateToken = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(401).json({
        message: "Access denied. Please log in.",
        code: "NO_TOKEN",
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IJWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Token verification failed");

    // Clear invalid token
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        message: "Session expired. Please log in again.",
        code: "TOKEN_EXPIRED",
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        message: "Invalid session. Please log in again.",
        code: "INVALID_TOKEN",
      });
      return;
    }

    res.status(401).json({
      message: "Authentication failed. Please log in again.",
      code: "AUTH_FAILED",
    });
  }
};

/**
 * Generate JWT Token
 * @param payload - User data to encode in token
 * @returns JWT token string
 */
export const generateToken = (payload: IJWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
};

/**
 * Set secure cookie with JWT token
 * @param res - Express response object
 * @param token - JWT token to set in cookie
 */
export const setTokenCookie = (res: Response, token: string): void => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
};

/**
 * Clear authentication cookie
 * @param res - Express response object
 */
export const clearTokenCookie = (res: Response): void => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
};
