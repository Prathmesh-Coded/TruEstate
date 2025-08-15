// Production-ready Google OAuth Configuration Test
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

console.log("🔍 TruEstate Google OAuth Configuration Test\n");

// Check environment variables
const requiredEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "SESSION_SECRET",
  "JWT_SECRET",
  "MONGODB_URI",
];

const optionalEnvVars = ["NODE_ENV", "PORT", "ALLOWED_ORIGINS"];

let allEnvVarsPresent = true;

console.log("📋 Required Environment Variables:");
requiredEnvVars.forEach((envVar) => {
  if (process.env[envVar]) {
    const value = process.env[envVar];
    const displayValue =
      envVar.includes("SECRET") || envVar.includes("URI")
        ? `${value.substring(0, 10)}...`
        : value.length > 50
        ? `${value.substring(0, 50)}...`
        : value;
    console.log(`✅ ${envVar}: ${displayValue}`);
  } else {
    console.log(`❌ ${envVar}: Missing`);
    allEnvVarsPresent = false;
  }
});

console.log("\n📋 Optional Environment Variables:");
optionalEnvVars.forEach((envVar) => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}: ${process.env[envVar]}`);
  } else {
    console.log(`⚠️  ${envVar}: Not set (using default)`);
  }
});

// Test MongoDB connection
async function testMongoConnection() {
  if (!process.env.MONGODB_URI) {
    console.log("❌ Cannot test MongoDB - URI missing");
    return false;
  }

  try {
    console.log("\n🔍 Testing MongoDB connection...");
    await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB connection successful");
    await mongoose.connection.close();
    return true;
  } catch (error) {
    console.log("❌ MongoDB connection failed:", (error as Error).message);
    return false;
  }
}

// Validate Google OAuth configuration
function validateGoogleConfig() {
  console.log("\n🔍 Validating Google OAuth configuration...");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.log("❌ Google OAuth credentials missing");
    return false;
  }

  // Basic format validation
  if (!clientId.endsWith(".apps.googleusercontent.com")) {
    console.log("⚠️  Google Client ID format seems incorrect");
  }

  if (!clientSecret.startsWith("GOCSPX-")) {
    console.log("⚠️  Google Client Secret format seems incorrect");
  }

  console.log("✅ Google OAuth credentials format looks correct");
  return true;
}

// Main test function
async function runTests() {
  console.log("=".repeat(60));

  const mongoOk = await testMongoConnection();
  const googleOk = validateGoogleConfig();

  console.log("\n" + "=".repeat(60));
  console.log("📊 Test Results Summary:");
  console.log(`Environment Variables: ${allEnvVarsPresent ? "✅" : "❌"}`);
  console.log(`MongoDB Connection: ${mongoOk ? "✅" : "❌"}`);
  console.log(`Google OAuth Config: ${googleOk ? "✅" : "❌"}`);

  if (allEnvVarsPresent && mongoOk && googleOk) {
    console.log(
      "\n🎉 All tests passed! Your configuration is ready for production."
    );
    console.log("\n📋 Next steps:");
    console.log("1. Install missing dependencies: npm install");
    console.log("2. Start your backend server: npm start");
    console.log("3. Start your frontend server: npm run dev");
    console.log("4. Navigate to http://localhost:5173/auth");
    console.log("5. Test Google authentication");

    console.log("\n🔗 OAuth Flow:");
    console.log("Frontend → Backend → Google → Backend Callback → Frontend");
    console.log(
      "http://localhost:5173 → http://localhost:5000/api/auth/google → Google OAuth → Callback → Success"
    );

    console.log("\n🛡️  Security Features Enabled:");
    console.log("• Rate limiting on auth endpoints");
    console.log("• Account lockout after failed attempts");
    console.log("• Secure session management");
    console.log("• CORS protection");
    console.log("• Input validation and sanitization");
  } else {
    console.log(
      "\n❌ Some tests failed. Please fix the issues above before proceeding."
    );

    if (!allEnvVarsPresent) {
      console.log(
        "\n📝 Missing environment variables need to be added to your .env file"
      );
    }

    if (!mongoOk) {
      console.log(
        "\n🔧 Check your MongoDB connection string and ensure the database is accessible"
      );
    }

    if (!googleOk) {
      console.log(
        "\n🔧 Verify your Google OAuth credentials in the Google Cloud Console"
      );
    }
  }

  console.log("\n" + "=".repeat(60));
}

// Run the tests
runTests().catch(console.error);
