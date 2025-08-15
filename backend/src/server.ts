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

// CORS configuration
app.use(
  cors({
    origin: config.allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

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
