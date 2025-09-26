import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User"; // Corrected import name
import { IAuthenticatedRequest, ISignupRequest, ILoginRequest } from "../types";
import crypto from "crypto";

// ==================================
// Helper Function
// ==================================
/**
 * Generates a JWT, sets it as a secure cookie, and sends the final user response.
 */
const sendAuthResponse = (
  res: Response,
  user: any,
  statusCode: number,
  message: string,
  options?: { rememberMe?: boolean }
) => {
  const tokenPayload = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    authProvider: user.authProvider,
    role: user.role,
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    // 7 days if rememberMe, otherwise session cookie (no maxAge)
    ...(options?.rememberMe ? { maxAge: 7 * 24 * 60 * 60 * 1000 } : {}),
  });

  res.status(statusCode).json({
    message,
    user: {
      id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      authProvider: user.authProvider,
      isEmailVerified: user.isEmailVerified,
      role: user.role,
    },
  });
};

// ==================================
// Controllers
// ==================================

export const signup = async (
  req: Request<{}, {}, ISignupRequest>,
  res: Response
): Promise<Response | void> => {
  try {
    const { email, password, firstName, lastName } = req.body as any;
    const rememberMe = Boolean((req.body as any).rememberMe);

    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists" });
    }

    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      authProvider: "local",
    });
    await user.save();

    console.log("✅ New user registered successfully");
    sendAuthResponse(res, user, 201, "Account created successfully", {
      rememberMe,
    });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res
      .status(500)
      .json({ message: "Unable to create account. Please try again later." });
  }
};

export const login = async (
  req: Request<{}, {}, ILoginRequest>,
  res: Response
): Promise<Response | void> => {
  try {
    const { email, password } = req.body as any;
    const rememberMe = Boolean((req.body as any).rememberMe);

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.authProvider === "google" && !user.password) {
      return res
        .status(400)
        .json({ message: "Please sign in with Google for this account" });
    }

    await user.updateLastLogin();
    console.log("✅ User logged in successfully");

    sendAuthResponse(res, user, 200, "Login successful", { rememberMe });
  } catch (error) {
    console.error("❌ Login error:", error);
    res
      .status(500)
      .json({ message: "Unable to sign in. Please try again later." });
  }
};

export const logout = (req: Request, res: Response): void => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
    });
    if (req.session) {
      req.session.destroy((err) => {
        if (err) console.error("❌ Session destruction error:", err);
      });
    }
    console.log("✅ User logged out successfully");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("❌ Logout error:", error);
    res.status(500).json({ message: "Error during logout" });
  }
};

export const getCurrentUser = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const user = await User.findById(req.user!.id).select("-password").lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("❌ Get user profile error:", error);
    res.status(500).json({ message: "Unable to fetch user profile" });
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res
      .status(400)
      .json({ message: "Phone number and OTP are required." });
  }

  try {
    console.log(
      `✅ OTP ${otp} for ${phoneNumber} verified successfully (simulation).`
    );

    res
      .status(200)
      .json({ success: true, message: "OTP verified successfully." });
  } catch (error) {
    console.error("❌ OTP Verification Error:", error);
    res.status(500).json({ message: "Server error during OTP verification." });
  }
};

export const sendOtp = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const { phoneNumber, mode } = req.body as {
    phoneNumber?: string;
    mode?: "login" | "signup";
  };
  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required." });
  }
  try {
    if (mode === "login") {
      const user = await User.findOne({
        phoneNumber,
        authProvider: "phone",
      });
      if (!user) {
        return res.status(404).json({
          message: "No account found for this phone number. Please sign up.",
        });
      }
    } else if (mode === "signup") {
      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser) {
        return res
          .status(409)
          .json({ message: "This phone number is already registered." });
      }
    }
    console.log(`✅ OTP sent to ${phoneNumber} (simulation).`);
    return res.status(200).json({ success: true, message: "OTP sent." });
  } catch (error) {
    console.error("❌ Send OTP Error:", error);
    return res.status(500).json({ message: "Server error during OTP send." });
  }
};

export const completePhoneSignup = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { phoneNumber, firstName, lastName, rememberMe } = req.body as any;

    if (!phoneNumber || !firstName || !lastName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if phone number is already registered
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "This phone number is already registered." });
    }

    // Create phone user without email field
    const userData: any = {
      phoneNumber,
      firstName,
      lastName,
      authProvider: "phone",
      isEmailVerified: true,
    };

    // Explicitly do not set email field for phone users to avoid index issues
    const user = new User(userData);
    await user.save();

    sendAuthResponse(res, user, 201, "Account created successfully", {
      rememberMe: Boolean(rememberMe),
    });
  } catch (error) {
    console.error("❌ Complete phone signup error:", error);
    res.status(500).json({ message: "Server error during signup completion." });
  }
};

