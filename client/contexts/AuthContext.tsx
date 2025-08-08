import React, { createContext, useContext, useState, useEffect } from "react";
import { UserSubscription, SubscriptionTier, SUBSCRIPTION_PLANS } from "@shared/api";

interface User {
  id: string;
  name: string;
  email: string;
  preferences: {
    theme: string;
    notifications: boolean;
    reminderTime: string;
  };
  streaks?: {
    current: number;
    best: number;
    lastActiveDate: string;
  };
  subscription: UserSubscription;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isPremium: boolean;
  subscriptionTier: SubscriptionTier;
  canCreateMoreGoals: (currentGoalCount: number) => boolean;
  hasAnalyticsAccess: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Demo mode - bypass authentication for demo credentials
    if (email === "demo@example.com" && password === "demo123") {
      const demoUser = {
        id: "demo-user-123",
        name: "Demo User",
        email: "demo@example.com",
        preferences: {
          theme: "light",
          notifications: true,
          reminderTime: "09:00",
        },
        streaks: {
          current: 12,
          best: 21,
          lastActiveDate: new Date().toISOString(),
        },
        subscription: {
          tier: "free" as SubscriptionTier,
          status: "active" as const,
          startDate: new Date().toISOString(),
        },
      };

      const demoToken = "demo-token-123";

      setToken(demoToken);
      setUser(demoUser);
      localStorage.setItem("token", demoToken);
      localStorage.setItem("user", JSON.stringify(demoUser));
      return;
    }

    // Regular authentication for non-demo users
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Login failed");
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Registration failed");
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
