import mongoose from "mongoose";
import {
  handleGetDashboardFallback,
  handleToggleTargetFallback,
} from "./dashboard-fallback.js";

// Only import MongoDB models if mongoose is connected
let Target,
  Goal,
  UserAchievement,
  Achievement,
  calculateStreaks,
  calculateWeeklyCompletion;

const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Dynamically import MongoDB-dependent modules
const loadMongoModules = async () => {
  if (isMongoConnected()) {
    try {
      const [targetModule, goalModule, achievementModule, analyticsModule] =
        await Promise.all([
          import("../models/Target.js"),
          import("../models/Goal.js"),
          import("../models/Achievement.js"),
          import("../utils/analytics.js"),
        ]);

      Target = targetModule.default;
      Goal = goalModule.default;
      UserAchievement = achievementModule.UserAchievement;
      Achievement = achievementModule.Achievement;
      calculateStreaks = analyticsModule.calculateStreaks;
      calculateWeeklyCompletion = analyticsModule.calculateWeeklyCompletion;

      return true;
    } catch (error) {
      console.error("Error loading MongoDB modules:", error);
      return false;
    }
  }
  return false;
};

// For demo purposes, we'll use a default user ID
const DEFAULT_USER_ID = "60d0fe4f5311236168a109ca";

export const handleGetDashboard = async (req, res) => {
  // Check if MongoDB is connected and modules are loaded
  const mongoReady = await loadMongoModules();

  if (!mongoReady) {
    return handleGetDashboardFallback(req, res);
  }

  try {
    const userId = req.user?.id || DEFAULT_USER_ID;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's targets
    const todayTargets = await Target.find({
      userId,
      date: { $gte: today, $lt: tomorrow },
    }).populate("goalId");

    // If no targets for today, create them from active goals
    if (todayTargets.length === 0) {
      const activeGoals = await Goal.find({
        userId,
        isActive: true,
        type: "daily",
      });

      const newTargets = [];
      for (const goal of activeGoals) {
        const target = new Target({
          title: goal.title,
          description: goal.description,
          type: goal.type,
          userId: goal.userId,
          goalId: goal._id,
          date: today,
          completed: false,
          streak: goal.streak,
        });
        newTargets.push(await target.save());
      }

      // Populate the goalId for the response
      const populatedTargets = await Target.populate(newTargets, {
        path: "goalId",
      });
      todayTargets.push(...populatedTargets);
    }

    // Format targets for frontend
    const targets = todayTargets.map((target) => ({
      id: target._id.toString(),
      title: target.title,
      description: target.description,
      type: target.type,
      completed: target.completed,
      streak: target.streak,
    }));

    // Get user achievements
    const userAchievements = await UserAchievement.find({ userId })
      .populate("achievementId")
      .sort({ earnedAt: -1 })
      .limit(10);

    const achievements = userAchievements.map((ua) => ({
      id: ua.achievementId._id.toString(),
      title: ua.achievementId.title,
      description: ua.achievementId.description,
      icon: ua.achievementId.icon,
      earned: true,
    }));

    // Add some default achievements if none exist
    if (achievements.length === 0) {
      achievements.push(
        {
          id: "1",
          title: "7-Day Streak",
          description: "Completed daily goals for a week!",
          icon: "🔥",
          earned: false,
        },
        {
          id: "2",
          title: "Early Bird",
          description: "Started progress tracking before 8 AM",
          icon: "🌅",
          earned: false,
        },
        {
          id: "3",
          title: "Consistency Master",
          description: "Hit 90% weekly completion rate",
          icon: "⭐",
          earned: false,
        },
      );
    }

    // Calculate stats
    const currentStreak = await calculateStreaks(userId);
    const weeklyProgress = await calculateWeeklyCompletion(userId);

    console.log("✅ Dashboard data loaded from MongoDB");
    res.json({
      targets,
      achievements,
      weeklyProgress,
      totalStreak: currentStreak,
    });
  } catch (error) {
    console.error("❌ MongoDB dashboard error:", error);
    return handleGetDashboardFallback(req, res);
  }
};

export const handleToggleTarget = async (req, res) => {
  const mongoReady = await loadMongoModules();

  if (!mongoReady) {
    return handleToggleTargetFallback(req, res);
  }

  try {
    const { targetId } = req.params;

    const target = await Target.findById(targetId);
    if (!target) {
      return res.status(404).json({ error: "Target not found" });
    }

    // Toggle completion
    target.completed = !target.completed;
    target.completedAt = target.completed ? new Date() : null;

    // Update streak logic
    if (target.completed) {
      target.streak += 1;

      // Also update the parent goal's streak
      const goal = await Goal.findById(target.goalId);
      if (goal) {
        goal.streak = Math.max(goal.streak, target.streak);
        goal.lastCompletedDate = new Date();
        await goal.save();
      }
    }

    await target.save();

    console.log(`✅ Target ${targetId} toggled in MongoDB`);
    res.json({
      id: target._id.toString(),
      title: target.title,
      description: target.description,
      type: target.type,
      completed: target.completed,
      streak: target.streak,
    });
  } catch (error) {
    console.error("❌ MongoDB toggle target error:", error);
    return handleToggleTargetFallback(req, res);
  }
};
