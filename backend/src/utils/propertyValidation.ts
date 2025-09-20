import { IProperty } from "../models/Property";

export type AutoValidationOutcome = "VALID" | "INVALID" | "FLAGGED";

export interface AutoValidationResult {
  outcome: AutoValidationOutcome;
  score: number; // 0-1 confidence of being valid
  reasons: {
    type: "INFO" | "WARN" | "ERROR";
    field: string;
    message: string;
  }[];
}

/**
 * Simple heuristic validation engine. Extend rules as needed.
 */
export function runAutoValidation(
  input: Partial<IProperty>
): AutoValidationResult {
  const reasons: AutoValidationResult["reasons"] = [];
  let score = 1; // start optimistic

  const push = (
    type: "INFO" | "WARN" | "ERROR",
    field: string,
    message: string
  ) => {
    reasons.push({ type, field, message });
  };

  // Title & description length
  if (!input.title || input.title.trim().length < 10) {
    push("ERROR", "title", "Title too short (<10 chars)");
    score -= 0.2;
  }
  if (!input.description || input.description.trim().length < 20) {
    push("ERROR", "description", "Description too short (<20 chars)");
    score -= 0.2;
  }
  if (input.description && /free|giveaway|lottery/i.test(input.description)) {
    push("WARN", "description", "Suspicious marketing terms detected");
    score -= 0.05;
  }

  // Price validation heuristics (very naive placeholders)
  if (typeof input.price !== "number" || input.price <= 0) {
    push("ERROR", "price", "Price must be a positive number");
    score -= 0.3;
  } else {
    // Flag unusual extremely low values for buy listings
    if (input.listingType === "buy" && input.price < 50000) {
      push("WARN", "price", "Price unusually low for purchase");
      score -= 0.1;
    }
  }

  // Address basic checks
  if (!input.address?.city) {
    push("ERROR", "address.city", "City is required");
    score -= 0.15;
  }
  if (input.address?.pincode && !/^\d{6}$/.test(input.address.pincode)) {
    push("ERROR", "address.pincode", "Pincode must be 6 digits");
    score -= 0.15;
  }

  // Residential specifics
  if (["apartment", "house", "villa"].includes(String(input.propertyType))) {
    if (input.bedrooms == null) {
      push("ERROR", "bedrooms", "Bedrooms required for residential");
      score -= 0.15;
    }
    if (input.bathrooms == null) {
      push("ERROR", "bathrooms", "Bathrooms required for residential");
      score -= 0.15;
    }
  }

  // PG specifics
  if (input.listingType === "pg") {
    if (!input.roomSharing) {
      push("ERROR", "roomSharing", "Room sharing type required for PG");
      score -= 0.15;
    }
    if (!input.pgFor) {
      push("ERROR", "pgFor", "PG for (boys/girls/co-ed) required");
      score -= 0.15;
    }
  }

  // Plot specifics
  if (input.propertyType === "plot") {
    if (!input.plotArea || input.plotArea <= 0) {
      push("ERROR", "plotArea", "Plot area must be > 0");
      score -= 0.2;
    }
    if (!input.zoning) {
      push("ERROR", "zoning", "Zoning is required for plots");
      score -= 0.1;
    }
  }

  // Commercial specifics
  if (input.propertyType === "commercial") {
    if (!input.propertyStatus) {
      push(
        "ERROR",
        "propertyStatus",
        "Status required for commercial property"
      );
      score -= 0.1;
    }
  }

  // Documents
  if (!input.documents?.ownerId) {
    push("WARN", "documents.ownerId", "Owner ID document missing");
    score -= 0.05;
  }
  if (input.listingType !== "pg" && !input.documents?.ownershipDoc) {
    push("WARN", "documents.ownershipDoc", "Ownership document missing");
    score -= 0.05;
  }

  // Clamp score
  score = Math.max(0, Math.min(1, score));

  // Determine outcome
  const hasErrors = reasons.some((r) => r.type === "ERROR");
  const hasWarn = reasons.some((r) => r.type === "WARN");

  let outcome: AutoValidationOutcome = "VALID";
  if (hasErrors) outcome = "INVALID";
  else if (hasWarn || score < 0.7) outcome = "FLAGGED"; // borderline

  return { outcome, score, reasons };
}