export const phoneLogin = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  try {
    const { phoneNumber, rememberMe } = req.body as {
      phoneNumber?: string;
      rememberMe?: boolean;
    };
    if (!phoneNumber) {
      return res
        .status(400)
        .json({ message: "Phone number is required for login." });
    }

    // Search by phone number only (clean approach)
    const user = await User.findOne({
      phoneNumber,
      authProvider: "phone",
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found for this phone number. Please sign up.",
      });
    }

    await user.updateLastLogin();
    console.log("✅ Phone user logged in successfully");
    sendAuthResponse(res, user, 200, "Login successful", {
      rememberMe: Boolean(rememberMe),
    });
  } catch (error) {
    console.error("❌ Phone login error:", error);
    res
      .status(500)
      .json({ message: "Unable to sign in. Please try again later." });
  }
};

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
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        authProvider: user.authProvider,
        role: (user as any).role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const returnTo = (req.session as any)?.returnTo || "http://localhost:5173";
    delete (req.session as any)?.returnTo;

    console.log("✅ Google OAuth completed successfully");
    res.redirect(`${returnTo}?auth=success`);
  } catch (error) {
    console.error("❌ Google callback error:", error);
    res.redirect("http://localhost:5173/auth?error=callback_failed");
  }
};

export const googleAuthFailure = (req: Request, res: Response): void => {
  console.log("❌ Google OAuth failed");
  res.redirect("http://localhost:5173/auth?error=google_auth_failed");
};

