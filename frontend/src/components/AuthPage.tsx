import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Button from "./Button";
import PhoneAuth from "./PhoneAuth";
import PasswordStrengthChecker, {
  getPasswordStrength,
  isPasswordValid,
} from "./PasswordStrengthChecker";
import ForgotPassword from "./ForgotPassword";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [pane, setPane] = useState<"auth" | "forgot" | "reset">("auth");

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, checkAuth } = useAuth();

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setIsLogin(false); // Switch to the signup view
    } else {
      setIsLogin(true); // Default to the login view
    }
  }, [searchParams]); // Rerun this effect if the URL search params change

  // Handle OAuth callback with enhanced error handling
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const authSuccess = searchParams.get("auth");
      const authError = searchParams.get("error");

      if (authSuccess === "success") {
        try {
          setIsAuthenticating(true);
          setError("");

          // OAuth was successful, check authentication status
          await checkAuth();

          // Clear URL parameters
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );

          // Navigate to home
          navigate("/");
        } catch (error) {
          console.error("Post-OAuth auth check failed:", error);
          setError(
            "Authentication completed but verification failed. Please try signing in again."
          );
          setIsAuthenticating(false);
        }
      } else if (authError) {
        // Handle OAuth errors with detailed messages
        const errorMessages: { [key: string]: string } = {
          google_auth_failed:
            "Google sign-in was cancelled or failed. Please try again.",
          callback_failed: "Authentication process failed. Please try again.",
          auth_failed: "Authentication failed. Please try again.",
          access_denied:
            "Access was denied. Please grant permission to continue.",
          server_error:
            "Server error occurred during authentication. Please try again later.",
        };

        const errorMessage =
          errorMessages[authError] ||
          "Authentication failed. Please try again.";
        setError(errorMessage);
        setIsAuthenticating(false);

        // Clear error from URL after showing it
        setTimeout(() => {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }, 100);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, checkAuth]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const validateForm = () => {
    if (!isLogin && !formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!isLogin && !formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (!isLogin && !isPasswordValid(formData.password)) {
      setError("Please use a stronger password");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setIsAuthenticating(true);
    setError("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (data.suggestGoogleLogin) {
          setError(
            `${data.message} Would you like to sign in with Google instead?`
          );
        } else {
          setError(data.message || `${isLogin ? "Login" : "Signup"} failed`);
        }
        return;
      }

      // Successful authentication
      if (data.user) {
        login(data.user);
        navigate("/");
      } else {
        throw new Error("Authentication successful but user data not received");
      }
    } catch (err) {
      if (err instanceof Error) {
        // Don't override error if it was already set above
        if (!error) {
          setError(err.message);
        }
      } else {
        setError(`${isLogin ? "Login" : "Signup"} failed. Please try again.`);
      }
    } finally {
      setLoading(false);
      setIsAuthenticating(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider === "google") {
      try {
        setIsAuthenticating(true);
        setError("");

        // Store current URL for return after auth
        const returnUrl = encodeURIComponent(window.location.origin);

        // Redirect to Google OAuth with return URL
        window.location.href = `http://localhost:5000/api/auth/google?returnTo=${returnUrl}`;
        return;
      } catch (err) {
        console.error("Google auth redirect error:", err);
        setError("Unable to initiate Google sign-in. Please try again.");
        setIsAuthenticating(false);
      }
      return;
    }

    // Handle other providers
    try {
      setLoading(true);
      setIsAuthenticating(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/auth/${provider}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `${provider} login failed`);
      }

      if (data.availableMethods) {
        setError(
          `${provider} sign-in is not yet available. Please use ${data.availableMethods.join(
            ", "
          )} instead.`
        );
      } else {
        setError(data.message || `${provider} login not implemented yet`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `${provider} login failed`);
    } finally {
      setLoading(false);
      setIsAuthenticating(false);
    }
  };

  const handlePhoneAuth = async (data: {
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
  }) => {
    const { phoneNumber, firstName, lastName } = data;

    if (isLogin) {
      setLoading(true);
      setIsAuthenticating(true);
      setError("");

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/phone-login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ phoneNumber, rememberMe }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Login with phone number failed.");
        }

        login(data.user); // Update the auth context
        navigate("/"); // Redirect to home page
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setLoading(false);
        setIsAuthenticating(false);
      }
    } else {
      setLoading(true);
      setIsAuthenticating(true);
      setError("");

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/complete-phone-signup",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              phoneNumber,
              firstName,
              lastName,
              rememberMe,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not complete signup.");
        }

        login(data.user); // Update the auth context with the new user
        navigate("/"); // Redirect to home page
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred."
        );
      } finally {
        setLoading(false);
        setIsAuthenticating(false);
      }
    }
  };

  const toggleMode = () => {
    const newIsLogin = !isLogin;
    setIsLogin(newIsLogin);

    if (newIsLogin) {
      // If we are now in LOGIN mode, clear the param
      setSearchParams({});
    } else {
      // If we are now in SIGNUP mode, set the param
      setSearchParams({ mode: "signup" });
    }

    setError("");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex bg-gray-900"
    >
      {/* Left Section - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 p-12 flex-col justify-center">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="flex items-center mb-12 justify-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-white">TruEstate</span>
          </div>

          {/* Features */}
          <div className="space-y-10 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Find Your Dream Home
              </h3>
              <p className="text-gray-400">
                Browse thousands of properties with detailed filters and
                advanced search options.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="1 1 20 20"
                >
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Save & Compare Properties
              </h3>
              <p className="text-gray-400">
                Create your personalized property list and compare features side
                by side.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Connect with Agents
              </h3>
              <p className="text-gray-400">
                Get in touch with verified real estate professionals for expert
                guidance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Auth Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center p-4 sm:p-8 relative min-h-screen">
        {/* Return to Home Button */}
        <Link
          to="/"
          className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors z-10"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="hidden sm:inline">Back to home</span>
          <span className="sm:hidden">Back to home</span>
        </Link>

        <div className="w-full max-w-md mx-auto pt-16 pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${pane}-${isLogin ? "login" : "signup"}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {pane === "auth" && (
                <>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center sm:text-left">
                    {isLogin ? "Welcome back" : "Create your account"}
                  </h2>

                  {/* Social Login Buttons */}
                  <div className="space-y-3 mb-6">
                    <button
                      onClick={() => handleSocialLogin("google")}
                      disabled={isAuthenticating}
                      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      {isLogin ? "Log in with Google" : "Sign up with Google"}
                    </button>

                    <div className="border border-gray-300 rounded-lg p-4 bg-white">
                      <PhoneAuth
                        mode={isLogin ? "login" : "signup"}
                        onSuccess={handlePhoneAuth}
                        disabled={isAuthenticating}
                        onLoadingChange={setIsAuthenticating}
                        rememberMe={rememberMe}
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="firstName"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            First Name
                          </label>
                          <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            required
                            disabled={isAuthenticating}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="First name"
                            value={formData.firstName}
                            onChange={handleChange}
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="lastName"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Last Name
                          </label>
                          <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            required
                            disabled={isAuthenticating}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="Last name"
                            value={formData.lastName}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        disabled={isAuthenticating}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Password
                        </label>
                        {!isLogin && formData.password.length > 0 && (
                          <span
                            className={`text-xs font-medium capitalize ${
                              getPasswordStrength(formData.password).color ===
                              "red"
                                ? "text-red-600"
                                : getPasswordStrength(formData.password)
                                    .color === "yellow"
                                ? "text-yellow-600"
                                : getPasswordStrength(formData.password)
                                    .color === "blue"
                                ? "text-blue-600"
                                : "text-green-600"
                            }`}
                          >
                            {getPasswordStrength(formData.password).level}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          disabled={isAuthenticating}
                          className={`w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                            !isLogin && formData.password.length > 0
                              ? getPasswordStrength(formData.password).ringColor
                              : "focus:ring-blue-500 focus:border-blue-500"
                          }`}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleChange}
                          onFocus={() => setIsPasswordFocused(true)}
                          onBlur={() => setIsPasswordFocused(false)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isAuthenticating}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <AnimatePresence mode="wait">
                            {showPassword ? (
                              <motion.svg
                                key="eye-off"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                />
                              </motion.svg>
                            ) : (
                              <motion.svg
                                key="eye"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </motion.svg>
                            )}
                          </AnimatePresence>
                        </button>
                      </div>

                      {/* Password Strength Checker - only show for signup */}
                      <PasswordStrengthChecker
                        isVisible={!isLogin}
                        isFocused={isPasswordFocused}
                      />
                    </div>

                    {!isLogin && (
                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            disabled={isAuthenticating}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            disabled={isAuthenticating}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <AnimatePresence mode="wait">
                              {showConfirmPassword ? (
                                <motion.svg
                                  key="eye-off"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ duration: 0.2 }}
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                  />
                                </motion.svg>
                              ) : (
                                <motion.svg
                                  key="eye"
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.8 }}
                                  transition={{ duration: 0.2 }}
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </motion.svg>
                              )}
                            </AnimatePresence>
                          </button>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    {isLogin && (
                      <div className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            disabled={isAuthenticating}
                            className="h-4 w-4 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed accent-blue-600"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Remember me
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setPane("forgot")}
                          className="text-sm text-blue-600 hover:text-blue-500 bg-transparent border-0 p-0"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <Button
                      type="submit"
                      loading={loading}
                      disabled={loading || isAuthenticating}
                      size="full"
                      className="w-full"
                    >
                      {isLogin ? "Sign in to your account" : "Create account"}
                    </Button>
                  </form>

                  {/* Switch between login/signup */}
                  <div className="mt-6 mb-4 text-center">
                    <p className="text-sm text-gray-600">
                      {isLogin
                        ? "Don't have an account yet?"
                        : "Already have an account?"}{" "}
                      <button
                        type="button"
                        onClick={toggleMode}
                        disabled={isAuthenticating}
                        className="text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLogin ? "Sign up here" : "Sign in here"}
                      </button>
                    </p>
                  </div>
                </>
              )}

              {pane === "forgot" && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
                    Forgot password
                  </h2>
                  <ForgotPassword onBackToSignIn={() => setPane("auth")} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default AuthPage;
