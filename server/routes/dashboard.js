import mongoose from "mongoose";
import {
  handleGetDashboardFallback,
  handleToggleTargetFallback,
} from "./dashboard-fallback.js";
import { calculateUserAchievements } from "../utils/achievements.js";

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

export const handleGetDashboard = async (req, res) => {
  // Check if MongoDB is connected and modules are loaded
  const mongoReady = await loadMongoModules();

  if (!mongoReady) {
    return handleGetDashboardFallback(req, res);
  }

  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Use local date to avoid timezone issues
    const today = new Date();
    const localToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const tomorrow = new Date(localToday);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's targets
    let todayTargets = await Target.find({
      userId,
      date: { $gte: localToday, $lt: tomorrow },
    }).populate("goalId");

    // If no targets for today, create them from active daily goals
    if (todayTargets.length === 0) {
      const activeGoals = await Goal.find({
        userId,
        isActive: true,
        type: "daily",
      });

      if (activeGoals.length > 0) {
        const newTargets = [];
        for (const goal of activeGoals) {
          const target = new Target({
            title: goal.title,
            description: goal.description,
            type: goal.type,
            userId: goal.userId,
            goalId: goal._id,
            date: localToday,
            completed: false,
            streak: 0, // Start fresh for new day
          });
          newTargets.push(await target.save());
        }

        // Populate the goalId for the response
        const populatedTargets = await Target.populate(newTargets, {
          path: "goalId",
        });
        todayTargets.push(...populatedTargets);
      }
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

    // Get user achievements using dynamic calculation
    const achievements = await calculateUserAchievements(userId);

    // Calculate stats
    const currentStreak = await calculateStreaks(userId);
    const weeklyProgress = await calculateWeeklyCompletion(userId);

    console.log(`✅ Dashboard data loaded for user ${userId}`);
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
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const target = await Target.findOne({ _id: targetId, userId });
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

      // Check for achievements (simplified)
      if (target.streak === 1) {
        // Award "Day One" achievement
        console.log(`🏆 User ${userId} completed their first target!`);
      }
    }

    await target.save();

    console.log(`✅ Target ${targetId} toggled for user ${userId}`);
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
