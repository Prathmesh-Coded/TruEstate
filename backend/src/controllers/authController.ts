import { Request, Response } from "express";
import { User } from "../models/User";
import {
  generateToken,
  setTokenCookie,
  clearTokenCookie,
} from "../middleware/auth";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateFirstName,
  validateLastName,
  normalizeEmail,
  sanitizeInput,
} from "../utils/validation";
import {
  IAuthenticatedRequest,
  ISignupRequest,
  ILoginRequest,
  IAuthResponse,
  IErrorResponse,
} from "../types";

/**
 * User Signup Controller
 * Creates a new user account with email and password
 */
export const signup = async (
  req: Request<{}, IAuthResponse | IErrorResponse, ISignupRequest>,
  res: Response
): Promise<void> => {
  try {
    const { email, password, firstName, lastName, name } = req.body;

    // Input validation
    if (!email || !validateEmail(email)) {
      res.status(400).json({
        message: "Please provide a valid email address",
        field: "email",
      });
      return;
    }

    if (!validatePassword(password)) {
      res.status(400).json({
        message: "Password must be between 6 and 128 characters long",
        field: "password",
      });
      return;
    }

    // Validate firstName and lastName (required for email signup)
    if (!firstName || !validateFirstName(firstName)) {
      res.status(400).json({
        message:
          "First name is required and must be between 1 and 50 characters",
        field: "firstName",
      });
      return;
    }

    if (!lastName || !validateLastName(lastName)) {
      res.status(400).json({
        message:
          "Last name is required and must be between 1 and 50 characters",
        field: "lastName",
      });
      return;
    }

    if (name && !validateName(name)) {
      res.status(400).json({
        message: "Name must be between 1 and 100 characters",
        field: "name",
      });
      return;
    }

    const normalizedEmail = normalizeEmail(email);

    // Check if user already exists
    const existingUser = await User.findByEmail(normalizedEmail);
    if (existingUser) {
      if (existingUser.authProvider === "google") {
        res.status(400).json({
          message:
            "An account with this email already exists. Please sign in with Google.",
          suggestGoogleLogin: true,
        });
        return;
      }
      res.status(400).json({
        message: "An account with this email already exists",
        field: "email",
      });
      return;
    }

    // Create new user (password will be hashed by pre-save middleware)
    const user = new User({
      email: normalizedEmail,
      password,
      firstName: sanitizeInput(firstName),
      lastName: sanitizeInput(lastName),
      name: name ? sanitizeInput(name) : `${firstName} ${lastName}`, // Fallback to combined name
      authProvider: "local",
    });

    await user.save();

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      authProvider: user.authProvider,
    });

    // Set secure cookie
    setTokenCookie(res, token);

    console.log("✅ New user registered successfully");

    res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("❌ Signup error:", error);

    if ((error as any).code === 11000) {
      res.status(400).json({
        message: "An account with this email already exists",
        field: "email",
      });
      return;
    }

    if ((error as any).name === "ValidationError") {
      const field = Object.keys((error as any).errors)[0];
      if (field && (error as any).errors[field]) {
        res.status(400).json({
          message: (error as any).errors[field].message,
          field,
        });
        return;
      }
    }

    res.status(500).json({
      message: "Unable to create account. Please try again later.",
    });
  }
};

/**
 * User Login Controller
 * Authenticates user with email and password
 */
export const login = async (
  req: Request<{}, IAuthResponse | IErrorResponse, ILoginRequest>,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !validateEmail(email)) {
      res.status(400).json({
        message: "Please provide a valid email address",
        field: "email",
      });
      return;
    }

    if (!password || typeof password !== "string") {
      res.status(400).json({
        message: "Password is required",
        field: "password",
      });
      return;
    }

    const normalizedEmail = normalizeEmail(email);

    // Find user
    const user = await User.findByEmail(normalizedEmail);
    if (!user) {
      res.status(400).json({
        message: "Invalid email or password",
      });
      return;
    }

    // Check if user signed up with Google
    if (user.authProvider === "google" && !user.password) {
      res.status(400).json({
        message: "Please sign in with Google for this account",
        suggestGoogleLogin: true,
      });
      return;
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({
        message: "Invalid email or password",
      });
      return;
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      authProvider: user.authProvider,
    });

    // Set secure cookie
    setTokenCookie(res, token);

    console.log("✅ User logged in successfully");

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      message: "Unable to sign in. Please try again later.",
    });
  }
};

/**
 * User Logout Controller
 * Clears authentication cookie and destroys session
 */
export const logout = (req: Request, res: Response): void => {
  try {
    // Clear JWT cookie
    clearTokenCookie(res);

    // Destroy session if it exists
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("❌ Session destruction error:", err);
        }
      });
    }

    console.log("✅ User logged out successfully");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("❌ Logout error:", error);
    res.status(500).json({ message: "Error during logout" });
  }
};

/**
 * Get Current User Controller
 * Returns current authenticated user's profile
 */
export const getCurrentUser = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select("-password").lean();

    if (!user) {
      res.status(404).json({
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
      return;
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Get user profile error:", error);
    res.status(500).json({
      message: "Unable to fetch user profile",
      code: "SERVER_ERROR",
    });
  }
};

/**
 * Google OAuth Success Handler
 * Handles successful Google OAuth authentication
 */
export const googleAuthSuccess = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      console.error("❌ No user in Google callback");
      res.redirect("http://localhost:5173/auth?error=auth_failed");
      return;
    }

    const user = req.user as any;

    // Generate JWT token
    const token = generateToken({
      id: user._id,
      email: user.email,
      name: user.name,
      authProvider: user.authProvider,
    });

    // Set secure cookie
    setTokenCookie(res, token);

    // Get return URL from session or default
    const returnTo = (req.session as any)?.returnTo || "http://localhost:5173";
    delete (req.session as any)?.returnTo;

    console.log("✅ Google OAuth completed successfully");

    // Redirect to frontend with success indicator
    res.redirect(`${returnTo}?auth=success`);
  } catch (error) {
    console.error("❌ Google callback error:", error);
    res.redirect("http://localhost:5173/auth?error=callback_failed");
  }
};

/**
 * Google OAuth Failure Handler
 * Handles failed Google OAuth authentication
 */
export const googleAuthFailure = (req: Request, res: Response): void => {
  console.log("❌ Google OAuth failed");
  res.redirect("http://localhost:5173/auth?error=google_auth_failed");
};
