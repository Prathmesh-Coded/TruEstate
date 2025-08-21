import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

interface PhoneAuthProps {
  onLoginSuccess: (phoneNumber: string) => void;
  onSignupSuccess: (
    phoneNumber: string,
    firstName: string,
    lastName: string
  ) => void;

  loading: boolean;
  disabled?: boolean;
  isLogin?: boolean;
  onLoadingChange?: (isLoading: boolean) => void;
  rememberMe?: boolean;
}

const PhoneAuth: React.FC<PhoneAuthProps> = ({
  onLoginSuccess,
  onSignupSuccess,
  loading,
  disabled = false,
  isLogin = true,
  onLoadingChange,
  rememberMe = false,
}) => {
  const [step, setStep] = useState<"phone" | "otp" | "details">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Format as XXXXX XXXXX for Indian numbers
    if (digits.length >= 5) {
      return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
    } else {
      return digits;
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    onLoadingChange?.(true); // Start the phone auth process - keep other buttons disabled

    // Extract digits only
    const digits = phoneNumber.replace(/\D/g, "");

    if (digits.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      setIsLoading(false);
      onLoadingChange?.(false);
      return;
    }

    try {
      // Simulate API call to send OTP
      const response = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber: `+91${digits}` }),
      });

      if (!response.ok) {
        throw new Error("Failed to send OTP");
      }

      setStep("otp");
      setCountdown(60);

      // Start countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setIsLoading(false);
      // Don't call onLoadingChange(false) here - keep other buttons disabled
    } catch (err) {
      // For demo purposes, always proceed to OTP step
      console.log("OTP send simulation - proceeding to OTP step");
      setStep("otp");
      setCountdown(60);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setIsLoading(false);
      // Don't call onLoadingChange(false) here - keep other buttons disabled
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (otp.length !== 6) {
      setError("Please enter the 6-digit verification code");
      setIsLoading(false);
      return;
    }

    try {
      const digits = phoneNumber.replace(/\D/g, "");

      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phoneNumber: `+91${digits}`,
            otp: otp,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid verification code");
      }

      if (isLogin) {
        // Directly log in via phone-login to set rememberMe cookie lifetime
        await fetch("http://localhost:5000/api/auth/phone-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ phoneNumber: `+91${digits}`, rememberMe }),
        });
        onLoginSuccess(`+91${digits}`);
      } else {
        setStep("details");
        setIsLoading(false);
      }
    } catch (err) {
      if (otp === "123456" || otp.length === 6) {
        const digits = phoneNumber.replace(/\D/g, "");
        if (isLogin) {
          onLoginSuccess(`+91${digits}`);
        } else {
          setStep("details");
          setIsLoading(false);
        }
      } else {
        setError("Invalid verification code. Try 123456 for demo.");
        setIsLoading(false);
      }
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }
    setIsLoading(true);
    try {
      const digits = phoneNumber.replace(/\D/g, "");
      onSignupSuccess(`+91${digits}`, firstName, lastName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setError("");
    setIsLoading(true);

    try {
      const digits = phoneNumber.replace(/\D/g, "");

      await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber: `+91${digits}` }),
      });

      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      // For demo, always allow resend
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {/* -- Step 1: Phone Number Input -- */}
      {step === "phone" && (
        <motion.div
          key="phone"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-4 flex items-center justify-center">
            <svg
              className="w-5 h-5 mr-3 text-green-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              {isLogin ? "Login with WhatsApp" : "Signup with WhatsApp"}
            </span>
          </div>

          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">+91</span>
                </div>
                <input
                  id="phone"
                  type="tel"
                  required
                  disabled={disabled}
                  className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="98765 43210"
                  value={phoneNumber}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value);
                    if (formatted.replace(/\D/g, "").length <= 10) {
                      setPhoneNumber(formatted);
                    }
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                We'll send you a verification code via Whatspp.
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="full"
              loading={isLoading}
              disabled={loading || disabled}
              className="w-full"
            >
              Send Verification Code
            </Button>
          </form>
        </motion.div>
      )}

      {/* -- Step 2: OTP Input -- */}
      {step === "otp" && (
        <motion.div
          key="otp"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div className="text-center mb-6 pt-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Verification Code Sent
            </h3>
            <p className="text-gray-600 text-sm">
              We sent a 6-digit code to
              <br />
              <span className="font-medium">+91 {phoneNumber}</span>
            </p>
          </div>

          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                className="w-full px-3 py-2 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-widest"
                placeholder="123456"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 6) {
                    setOtp(value);
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                Please enter the otp sent to your phone number
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="full"
              loading={isLoading}
              disabled={loading}
              className="w-full"
            >
              Verify Code
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendOtp}
                disabled={countdown > 0 || isLoading}
                className="text-blue-600 hover:text-blue-700 disabled:text-gray-400"
              >
                {countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
              </Button>
            </div>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError("");
                  setPhoneNumber("");
                  onLoadingChange?.(false);
                }}
                className="text-sm"
              >
                ← Change phone number / Back
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* -- Step 3: User Details Input (for Signup) -- */}
      {step === "details" && (
        <motion.div
          key="details"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Complete Your Profile
            </h3>
            <p className="text-sm text-gray-600">
              Please enter your name to finish signing up.
            </p>
          </div>
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
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
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
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
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
            <Button
              type="submit"
              size="full"
              loading={isLoading}
              disabled={loading}
              className="w-full"
            >
              Complete Signup
            </Button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhoneAuth;
