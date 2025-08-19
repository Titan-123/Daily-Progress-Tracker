import Target from "../models/Target.js";
import DayEntry from "../models/DayEntry.js";
import Goal from "../models/Goal.js";

// Helper function to format date as local YYYY-MM-DD string
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const calculateStreaks = async (userId) => {
  try {
    // Get all targets for the user, sorted by date descending
    const targets = await Target.find({ userId })
      .sort({ date: -1 })
      .populate("goalId");

    // Calculate current streak
    let currentStreak = 0;
    let lastDate = new Date();
    lastDate.setHours(0, 0, 0, 0);

    // Group targets by date
    const targetsByDate = {};
    targets.forEach((target) => {
      const dateKey = target.date.toISOString().split("T")[0];
      if (!targetsByDate[dateKey]) {
        targetsByDate[dateKey] = { completed: 0, total: 0 };
      }
      targetsByDate[dateKey].total++;
      if (target.completed) {
        targetsByDate[dateKey].completed++;
      }
    });

    // Calculate streak from most recent complete day
    const sortedDates = Object.keys(targetsByDate).sort().reverse();
    for (const dateKey of sortedDates) {
      const dayData = targetsByDate[dateKey];
      const completionRate =
        dayData.total > 0 ? dayData.completed / dayData.total : 0;

      if (completionRate >= 0.8) {
        // 80% completion rate considered a streak day
        currentStreak++;
      } else {
        break;
      }
    }

    return currentStreak;
  } catch (error) {
    console.error("Error calculating streaks:", error);
    return 0;
  }
};

export const calculateWeeklyCompletion = async (userId, weekOffset = 0) => {
  try {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - weekOffset * 7);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const targets = await Target.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    if (targets.length === 0) return 0;

    const completedTargets = targets.filter(
      (target) => target.completed,
    ).length;
    return Math.round((completedTargets / targets.length) * 100);
  } catch (error) {
    console.error("Error calculating weekly completion:", error);
    return 0;
  }
};

export const calculateMonthlyCompletion = async (userId, monthOffset = 0) => {
  try {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() - monthOffset);
    endDate.setDate(0); // Last day of previous month
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const targets = await Target.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    if (targets.length === 0) return 0;

    const completedTargets = targets.filter(
      (target) => target.completed,
    ).length;
    return Math.round((completedTargets / targets.length) * 100);
  } catch (error) {
    console.error("Error calculating monthly completion:", error);
    return 0;
  }
};

export const getWeeklyData = async (userId, weekOffset = 0) => {
  try {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - weekOffset * 7);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const targets = await Target.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Group by day
    const weekData = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const dayTargets = targets.filter(
        (target) =>
          target.date.toISOString().split("T")[0] ===
          currentDate.toISOString().split("T")[0],
      );

      const completed = dayTargets.filter((target) => target.completed).length;
      const total = dayTargets.length;
      const completion = total > 0 ? Math.round((completed / total) * 100) : 0;

      weekData.push({
        day: days[currentDate.getDay()],
        completion,
        completed,
        total,
      });
    }

    return weekData;
  } catch (error) {
    console.error("Error getting weekly data:", error);
    return [];
  }
};

export const analyzeStrengthsAndWeaknesses = async (userId) => {
  try {
    const goals = await Goal.find({ userId, isActive: true });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const categoryStats = {};

    for (const goal of goals) {
      const targets = await Target.find({
        userId,
        goalId: goal._id,
        date: { $gte: thirtyDaysAgo },
      });

      if (targets.length > 0) {
        const completedTargets = targets.filter(
          (target) => target.completed,
        ).length;
        const completionRate = Math.round(
          (completedTargets / targets.length) * 100,
        );

        if (!categoryStats[goal.category]) {
          categoryStats[goal.category] = [];
        }
        categoryStats[goal.category].push(completionRate);
      }
    }

    // Calculate average completion rate per category
    const categoryAverages = {};
    Object.keys(categoryStats).forEach((category) => {
      const rates = categoryStats[category];
      categoryAverages[category] = Math.round(
        rates.reduce((sum, rate) => sum + rate, 0) / rates.length,
      );
    });

    // Determine strengths (>75%) and improvement areas (<60%)
    const strengths = [];
    const improvementAreas = [];

    Object.entries(categoryAverages).forEach(([category, rate]) => {
      if (rate >= 75) {
        strengths.push(category);
      } else if (rate < 60) {
        improvementAreas.push(category);
      }
    });

    return { strengths, improvementAreas, categoryAverages };
  } catch (error) {
    console.error("Error analyzing strengths and weaknesses:", error);
    return { strengths: [], improvementAreas: [], categoryAverages: {} };
  }
};

export const calculateHabitStrength = async (userId) => {
  try {
    const goals = await Goal.find({ userId, isActive: true, type: "daily" });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const habitStrength = {};

    for (const goal of goals) {
      const targets = await Target.find({
        userId,
        goalId: goal._id,
        date: { $gte: thirtyDaysAgo },
      });

      if (targets.length > 0) {
        const completedTargets = targets.filter(
          (target) => target.completed,
        ).length;
        const completionRate = Math.round(
          (completedTargets / targets.length) * 100,
        );

        habitStrength[goal.title] = completionRate;
      }
    }

    return habitStrength;
  } catch (error) {
    console.error("Error calculating habit strength:", error);
    return {};
  }
};
