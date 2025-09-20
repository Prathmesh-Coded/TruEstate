import mongoose, { Schema, Document } from "mongoose";

export type PropertyListingType = "buy" | "rent" | "pg";
export type PropertyType =
  | "apartment"
  | "house"
  | "villa"
  | "plot"
  | "commercial";
export type VerificationStatus =
  | "PENDING_AUTO" // just created, pending automatic validation
  | "AUTO_VALID" // automatic validation passed
  | "AUTO_INVALID" // automatic validation failed (will be rejected)
  | "FLAGGED" // automatic validation uncertain, needs manual review
  | "APPROVED" // manually approved (published)
  | "REJECTED"; // manually rejected

export interface IProperty extends Document {
  owner: mongoose.Types.ObjectId;
  listingType: PropertyListingType;
  propertyType: PropertyType;
  title: string;
  description: string;
  price: number;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    locality: string;
    country: string;
  };
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  furnished?: boolean;
  parking?: boolean;
  roomSharing?: "single" | "double" | "triple";
  foodIncluded?: boolean;
  pgFor?: "boys" | "girls" | "co-ed";
  plotArea?: number;
  plotAreaUnit?: "sqft" | "sqyd" | "sqm" | "bigha" | "acre";
  zoning?: "residential" | "commercial" | "agricultural";
  propertyStatus?: "ready" | "under-construction";
  washrooms?: number;
  photos: string[]; // store URLs after upload (placeholder for now)
  documents: {
    ownerId?: string;
    ownershipDoc?: string;
    buildingPlan?: string;
  };
  verification: {
    status: VerificationStatus;
    autoCheckRun: boolean;
    autoScore?: number; // score 0-1 representing confidence
    reasons: {
      type: "INFO" | "WARN" | "ERROR";
      field: string;
      message: string;
    }[];
    decidedAt?: Date;
    decidedBy?: mongoose.Types.ObjectId; // admin user id
  };
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<IProperty>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    listingType: { type: String, enum: ["buy", "rent", "pg"], required: true },
    propertyType: {
      type: String,
      enum: ["apartment", "house", "villa", "plot", "commercial"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 5000,
    },
    price: { type: Number, required: true, min: 1, max: 999999999 },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true, match: /^\d{6}$/ },
      locality: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true, default: "India" },
    },
    bedrooms: { type: Number, min: 0, max: 50 },
    bathrooms: { type: Number, min: 0, max: 50 },
    floors: { type: Number, min: 0, max: 200 },
    furnished: { type: Boolean },
    parking: { type: Boolean },
    roomSharing: { type: String, enum: ["single", "double", "triple"] },
    foodIncluded: { type: Boolean },
    pgFor: { type: String, enum: ["boys", "girls", "co-ed"] },
    plotArea: { type: Number, min: 0 },
    plotAreaUnit: {
      type: String,
      enum: ["sqft", "sqyd", "sqm", "bigha", "acre"],
    },
    zoning: {
      type: String,
      enum: ["residential", "commercial", "agricultural"],
    },
    propertyStatus: { type: String, enum: ["ready", "under-construction"] },
    washrooms: { type: Number, min: 0, max: 200 },
    photos: { type: [String], default: [] },
    documents: {
      ownerId: { type: String },
      ownershipDoc: { type: String },
      buildingPlan: { type: String },
    },
    verification: {
      status: {
        type: String,
        enum: [
          "PENDING_AUTO",
          "AUTO_VALID",
          "AUTO_INVALID",
          "FLAGGED",
          "APPROVED",
          "REJECTED",
        ],
        default: "PENDING_AUTO",
        index: true,
      },
      autoCheckRun: { type: Boolean, default: false },
      autoScore: { type: Number, min: 0, max: 1 },
      reasons: [
        {
          type: {
            type: String,
            enum: ["INFO", "WARN", "ERROR"],
            required: true,
          },
          field: { type: String, required: true },
          message: { type: String, required: true },
        },
      ],
      decidedAt: { type: Date },
      decidedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
  },
  { timestamps: true }
);

propertySchema.index({ "address.city": 1, verification: 1 });
propertySchema.index({ propertyType: 1, listingType: 1 });

export const Property = mongoose.model<IProperty>("Property", propertySchema);
