import React, { useState } from "react";
import Button from "./Button";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const resp = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await resp.json();
      if (!resp.ok)
        throw new Error(data.message || "Unable to send reset link");
      setMessage("If the email exists, a reset link has been sent.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send reset link"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white">
      <p className="text-sm text-gray-600 mb-4">
        Enter your email address and we'll send you a link to reset your
        password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
        {message && (
          <div className="text-green-700 text-sm bg-green-50 p-3 rounded-lg">
            {message}
          </div>
        )}
        <Button type="submit" size="full" loading={loading} className="w-full">
          Send reset link
        </Button>
      </form>
    </div>
  );
};

export default ForgotPassword;
