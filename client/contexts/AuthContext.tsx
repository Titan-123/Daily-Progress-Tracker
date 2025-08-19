import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserSubscription,
  SubscriptionTier,
  SUBSCRIPTION_PLANS,
} from "@shared/api";

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
  refreshUser: () => Promise<void>;
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

  // Load user from localStorage on mount and fetch latest subscription
  useEffect(() => {
    const loadUserAndSubscription = async () => {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        const parsedUser = JSON.parse(savedUser);

        // Add default subscription for existing users who don't have one
        if (parsedUser && !parsedUser.subscription) {
          parsedUser.subscription = {
            tier: "free" as SubscriptionTier,
            status: "active" as const,
            startDate: new Date().toISOString(),
          };
          // Update localStorage with the new subscription
          localStorage.setItem("user", JSON.stringify(parsedUser));
        }

        setUser(parsedUser);

        // Fetch latest subscription data from backend
        try {
          const subscriptionResponse = await fetch("/api/subscription", {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          });

          if (subscriptionResponse.ok) {
            const subscriptionData = await subscriptionResponse.json();
            console.log(
              "Fetched subscription from backend:",
              subscriptionData.subscription,
            );

            const updatedUser = {
              ...parsedUser,
              subscription: subscriptionData.subscription,
            };

            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
        } catch (error) {
          console.error("Failed to fetch subscription data:", error);
        }
      }
      setLoading(false);
    };

    loadUserAndSubscription();
  }, []);

  // Listen for subscription updates from checkout window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "SUBSCRIPTION_UPGRADED") {
        console.log("Received subscription upgrade message");
        // Force immediate localStorage check and update
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          console.log("Updated user from message:", parsedUser);
        }
        // Also call refreshUser as backup
        setTimeout(() => refreshUser(), 100);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Poll localStorage for subscription changes (backup method)
  useEffect(() => {
    const checkForUpdates = () => {
      const savedUser = localStorage.getItem("user");
      if (savedUser && user) {
        const parsedUser = JSON.parse(savedUser);
        // Check if subscription tier has changed
        if (parsedUser.subscription?.tier !== user.subscription?.tier) {
          console.log(
            "Detected subscription change in localStorage:",
            parsedUser.subscription?.tier,
          );
          setUser(parsedUser);
        }
      }
    };

    const interval = setInterval(checkForUpdates, 1000); // Check every 1 second
    return () => clearInterval(interval);
  }, [user]);

  // Refresh user data when window comes back into focus (when returning from checkout)
  useEffect(() => {
    const handleFocus = () => {
      console.log("Window focused, checking for subscription updates");
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.subscription?.tier !== user?.subscription?.tier) {
          setUser(parsedUser);
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user]);

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

  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) return;

    try {
      // Fetch current subscription data from backend
      const subscriptionResponse = await fetch("/api/subscription", {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();

        if (user) {
          const updatedUser = {
            ...user,
            subscription: subscriptionData.subscription,
          };

          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          console.log(
            "User refreshed with subscription:",
            subscriptionData.subscription,
          );
        }
      }

      // For real users, also fetch updated user profile
      if (currentToken !== "demo-token-123") {
        const response = await fetch("/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
          localStorage.setItem("user", JSON.stringify(userData.user));
        }
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  // Helper methods for subscription checks
  // TEMPORARILY DISABLED FOR FREE VERSION - PREMIUM CODE COMMENTED FOR LATER USE

  // const isPremium = user?.subscription?.tier === "premium";
  // const subscriptionTier = user?.subscription?.tier || "free";
  // const hasAnalyticsAccess = isPremium;

  // TEMPORARY: Make everything free and accessible
  const isPremium = false; // Temporarily always false
  const subscriptionTier = "free" as SubscriptionTier; // Temporarily always free
  const hasAnalyticsAccess = false; // Temporarily disabled - will show coming soon

  // Debug logging
  console.log("Current user subscription:", user?.subscription);
  console.log("isPremium (temporarily disabled):", isPremium);
  console.log("subscriptionTier (temporarily forced to free):", subscriptionTier);

  const canCreateMoreGoals = (currentGoalCount: number) => {
    // TEMPORARILY DISABLED PREMIUM LIMITS - ALLOW UNLIMITED GOALS
    return true; // Always allow creating more goals

    // ORIGINAL PREMIUM CODE (COMMENTED FOR LATER USE):
    // if (!user || !user.subscription) return false;
    // const plan = SUBSCRIPTION_PLANS[user.subscription.tier];
    // return (
    //   plan.limitations.maxDailyGoals === null ||
    //   currentGoalCount < plan.limitations.maxDailyGoals
    // );
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    refreshUser,
    loading,
    isAuthenticated: !!user,
    isPremium,
    subscriptionTier,
    canCreateMoreGoals,
    hasAnalyticsAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
