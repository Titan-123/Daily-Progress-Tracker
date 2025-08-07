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

  // Auth routes (no authentication required)
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);

  // Protected routes (authentication required)
  app.get("/api/auth/profile", authenticateToken, handleGetProfile);
  app.patch("/api/auth/profile", authenticateToken, handleUpdateProfile);

  // Dashboard API routes (authentication required)
  app.get("/api/dashboard", authenticateToken, handleGetDashboard);
  app.post("/api/targets/:targetId/toggle", authenticateToken, handleToggleTarget);

  // Goals API routes (authentication required)
  app.get("/api/goals", authenticateToken, handleGetGoals);
  app.post("/api/goals", authenticateToken, handleCreateGoal);
  app.patch("/api/goals/:goalId", authenticateToken, handleUpdateGoal);
  app.delete("/api/goals/:goalId", authenticateToken, handleDeleteGoal);
  app.post("/api/goals/:goalId/toggle", authenticateToken, handleToggleGoalStatus);

  // Analytics API routes (authentication required)
  app.get("/api/analytics", authenticateToken, handleGetAnalytics);
  app.get("/api/analytics/weekly", authenticateToken, handleGetWeeklyData);
  app.get("/api/analytics/monthly", authenticateToken, handleGetMonthlyTrends);

  // Calendar API routes (authentication required)
  app.get("/api/calendar", authenticateToken, handleGetCalendarData);
  app.get("/api/calendar/day/:date", authenticateToken, handleGetDayData);
  app.post("/api/calendar/day/:date/reflection", authenticateToken, handleSaveReflection);
  app.post("/api/calendar/day/:date/mood", authenticateToken, handleUpdateMood);
  app.post("/api/calendar/day/:date/highlights", authenticateToken, handleAddHighlight);

  // Error handling middleware
  app.use((error, req, res, next) => {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
