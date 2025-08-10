import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleGetDashboard, handleToggleTarget } from "./routes/dashboard";
import {
  handleGetGoals,
  handleCreateGoal,
  handleUpdateGoal,
  handleDeleteGoal,
  handleToggleGoalStatus,
} from "./routes/goals";
import {
  handleGetAnalytics,
  handleGetWeeklyData,
  handleGetMonthlyTrends,
} from "./routes/analytics";
import {
  handleGetCalendarData,
  handleGetDayData,
  handleSaveReflection,
  handleUpdateMood,
  handleAddHighlight,
} from "./routes/calendar";
import {
  handleUpgradeSubscription,
  handleGetSubscription,
  handleCancelSubscription,
} from "./routes/subscription";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Dashboard API routes
  app.get("/api/dashboard", handleGetDashboard);
  app.post("/api/targets/:targetId/toggle", handleToggleTarget);

  // Goals API routes
  app.get("/api/goals", handleGetGoals);
  app.post("/api/goals", handleCreateGoal);
  app.patch("/api/goals/:goalId", handleUpdateGoal);
  app.delete("/api/goals/:goalId", handleDeleteGoal);
  app.post("/api/goals/:goalId/toggle", handleToggleGoalStatus);

  // Analytics API routes
  app.get("/api/analytics", handleGetAnalytics);
  app.get("/api/analytics/weekly", handleGetWeeklyData);
  app.get("/api/analytics/monthly", handleGetMonthlyTrends);

  // Calendar API routes
  app.get("/api/calendar", handleGetCalendarData);
  app.get("/api/calendar/day/:date", handleGetDayData);
  app.post("/api/calendar/day/:date/reflection", handleSaveReflection);
  app.post("/api/calendar/day/:date/mood", handleUpdateMood);
  app.post("/api/calendar/day/:date/highlights", handleAddHighlight);

  // Subscription API routes
  app.post("/api/subscription/upgrade", handleUpgradeSubscription);
  app.get("/api/subscription", handleGetSubscription);
  app.post("/api/subscription/cancel", handleCancelSubscription);

  return app;
}
