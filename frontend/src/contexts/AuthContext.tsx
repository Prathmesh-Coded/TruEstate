import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface User {
  email: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  authProvider?: string;
  isEmailVerified?: boolean;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const deriveFirstName = (u: User): User => {
    if (u.firstName && u.firstName.trim().length > 0) return u;
    if (u.name && u.name.trim().length > 0) {
      const first = u.name.trim().split(" ")[0];
      return { ...u, firstName: first };
    }
    if (u.email) {
      const local = u.email.split("@")[0];
      return { ...u, firstName: local };
    }
    return u;
  };

  const login = (userData: User) => {
    setUser(deriveFirstName(userData));
  };

  const logout = async () => {
    try {
      // Call logout endpoint if you have one
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(deriveFirstName(data.user));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
