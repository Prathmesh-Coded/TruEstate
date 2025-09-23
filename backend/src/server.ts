import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";

// Load environment variables
dotenv.config();

// Import configurations and utilities
import { validateEnvironment, getConfig } from "./config/environment";
import {
  connectDatabase,
  setupDatabaseEvents,
  closeDatabaseConnection,
} from "./config/database";
import { configurePassport } from "./config/passport";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

// Import routes
import authRoutes from "./routes/authRoutes";
import propertyRoutes from "./routes/propertyRoutes";
// @ts-ignore - JS module in TS project
import notificationRoutes from "../routes/notificationRoutes";
import {
  listPropertiesForAdmin,
  updatePropertyStatus,
} from "./controllers/propertyController";
import { authenticateToken } from "./middleware/auth";

// Validate environment before starting
validateEnvironment();

const config = getConfig();
const app = express();

/**
 * Middleware Configuration
 */
// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// CORS configuration - environment-aware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isDevelopment = config.nodeEnv === "development";

  // In development, allow localhost and 127.0.0.1 origins
  if (isDevelopment) {
    const allowedDevOrigins = [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
    ];

    if (origin && allowedDevOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
    } else if (!origin) {
      // Allow requests with no origin (like mobile apps or curl)
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Credentials", "false");
    } else {
      // Block unknown origins in development
      console.log(`🚫 CORS blocked origin in dev: ${origin}`);
      res.status(403).json({ message: "Origin not allowed" });
      return;
    }
  } else {
    // Production: only allow specific origins
    if (origin && config.allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
    } else {
      console.log(`🚫 CORS blocked origin in production: ${origin}`);
      res.status(403).json({ message: "Origin not allowed" });
      return;
    }
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization,Accept,X-Requested-With"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
});

// Session configuration
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.mongoUri,
    }),
    cookie: {
      secure: config.nodeEnv === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

/**
 * Configure Passport Strategies
 */
configurePassport();

/**
 * Routes Configuration
 */
// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "TruEstate API is running",
    version: "1.0.0",
    environment: config.nodeEnv,
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: config.nodeEnv,
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/notifications", notificationRoutes);

// Admin guard
const requireAdmin: any = async (req: any, res: any, next: any) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  try {
    // Minimal check: token payload may already contain role
    if (req.user.role === "admin") return next();
    return res.status(403).json({ message: "Forbidden" });
  } catch (e) {
    return res.status(500).json({ message: "Admin check failed" });
  }
};

app.get(
  "/api/admin/properties",
  authenticateToken as any,
  requireAdmin,
  listPropertiesForAdmin as any
);
app.patch(
  "/api/admin/properties/:id",
  authenticateToken as any,
  requireAdmin,
  updatePropertyStatus as any
);

/**
 * Error Handling Middleware
 */
app.use("*", notFoundHandler);
app.use(errorHandler);

/**
 * Server Initialization
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();
    setupDatabaseEvents();

    // Start server
    const server = app.listen(config.port, () => {
      console.log(`🚀 TruEstate API server running on port ${config.port}`);
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(
        `🔗 Health check: http://localhost:${config.port}/api/health`
      );
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      console.log(`${signal} received, shutting down gracefully`);

      server.close(async () => {
        try {
          await closeDatabaseConnection();
          console.log("✅ Server shut down successfully");
          process.exit(0);
        } catch (error) {
          console.error("❌ Error during graceful shutdown:", error);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
