import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Button from "../Button";
import { useAuth } from "../../contexts/AuthContext";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { checkAuth } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, rememberMe: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      await checkAuth();
      if (data.user?.role !== "admin") {
        throw new Error("You are not authorized to access admin.");
      }
      const from = location.state?.from || "/admin";
      navigate(from, { replace: true });
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-1">Admin Login</h1>
        <p className="text-sm text-gray-500 mb-6">
          Sign in with an administrator account.
        </p>
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <Button type="submit" loading={loading} className="w-full">
            Sign in
          </Button>
        </form>
        <div className="mt-4 text-sm text-gray-600">
          <Link to="/auth" className="text-blue-600 no-underline">
            Regular user login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
