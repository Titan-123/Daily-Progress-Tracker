import mongoose from "mongoose";
import { addDemoGoal, getDemoDashboardTargets } from "../utils/demoUserStore.js";

// Only import MongoDB models if mongoose is connected
let Goal, Target;

const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Dynamically import MongoDB-dependent modules
const loadMongoModules = async () => {
  if (isMongoConnected()) {
    try {
      const [goalModule, targetModule] = await Promise.all([
        import("../models/Goal.js"),
        import("../models/Target.js"),
      ]);

      Goal = goalModule.default;
      Target = targetModule.default;

      return true;
    } catch (error) {
      console.error("Error loading MongoDB modules:", error);
      return false;
    }
  }
  return false;
};

export const handleGetGoals = async (req, res) => {
  const mongoReady = await loadMongoModules();

  if (!mongoReady) {
    return res.status(500).json({ error: "Database not connected" });
  }

  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Handle demo user separately
    if (userId === "demo-user-123") {
      // For demo user, convert dashboard targets to goals format
      const dashboardTargets = getDemoDashboardTargets();
      const demoGoals = dashboardTargets.map(target => ({
        id: target.id,
        title: target.title,
        description: target.description,
        type: target.type,
        category: target.category,
        target: target.target || "Daily completion",
        streak: target.streak,
        isActive: true,
        createdAt: new Date().toISOString(),
      }));
      return res.json(demoGoals);
    }

    const goals = await Goal.find({ userId }).sort({ createdAt: -1 });

    const formattedGoals = goals.map((goal) => ({
      id: goal._id.toString(),
      title: goal.title,
      description: goal.description,
      type: goal.type,
      category: goal.category,
      target: goal.target,
      streak: goal.streak,
      isActive: goal.isActive,
      createdAt: goal.createdAt.toISOString(),
    }));

    res.json(formattedGoals);
  } catch (error) {
    console.error("Get goals error:", error);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};

export const handleCreateGoal = async (req, res) => {
  const mongoReady = await loadMongoModules();

  if (!mongoReady) {
    return res.status(500).json({ error: "Database not connected" });
  }

  try {
    const { title, description, type, category, target } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!title || !description || !type || !category || !target) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Handle demo user separately
    if (userId === "demo-user-123") {
      const newGoal = addDemoGoal({ title, description, type, category, target });
      return res.status(201).json(newGoal);
    }

    const goal = new Goal({
      title,
      description,
      type,
      category,
      target,
      userId,
      streak: 0,
      isActive: true,
    });

    await goal.save();

    // If it's a daily goal, automatically create a target for today
    if (type === "daily" && goal.isActive) {
      // Use local date to avoid timezone issues
      const today = new Date();
      const localToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );

      const tomorrow = new Date(localToday);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Check if a target already exists for today
      const existingTarget = await Target.findOne({
        userId,
        goalId: goal._id,
        date: { $gte: localToday, $lt: tomorrow },
      });

      if (!existingTarget) {
        const newTarget = new Target({
          title: goal.title,
          description: goal.description,
          type: goal.type,
          userId: goal.userId,
          goalId: goal._id,
          date: localToday,
          completed: false,
          streak: 0,
        });

        await newTarget.save();
        console.log(
          `✅ Created today's target for new daily goal: ${goal.title}`,
        );
      }
    }

    res.status(201).json({
      id: goal._id.toString(),
      title: goal.title,
      description: goal.description,
      type: goal.type,
      category: goal.category,
      target: goal.target,
      streak: goal.streak,
      isActive: goal.isActive,
      createdAt: goal.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Create goal error:", error);
    res.status(500).json({ error: "Failed to create goal" });
  }
};

export const handleUpdateGoal = async (req, res) => {
  const mongoReady = await loadMongoModules();

  if (!mongoReady) {
    return res.status(500).json({ error: "Database not connected" });
  }

  try {
    const { goalId } = req.params;
    const updates = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    Object.assign(goal, updates);
    await goal.save();

    res.json({
      id: goal._id.toString(),
      title: goal.title,
      description: goal.description,
      type: goal.type,
      category: goal.category,
      target: goal.target,
      streak: goal.streak,
      isActive: goal.isActive,
      createdAt: goal.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Update goal error:", error);
    res.status(500).json({ error: "Failed to update goal" });
  }
};

export const handleDeleteGoal = async (req, res) => {
  const mongoReady = await loadMongoModules();

  if (!mongoReady) {
    return res.status(500).json({ error: "Database not connected" });
  }

  try {
    const { goalId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    console.log(`Attempting to delete goal ${goalId} for user ${userId}`);

    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      console.log(`Goal ${goalId} not found for user ${userId}`);
      return res.status(404).json({ error: "Goal not found" });
    }

    // Delete related targets first
    const deletedTargets = await Target.deleteMany({ goalId: goal._id });
    console.log(`Deleted ${deletedTargets.deletedCount} related targets`);

    // Delete the goal
    await Goal.findByIdAndDelete(goalId);
    console.log(`Successfully deleted goal ${goalId}`);

    res.status(204).send();
  } catch (error) {
    console.error("Delete goal error:", error);
    res.status(500).json({ error: "Failed to delete goal" });
  }
};

export const handleToggleGoalStatus = async (req, res) => {
  const mongoReady = await loadMongoModules();

  if (!mongoReady) {
    return res.status(500).json({ error: "Database not connected" });
  }

  try {
    const { goalId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    goal.isActive = !goal.isActive;
    await goal.save();

    res.json({
      id: goal._id.toString(),
      title: goal.title,
      description: goal.description,
      type: goal.type,
      category: goal.category,
      target: goal.target,
      streak: goal.streak,
      isActive: goal.isActive,
      createdAt: goal.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Toggle goal status error:", error);
    res.status(500).json({ error: "Failed to toggle goal status" });
  }
};