export const checkEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email address",
        exists: false,
      });
    }

    return res.status(200).json({
      message: "Email found",
      exists: true,
    });
  } catch (error) {
    console.error("❌ Check email error:", error);
    return res.status(500).json({ message: "Unable to verify email" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };

    // Validate email format and presence
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Log for security monitoring (production-appropriate)
      console.log(`🔐 Password reset attempt for non-existent email: ${email}`);
      return res.status(404).json({
        message:
          "No account found with this email address. Please check your email or create a new account.",
        exists: false,
      });
    }

    // User exists - generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save reset token to user
    (user as any).resetPasswordToken = token;
    (user as any).resetPasswordExpires = expires;
    await user.save();

    // Log for security monitoring (production-appropriate)
    console.log(`📝 Password reset token generated for: ${email}`);

    return res.status(200).json({
      message: "Password reset link has been sent to your email address",
      exists: true,
      // Show token only in development for testing
      ...(process.env.NODE_ENV !== "production" && {
        token,
        note: "Token shown for development only",
      }),
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return res.status(500).json({
      message:
        "Unable to process password reset request. Please try again later.",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body as {
      token?: string;
      password?: string;
    };
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    user.password = password;
    (user as any).resetPasswordToken = undefined;
    (user as any).resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    return res.status(500).json({ message: "Unable to reset password" });
  }
};

export const linkPhone = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const userId = req.user?.id;
    const { phoneNumber } = req.body as { phoneNumber?: string };

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Ensure phone number is not already taken by another user
    const existingWithPhone = await User.findOne({ phoneNumber });
    if (existingWithPhone && String(existingWithPhone._id) !== String(userId)) {
      return res
        .status(409)
        .json({ message: "This phone number is already in use." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.phoneNumber = phoneNumber;
    await user.save();

    // Return updated user (no need to reissue token here)
    return res.status(200).json({
      message: "Phone number linked successfully",
      user: {
        id: user._id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        firstName: (user as any).firstName,
        lastName: (user as any).lastName,
        authProvider: user.authProvider,
        isEmailVerified: user.isEmailVerified,
        role: (user as any).role,
      },
    });
  } catch (error) {
    console.error("❌ Link phone error:", error);
    return res
      .status(500)
      .json({ message: "Unable to link phone number. Please try again." });
  }
};

// ==================================
// Update Profile Controller
// ==================================
export const updateProfile = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { firstName, lastName, email, phoneNumber } = req.body;

    // Validation
    if (!firstName || firstName.trim().length < 2) {
      return res.status(400).json({
        message:
          "First name is required and must be at least 2 characters long",
      });
    }

    if (!lastName || lastName.trim().length < 2) {
      return res.status(400).json({
        message: "Last name is required and must be at least 2 characters long",
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    if (phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(phoneNumber)) {
      return res.status(400).json({
        message: "Please provide a valid phone number",
      });
    }

    // Get current user to check their auth provider
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validation based on auth provider
    if (currentUser.authProvider === "phone") {
      // Phone users can optionally add email, but phoneNumber is required
      if (!phoneNumber) {
        return res.status(400).json({
          message: "Phone number is required for phone-authenticated users",
        });
      }
    } else {
      // Email users require email
      if (!email) {
        return res.status(400).json({
          message: "Email is required for email-authenticated users",
        });
      }
    }

    // Check for duplicate email (if provided)
    if (email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: userId },
      });

      if (existingUser) {
        return res.status(400).json({
          message:
            "This email address is already associated with another account",
        });
      }
    }

    // Check for duplicate phone number (if provided)
    if (phoneNumber) {
      const existingPhoneUser = await User.findOne({
        phoneNumber: phoneNumber.trim(),
        _id: { $ne: userId },
      });

      if (existingPhoneUser) {
        return res.status(400).json({
          message:
            "This phone number is already associated with another account",
        });
      }
    }

    // Prepare update data
    const updateData: any = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };

    // Update email only if provided and not a phone-only user
    if (email && currentUser.authProvider !== "phone") {
      updateData.email = email.toLowerCase().trim();
    } else if (email && currentUser.authProvider === "phone") {
      // Phone users can have email as optional contact info
      updateData.email = email.toLowerCase().trim();
    }

    // Update phone number if provided
    if (phoneNumber) {
      updateData.phoneNumber = phoneNumber.trim();
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
      select: "-password -resetPasswordToken -resetPasswordExpires",
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        name: updatedUser.name,
        authProvider: updatedUser.authProvider,
        isEmailVerified: updatedUser.isEmailVerified,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("❌ Update profile error:", error);
    return res.status(500).json({
      message: "Unable to update profile. Please try again.",
    });
  }
};

// ==================================
// Get User Settings Controller
// ==================================
export const getUserSettings = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const userId = req.user?.id;
    console.log("🔍 getUserSettings called for userId:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found for id:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Return user settings or defaults
    const settings = user.settings || {
      emailNotifications: true,
      smsNotifications: false,
      propertyAlerts: true,
      marketingEmails: false,
      profileVisibility: "public",
      showPhoneNumber: false,
      showEmail: true,
    };

    console.log("✅ Returning settings for user:", userId, settings);
    res.json(settings);
  } catch (error) {
    console.error("❌ Get settings error:", error);
    return res.status(500).json({
      message: "Unable to fetch settings. Please try again.",
    });
  }
};

// ==================================
// Update User Settings Controller
// ==================================
export const updateUserSettings = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const userId = req.user?.id;
    console.log("🔍 updateUserSettings called for userId:", userId);
    console.log("📝 Request body:", req.body);

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found for id:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("📄 Current user settings:", user.settings);

    // Initialize settings if they don't exist
    if (!user.settings) {
      user.settings = {
        emailNotifications: true,
        smsNotifications: false,
        propertyAlerts: true,
        marketingEmails: false,
        profileVisibility: "public",
        showPhoneNumber: false,
        showEmail: true,
      };
    }

    // Update the settings by directly modifying the subdocument
    Object.keys(req.body).forEach((key) => {
      if (user.settings) {
        (user.settings as any)[key] = req.body[key];
      }
    });

    console.log("🔄 Updated settings:", user.settings);

    // Save the user document
    const savedUser = await user.save();

    if (!savedUser) {
      console.log("❌ User save failed for id:", userId);
      return res.status(500).json({ message: "Failed to save settings" });
    }

    console.log(
      "✅ Settings saved successfully for user:",
      userId,
      savedUser.settings
    );
    res.json({
      message: "Settings updated successfully",
      settings: savedUser.settings,
    });
  } catch (error) {
    console.error("❌ Update settings error:", error);
    return res.status(500).json({
      message: "Unable to update settings. Please try again.",
    });
  }
};

// ==================================
// Delete Account Controller
// ==================================
export const deleteAccount = async (
  req: IAuthenticatedRequest,
  res: Response
): Promise<Response | void> => {
  try {
    const userId = req.user?.id;
    console.log("🔍 deleteAccount called for userId:", userId);

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User not found for id:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("📄 Deleting user:", user.email || user.phoneNumber);

    // Here you could also delete related data like properties, notifications, etc.
    // For now, we'll just delete the user account
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      console.log("❌ Failed to delete user for id:", userId);
      return res.status(500).json({ message: "Failed to delete account" });
    }

    console.log("✅ User account deleted successfully:", userId);

    // Clear the authentication cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete account error:", error);
    return res.status(500).json({
      message: "Unable to delete account. Please try again.",
    });
  }
};
