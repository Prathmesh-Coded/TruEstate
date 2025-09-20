/**
 * Environment Configuration
 * Validates and loads environment variables
 */

// Required environment variables
const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "SESSION_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
] as const;

/**
 * Validate Environment Variables
 * Ensures all required environment variables are present
 */
export const validateEnvironment = (): void => {
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    console.error(
      "❌ Missing required environment variables:",
      missingEnvVars.join(", ")
    );
    console.error(
      "Please check your .env file and ensure all required variables are set."
    );
    process.exit(1);
  }

  console.log("✅ Environment variables validated successfully");
};

/**
 * Get Environment Configuration
 * Returns configuration object with environment variables
 */
export const getConfig = () => ({
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  sessionSecret: process.env.SESSION_SECRET!,
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  allowedOrigins: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    ...(process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : []),
  ],
});

/**
 * Check if running in production
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === "production";
};
