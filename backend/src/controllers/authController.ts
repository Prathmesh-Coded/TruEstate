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
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required." });
  }
  try {
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

    const email = `${phoneNumber}@phone.user`;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "This phone number is already registered." });
    }

    const user = new User({
      email,
      phoneNumber,
      firstName,
      lastName,
      authProvider: "phone",
      isEmailVerified: true,
    });
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

    const email = `${phoneNumber}@phone.user`;
    const user = await User.findOne({ email });
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

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // To prevent user enumeration, return success
      return res
        .status(200)
        .json({ message: "If the email exists, a reset link has been sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    (user as any).resetPasswordToken = token;
    (user as any).resetPasswordExpires = expires;
    await user.save();

    // In production, email the reset link. For now, return token for dev.
    return res.status(200).json({ message: "Reset link generated", token });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return res.status(500).json({ message: "Unable to process request" });
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
