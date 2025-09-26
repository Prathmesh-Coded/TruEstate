import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  console.log("🛡️ ProtectedRoute: Loading:", loading, "User:", user);

  if (loading) {
    console.log("⏳ ProtectedRoute: Still loading, showing spinner");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log("🚫 ProtectedRoute: No user, redirecting to home");
    return <Navigate to="/" replace />;
  }

  console.log("✅ ProtectedRoute: User authenticated, rendering children");
  return <>{children}</>;
}
