import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { IUser } from "../types";

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: function (this: IUser) {
        // Email is required only for local and google auth providers
        return this.authProvider === "local" || this.authProvider === "google";
      },
      sparse: true, // Allow null values for phone users
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      minlength: 6,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    phoneNumber: {
      type: String,
      trim: true,
      sparse: true,
    },
    avatar: {
      type: String,
      validate: {
        validator: function (v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Avatar must be a valid URL",
      },
    },
    authProvider: {
      type: String,
      enum: ["local", "google", "phone"],
      default: "local",
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: {
      type: String,
      index: true,
    },
    resetPasswordExpires: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true,
    },
    savedProperties: [
      {
        type: Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    settings: {
      type: {
        emailNotifications: {
          type: Boolean,
          default: true,
        },
        smsNotifications: {
          type: Boolean,
          default: false,
        },
        propertyAlerts: {
          type: Boolean,
          default: true,
        },
        marketingEmails: {
          type: Boolean,
          default: false,
        },
        profileVisibility: {
          type: String,
          enum: ["public", "private", "contacts-only"],
          default: "public",
        },
        showPhoneNumber: {
          type: Boolean,
          default: false,
        },
        showEmail: {
          type: Boolean,
          default: true,
        },
      },
      default: () => ({
        emailNotifications: true,
        smsNotifications: false,
        propertyAlerts: true,
        marketingEmails: false,
        profileVisibility: "public",
        showPhoneNumber: false,
        showEmail: true,
      }),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Compound indexes for better performance
userSchema.index({ email: 1 }, { unique: true, sparse: true }); // Unique sparse email index
userSchema.index({ phoneNumber: 1 }, { unique: true, sparse: true }); // Unique sparse phone index
userSchema.index({ googleId: 1, authProvider: 1 }, { sparse: true });

// Pre-save middleware for password hashing
userSchema.pre("save", async function (next) {
  const self: any = this as any;
  if (!self.isModified("password")) return next();

  if (self.password) {
    try {
      const salt = await bcrypt.genSalt(12);
      self.password = await bcrypt.hash(self.password, salt);
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const self: any = this as any;
  if (!self.password) return false;
  return bcrypt.compare(candidatePassword, self.password);
};

// Instance method to update last login
userSchema.methods.updateLastLogin = async function (): Promise<void> {
  (this as any).lastLogin = new Date();
  await (this as any).save();
};

// Static methods interface
interface IUserModel extends mongoose.Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByGoogleId(googleId: string): Promise<IUser | null>;
}

// Static method to find by email
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

// Static method to find by Google ID
userSchema.statics.findByGoogleId = function (googleId: string) {
  return this.findOne({ googleId, authProvider: "google" });
};

export const User = mongoose.model<IUser, IUserModel>("User", userSchema);
