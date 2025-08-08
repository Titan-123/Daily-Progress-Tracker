/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Subscription and pricing types
 */
export type SubscriptionTier = "free" | "premium";

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  features: string[];
  limitations: {
    maxDailyGoals: number | null; // null means unlimited
    analytics: boolean;
    exportData: boolean;
    customCategories: boolean;
  };
}

export interface UserSubscription {
  tier: SubscriptionTier;
  status: "active" | "canceled" | "expired";
  startDate: string;
  endDate?: string;
  planId?: string;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionPlan> = {
  free: {
    tier: "free",
    name: "Free",
    price: 0,
    features: [
      "Up to 3 daily goals",
      "Basic progress tracking",
      "Calendar view",
      "Daily reflections",
    ],
    limitations: {
      maxDailyGoals: 3,
      analytics: false,
      exportData: false,
      customCategories: false,
    },
  },
  premium: {
    tier: "premium",
    name: "Premium",
    price: 9.99,
    features: [
      "Unlimited daily goals",
      "Advanced analytics",
      "Data export",
      "Custom categories",
      "Priority support",
      "Everything in Free",
    ],
    limitations: {
      maxDailyGoals: null,
      analytics: true,
      exportData: true,
      customCategories: true,
    },
  },
};
