import Goal from "../models/Goal.js";
import Target from "../models/Target.js";
import DayEntry from "../models/DayEntry.js";

// Helper function to format date as local YYYY-MM-DD string
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Hardcoded achievement definitions
const ACHIEVEMENT_DEFINITIONS = [
  {
    id: "first_goal",
    title: "Goal Setter",
    description: "Created your first goal",
    icon: "🎯",
    criteria: "hasCreatedFirstGoal",
  },
  {
    id: "first_completion",
    title: "First Victory",
    description: "Completed your first daily target",
    icon: "✅",
    criteria: "hasCompletedFirstTarget",
  },
  {
    id: "three_day_streak",
    title: "Momentum Builder",
    description: "Completed targets for 3 days in a row",
    icon: "🔥",
    criteria: "hasThreeDayStreak",
  },
  {
    id: "seven_day_streak",
    title: "Week Warrior",
    description: "Completed targets for 7 days straight",
    icon: "⚡",
    criteria: "hasSevenDayStreak",
  },
  {
    id: "early_bird",
    title: "Early Bird",
    description: "Completed a target before 9 AM",
    icon: "🌅",
    criteria: "hasEarlyCompletion",
  },
  {
    id: "consistency_master",
    title: "Consistency Master",
    description: "Hit 90% completion rate for a week",
    icon: "⭐",
    criteria: "hasWeeklyConsistency",
  },
  {
    id: "five_goals",
    title: "Ambitious Planner",
    description: "Created 5 different goals",
    icon: "📋",
    criteria: "hasFiveGoals",
  },
];

// Achievement criteria check functions
const achievementCheckers = {
  // Check if user has created their first goal
  async hasCreatedFirstGoal(userId) {
    const goalCount = await Goal.countDocuments({ userId });
    return goalCount > 0;
  },

  // Check if user has completed their first target
  async hasCompletedFirstTarget(userId) {
    const completedTarget = await Target.findOne({ userId, completed: true });
    return !!completedTarget;
  },

  // Check if user has a 3-day streak
  async hasThreeDayStreak(userId) {
    const streak = await calculateCurrentStreak(userId);
    return streak >= 3;
  },

  // Check if user has a 7-day streak
  async hasSevenDayStreak(userId) {
    const streak = await calculateCurrentStreak(userId);
    return streak >= 7;
  },

  // Check if user completed a target before 9 AM
  async hasEarlyCompletion(userId) {
    const targets = await Target.find({ userId, completed: true });

    for (const target of targets) {
      if (target.completedAt) {
        const completionHour = new Date(target.completedAt).getHours();
        if (completionHour < 9) {
          return true;
        }
      }
    }
    return false;
  },

  // Check if user has 90% completion rate for any week
  async hasWeeklyConsistency(userId) {
    // Get the last 4 weeks of data
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

    const targets = await Target.find({
      userId,
      date: { $gte: fourWeeksAgo },
    }).sort({ date: 1 });

    // Group by week
    const weeks = {};
    targets.forEach((target) => {
      const weekStart = new Date(target.date);
      const dayOfWeek = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - dayOfWeek); // Start of week
      const weekKey = formatLocalDate(weekStart);

      if (!weeks[weekKey]) {
        weeks[weekKey] = { total: 0, completed: 0 };
      }
      weeks[weekKey].total++;
      if (target.completed) {
        weeks[weekKey].completed++;
      }
    });

    // Check if any week has 90% completion
    for (const week of Object.values(weeks)) {
      if (week.total > 0 && week.completed / week.total >= 0.9) {
        return true;
      }
    }
    return false;
  },

  // Check if user has created 5 goals
  async hasFiveGoals(userId) {
    const goalCount = await Goal.countDocuments({ userId });
    return goalCount >= 5;
  },
};

// Calculate current streak for a user
async function calculateCurrentStreak(userId) {
  const targets = await Target.find({ userId }).sort({ date: -1 });

  if (targets.length === 0) return 0;

  // Group targets by date
  const targetsByDate = {};
  targets.forEach((target) => {
    const dateKey = formatLocalDate(target.date);
    if (!targetsByDate[dateKey]) {
      targetsByDate[dateKey] = [];
    }
    targetsByDate[dateKey].push(target);
  });

  // Calculate streak
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  while (true) {
    const dateKey = formatLocalDate(currentDate);
    const dayTargets = targetsByDate[dateKey];

    if (!dayTargets || dayTargets.length === 0) {
      // No targets for this day, check previous day
      currentDate.setDate(currentDate.getDate() - 1);
      continue;
    }

    const completedTargets = dayTargets.filter((t) => t.completed).length;
    const totalTargets = dayTargets.length;

    // If all targets are completed for this day, increment streak
    if (completedTargets === totalTargets && totalTargets > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Main function to calculate unlocked achievements for a user
export async function calculateUserAchievements(userId) {
  const unlockedAchievements = [];

  for (const achievement of ACHIEVEMENT_DEFINITIONS) {
    const checker = achievementCheckers[achievement.criteria];
    if (checker) {
      try {
        const isUnlocked = await checker(userId);
        if (isUnlocked) {
          unlockedAchievements.push({
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            earned: true,
          });
        }
      } catch (error) {
        console.error(`Error checking achievement ${achievement.id}:`, error);
      }
    }
  }

  return unlockedAchievements;
}

// Get all achievement definitions (for showing what's available)
export function getAllAchievementDefinitions() {
  return ACHIEVEMENT_DEFINITIONS.map((achievement) => ({
    id: achievement.id,
    title: achievement.title,
    description: achievement.description,
    icon: achievement.icon,
    earned: false, // Default to not earned
  }));
}
