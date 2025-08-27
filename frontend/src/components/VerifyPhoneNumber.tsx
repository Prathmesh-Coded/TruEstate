import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import PhoneAuth from "./PhoneAuth";

interface VerifyPhoneNumberProps {
  onSuccess: () => void;
}

const VerifyPhoneNumber: React.FC<VerifyPhoneNumberProps> = ({ onSuccess }) => {
  const { checkAuth } = useAuth();
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState("");

  const handleVerificationSuccess = async (data: { phoneNumber: string }) => {
    setIsLinking(true);
    setError("");

    try {
      // Link phone number to the currently authenticated user
      const response = await fetch(
        "http://localhost:5000/api/auth/link-phone",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ phoneNumber: data.phoneNumber }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to link phone number");
      }

      // Refresh the user data in the context to get the new phone number
      await checkAuth();

      // Small delay to ensure UI updates properly
      setTimeout(() => {
        onSuccess();
      }, 100);
    } catch (error) {
      console.error("Failed to link phone number", error);
      setError(
        error instanceof Error ? error.message : "Failed to link phone number"
      );
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Verify Your Phone Number
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        To post a property, please add and verify your phone number.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {isLinking && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">Linking phone number...</p>
        </div>
      )}

      <PhoneAuth
        onSuccess={handleVerificationSuccess}
        mode="verify"
        disabled={isLinking}
      />
    </div>
  );
};

export default VerifyPhoneNumber;
