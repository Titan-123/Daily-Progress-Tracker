import User from "../models/User.js";
import { getDemoUserSubscription, updateDemoUserSubscription } from "../utils/demoUserStore.js";

export const handleUpgradeSubscription = async (req, res) => {
  try {
    const { planTier, paymentDetails } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!planTier || !["free", "premium"].includes(planTier)) {
      return res.status(400).json({ error: "Invalid plan tier" });
    }

    // Handle demo user separately
    if (userId === "demo-user-123") {
      console.log(`Demo user upgrading to ${planTier} plan`);

      // Update demo user subscription in memory store
      const updatedSubscription = updateDemoUserSubscription({
        tier: planTier,
        status: "active",
        startDate: new Date().toISOString(),
      });

      const subscriptionData = {
        userId,
        ...updatedSubscription,
        paymentMethod: {
          last4: paymentDetails?.last4 || "****",
          type: "card",
        },
      };

      return res.status(200).json({
        success: true,
        message: "Subscription upgraded successfully",
        subscription: subscriptionData,
      });
    }

    // For real users, update database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user subscription in database
    user.subscription = {
      tier: planTier,
      status: "active",
      startDate: new Date(),
      planId: `plan_${planTier}_${Date.now()}`,
    };

    await user.save();

    console.log(`User ${userId} upgraded to ${planTier} plan`);
    console.log("Payment details:", paymentDetails);

    const subscriptionData = {
      userId,
      tier: planTier,
      status: "active",
      startDate: user.subscription.startDate.toISOString(),
      paymentMethod: {
        last4: paymentDetails?.last4 || "****",
        type: "card",
      },
    };

    res.status(200).json({
      success: true,
      message: "Subscription upgraded successfully",
      subscription: subscriptionData,
    });
  } catch (error) {
    console.error("Subscription upgrade error:", error);
    res.status(500).json({
      error: "Failed to process subscription upgrade",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const handleGetSubscription = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Handle demo user separately
    if (userId === "demo-user-123") {
      const demoSubscription = getDemoUserSubscription();
      const subscription = {
        userId,
        ...demoSubscription,
      };
      return res.status(200).json({ subscription });
    }

    // For real users, fetch from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const subscription = {
      userId,
      tier: user.subscription?.tier || "free",
      status: user.subscription?.status || "active",
      startDate: user.subscription?.startDate?.toISOString() || new Date().toISOString(),
      endDate: user.subscription?.endDate?.toISOString(),
      planId: user.subscription?.planId,
    };

    res.status(200).json({ subscription });
  } catch (error) {
    console.error("Get subscription error:", error);
    res.status(500).json({
      error: "Failed to fetch subscription",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const handleCancelSubscription = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // In a real application, this would:
    // 1. Cancel subscription with payment processor
    // 2. Update database to set end date
    // 3. Send confirmation email

    console.log(`User ${userId} canceling subscription`);

    res.status(200).json({
      success: true,
      message: "Subscription canceled successfully",
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({
      error: "Failed to cancel subscription",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
