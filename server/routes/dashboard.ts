import { RequestHandler } from "express";

// Mock data for dashboard
const mockDashboardData = {
  targets: [
    {
      id: "1",
      title: "Write 500 words",
      description: "Creative writing practice",
      type: "daily",
      completed: false,
      streak: 3,
    },
    {
      id: "2",
      title: "Study for 2 hours",
      description: "Focus on JavaScript fundamentals",
      type: "daily",
      completed: true,
      streak: 7,
    },
    {
      id: "3",
      title: "Exercise 30 minutes",
      description: "Morning workout routine",
      type: "daily",
      completed: false,
      streak: 2,
    },
  ],
  achievements: [
    {
      id: "1",
      title: "7-Day Streak",
      description: "Completed daily goals for a week!",
      icon: "🔥",
      earned: true,
    },
    {
      id: "2",
      title: "Early Bird",
      description: "Started progress tracking before 8 AM",
      icon: "🌅",
      earned: true,
    },
    {
      id: "3",
      title: "Consistency Master",
      description: "Hit 90% weekly completion rate",
      icon: "⭐",
      earned: false,
    },
  ],
  weeklyProgress: 85,
  totalStreak: 12,
};

// In-memory storage for targets (in a real app, this would be a database)
let targets = [...mockDashboardData.targets];

export const handleGetDashboard: RequestHandler = (_req, res) => {
  res.json({
    ...mockDashboardData,
    targets: targets,
  });
};

export const handleToggleTarget: RequestHandler = (req, res) => {
  const { targetId } = req.params;

  const targetIndex = targets.findIndex((t) => t.id === targetId);
  if (targetIndex === -1) {
    return res.status(404).json({ error: "Target not found" });
  }

  // Toggle the completed status
  targets[targetIndex] = {
    ...targets[targetIndex],
    completed: !targets[targetIndex].completed,
    // Update streak logic could go here
  };

  res.json(targets[targetIndex]);
};
