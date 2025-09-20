import { Request } from "express";
import { Document } from "mongoose";

// User Interface
export interface IUser extends Document {
  _id: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  googleId?: string;
  firstName: string;
  lastName: string;
  name: string;
  avatar?: string;
  authProvider: "local" | "google" | "phone";
  isEmailVerified: boolean;
  lastLogin: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastLogin(): Promise<void>;
}

// JWT Payload Interface
export interface IJWTPayload {
  id: string;
  email: string;
  phoneNumber?: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  name?: string | undefined;
  authProvider: string;
}

// Authenticated Request Interface
export interface IAuthenticatedRequest extends Request {
  user?: IJWTPayload;
}

// Auth Response Interface
export interface IAuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    phoneNumber?: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    name?: string | undefined;
    authProvider: string;
    isEmailVerified: boolean;
    role?: string;
  };
}

// Error Response Interface
export interface IErrorResponse {
  message: string;
  code?: string;
  field?: string;
  suggestGoogleLogin?: boolean;
}

// Signup Request Interface
export interface ISignupRequest {
  email: string;
  password: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  name?: string | undefined;
}

// Login Request Interface
export interface ILoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}
