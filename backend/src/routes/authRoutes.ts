import { Router, Request, Response, NextFunction } from "express";
import passport from "passport";
import { authenticateToken } from "../middleware/auth";
import {
  signup,
  login,
  logout,
  getCurrentUser,
  googleAuthSuccess,
  googleAuthFailure,
} from "../controllers/authController";

const router = Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post("/signup", signup);

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email and password
 * @access  Public
 */
router.post("/login", login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear session
 * @access  Private
 */
router.post("/logout", logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", authenticateToken as any, getCurrentUser as any);

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth authentication
 * @access  Public
 */
router.get(
  "/google",
  (req: Request, res: Response, next: NextFunction) => {
    // Store the original URL for redirect after auth
    (req.session as any).returnTo =
      req.query.returnTo || "http://localhost:5173";
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Handle Google OAuth callback
 * @access  Public
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/failure",
  }),
  googleAuthSuccess
);

/**
 * @route   GET /api/auth/google/failure
 * @desc    Handle Google OAuth failure
 * @access  Public
 */
router.get("/google/failure", googleAuthFailure);

export default router;
