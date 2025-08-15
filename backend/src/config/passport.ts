import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User";
import { IUser } from "../types";

/**
 * Configure Passport Google OAuth Strategy
 */
export const configurePassport = (): void => {
  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("🔐 Google OAuth callback received");

          if (
            !profile.emails ||
            !profile.emails[0] ||
            !profile.emails[0].value
          ) {
            return done(new Error("No email provided by Google"), false);
          }

          const email = profile.emails[0].value.toLowerCase();
          const googleId = profile.id;
          const name = profile.displayName || "Google User";
          const avatar =
            profile.photos && profile.photos[0]
              ? profile.photos[0].value
              : undefined;

          // Check if user already exists with this Google ID
          let user = await User.findByGoogleId(googleId);

          if (user) {
            await user.updateLastLogin();
            console.log("✅ Existing Google user authenticated");
            return done(null, user);
          }

          // Check if user exists with same email
          user = await User.findByEmail(email);

          if (user) {
            if (user.authProvider === "local") {
              // Link Google account to existing local account
              user.googleId = googleId;
              user.name = user.name || name;
              if (avatar) user.avatar = avatar;
              user.isEmailVerified = true;
              await user.updateLastLogin();
              await user.save();
              console.log("🔗 Google account linked to existing user");
              return done(null, user);
            } else {
              return done(
                new Error(
                  "Account with this email already exists with different login method"
                ),
                false
              );
            }
          }

          // Create new user
          user = new User({
            googleId,
            email,
            name,
            avatar,
            authProvider: "google",
            isEmailVerified: true,
            lastLogin: new Date(),
          });

          await user.save();
          console.log("✅ New Google user created");
          return done(null, user);
        } catch (error) {
          console.error("❌ Google OAuth error:", error);
          return done(error, false);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user._id.toString());
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id).select("-password");
      if (!user) {
        return done(new Error("User not found"), null);
      }
      done(null, user);
    } catch (error) {
      console.error("❌ Deserialize user error:", error);
      done(error, null);
    }
  });
};
