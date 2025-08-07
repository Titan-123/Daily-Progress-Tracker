import Goal from "../models/Goal.js";
import Target from "../models/Target.js";

// For demo purposes, we'll use a default user ID
const DEFAULT_USER_ID = "60d0fe4f5311236168a109ca";

export const handleGetGoals = async (req, res) => {
  try {
    const userId = req.user?.id || DEFAULT_USER_ID;

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
  try {
    const { title, description, type, category, target } = req.body;
    const userId = req.user?.id || DEFAULT_USER_ID;

    if (!title || !description || !type || !category || !target) {
      return res.status(400).json({ error: "Missing required fields" });
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
  try {
    const { goalId } = req.params;
    const updates = req.body;
    const userId = req.user?.id || DEFAULT_USER_ID;

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
  try {
    const { goalId } = req.params;
    const userId = req.user?.id || DEFAULT_USER_ID;

    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    // Also delete related targets
    await Target.deleteMany({ goalId: goal._id });

    await Goal.findByIdAndDelete(goalId);

    res.status(204).send();
  } catch (error) {
    console.error("Delete goal error:", error);
    res.status(500).json({ error: "Failed to delete goal" });
  }
};

export const handleToggleGoalStatus = async (req, res) => {
  try {
    const { goalId } = req.params;
    const userId = req.user?.id || DEFAULT_USER_ID;

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
