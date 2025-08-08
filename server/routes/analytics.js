import Target from "../models/Target.js";
import Goal from "../models/Goal.js";
import {
  calculateStreaks,
  calculateWeeklyCompletion,
  calculateMonthlyCompletion,
  getWeeklyData,
  analyzeStrengthsAndWeaknesses,
  calculateHabitStrength,
} from "../utils/analytics.js";

export const handleGetAnalytics = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Calculate all analytics data
    const [
      currentStreak,
      weeklyCompletion,
      monthlyCompletion,
      weeklyData,
      strengthsAndWeaknesses,
      habitStrength,
      totalTargetsCompleted,
    ] = await Promise.all([
      calculateStreaks(userId),
      calculateWeeklyCompletion(userId),
      calculateMonthlyCompletion(userId),
      getWeeklyData(userId),
      analyzeStrengthsAndWeaknesses(userId),
      calculateHabitStrength(userId),
      Target.countDocuments({ userId, completed: true }),
    ]);

    // Calculate best streak (simplified - in real app, you'd track this over time)
    const bestStreak = Math.max(currentStreak, 21); // Placeholder

    // Calculate consistency score based on recent performance
    const consistencyScore = Math.round(
      (weeklyCompletion + monthlyCompletion) / 2,
    );

    // Generate real monthly trends for the past 4 weeks
    const monthlyTrends = [];
    for (let i = 3; i >= 0; i--) {
      const weekCompletion = await calculateWeeklyCompletion(userId, i);
      monthlyTrends.push({
        week: `Week ${4 - i}`,
        completion: weekCompletion,
      });
    }

    const analyticsData = {
      weeklyCompletion,
      monthlyCompletion,
      currentStreak,
      bestStreak,
      totalTargetsCompleted,
      consistencyScore,
      improvementAreas: strengthsAndWeaknesses.improvementAreas,
      strengths: strengthsAndWeaknesses.strengths,
      habitStrength,
      weeklyData,
      monthlyTrends,
    };

    res.json(analyticsData);
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to load analytics data" });
  }
};

export const handleGetWeeklyData = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const offset = parseInt(req.query.offset) || 0;

    const weeklyData = await getWeeklyData(userId, offset);
    res.json(weeklyData);
  } catch (error) {
    console.error("Weekly data error:", error);
    res.status(500).json({ error: "Failed to load weekly data" });
  }
};

export const handleGetMonthlyTrends = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Generate monthly trends for the past 4 weeks
    const trends = [];
    for (let i = 3; i >= 0; i--) {
      const weekCompletion = await calculateWeeklyCompletion(userId, i);
      trends.push({
        week: `Week ${4 - i}`,
        completion: weekCompletion,
      });
    }

    res.json(trends);
  } catch (error) {
    console.error("Monthly trends error:", error);
    res.status(500).json({ error: "Failed to load monthly trends" });
  }
};
