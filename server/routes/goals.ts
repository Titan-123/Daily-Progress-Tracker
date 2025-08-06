import { RequestHandler } from "express";

// Mock goals data
let goals = [
  {
    id: "1",
    title: "Write 500 words",
    description: "Creative writing practice to develop my storytelling skills",
    type: "daily",
    category: "Creative",
    target: "500 words",
    streak: 7,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    title: "Study programming",
    description:
      "Focus on JavaScript fundamentals and practice coding challenges",
    type: "daily",
    category: "Learning",
    target: "2 hours",
    streak: 12,
    isActive: true,
    createdAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "3",
    title: "Exercise routine",
    description: "Morning workout to stay healthy and energized",
    type: "daily",
    category: "Health",
    target: "30 minutes",
    streak: 5,
    isActive: true,
    createdAt: "2024-01-05T00:00:00Z",
  },
  {
    id: "4",
    title: "Read books",
    description: "Expand knowledge and enjoy fiction",
    type: "weekly",
    category: "Learning",
    target: "3 books",
    streak: 2,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
];

export const handleGetGoals: RequestHandler = (_req, res) => {
  res.json(goals);
};

export const handleCreateGoal: RequestHandler = (req, res) => {
  const { title, description, type, category, target } = req.body;

  if (!title || !description || !type || !category || !target) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newGoal = {
    id: Date.now().toString(),
    title,
    description,
    type,
    category,
    target,
    streak: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  goals.push(newGoal);
  res.status(201).json(newGoal);
};

export const handleUpdateGoal: RequestHandler = (req, res) => {
  const { goalId } = req.params;
  const updates = req.body;

  const goalIndex = goals.findIndex((g) => g.id === goalId);
  if (goalIndex === -1) {
    return res.status(404).json({ error: "Goal not found" });
  }

  goals[goalIndex] = { ...goals[goalIndex], ...updates };
  res.json(goals[goalIndex]);
};

export const handleDeleteGoal: RequestHandler = (req, res) => {
  const { goalId } = req.params;

  const goalIndex = goals.findIndex((g) => g.id === goalId);
  if (goalIndex === -1) {
    return res.status(404).json({ error: "Goal not found" });
  }

  goals.splice(goalIndex, 1);
  res.status(204).send();
};

export const handleToggleGoalStatus: RequestHandler = (req, res) => {
  const { goalId } = req.params;

  const goalIndex = goals.findIndex((g) => g.id === goalId);
  if (goalIndex === -1) {
    return res.status(404).json({ error: "Goal not found" });
  }

  goals[goalIndex] = {
    ...goals[goalIndex],
    isActive: !goals[goalIndex].isActive,
  };

  res.json(goals[goalIndex]);
};
