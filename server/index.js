import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/database.js";
import { handleDemo } from "./routes/demo.js";
import { handleGetDashboard, handleToggleTarget } from "./routes/dashboard.js";
import {
  handleRegister,
  handleLogin,
  handleGetProfile,
  handleUpdateProfile
} from "./routes/auth.js";
import { authenticateToken, optionalAuth } from "./middleware/auth.js";
import {
  handleGetGoals,
  handleCreateGoal,
  handleUpdateGoal,
  handleDeleteGoal,
  handleToggleGoalStatus,
} from "./routes/goals.js";
import {
  handleGetAnalytics,
  handleGetWeeklyData,
  handleGetMonthlyTrends,
} from "./routes/analytics.js";
import {
  handleGetCalendarData,
  handleGetDayData,
  handleSaveReflection,
  handleUpdateMood,
  handleAddHighlight,
} from "./routes/calendar.js";

export function createServer() {
  const app = express();

  // Connect to MongoDB
  connectDB();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    const dbStatus =
      mongoose.connection.readyState === 1
        ? "MongoDB Connected"
        : "Using Fallback Data";
    res.json({
      message: ping,
      database: dbStatus,
      connectionState: mongoose.connection.readyState,
      timestamp: new Date().toISOString(),
    });
  });

  // Example API route
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

  // Error handling middleware
  app.use((error, req, res, next) => {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
