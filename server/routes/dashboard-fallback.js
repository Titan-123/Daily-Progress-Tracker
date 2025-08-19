// Fallback mock data when MongoDB is not available
import {
  getDemoDashboardTargets,
  updateDemoTargetCompletion,
} from "../utils/demoUserStore.js";
import { getAllAchievementDefinitions } from "../utils/achievements.js";

// Get targets from demo store instead of static data
const getMockTargets = () => getDemoDashboardTargets();

// Remove static mock targets - now using demo store
let mockTargets = [];

// Get available achievements (none unlocked in fallback mode)
const getMockAchievements = () => getAllAchievementDefinitions().slice(0, 3);

export const handleGetDashboardFallback = (req, res) => {
  console.log("📋 Using fallback dashboard data (MongoDB not connected)");
  const currentTargets = getMockTargets();
  res.json({
    targets: currentTargets,
    achievements: mockAchievements,
    weeklyProgress: 0,
    totalStreak: 0,
  });
};

export const handleToggleTargetFallback = (req, res) => {
  const { targetId } = req.params;

  const currentTargets = getMockTargets();
  const target = currentTargets.find((t) => t.id === targetId);
  if (!target) {
    return res.status(404).json({ error: "Target not found" });
  }

  const newCompleted = !target.completed;
  updateDemoTargetCompletion(targetId, newCompleted);

  console.log(
    `🎯 Toggled target ${targetId} to ${newCompleted} (fallback mode)`,
  );

  const updatedTarget = { ...target, completed: newCompleted };
  res.json(updatedTarget);
};
