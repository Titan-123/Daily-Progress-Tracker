import DayEntry from "../models/DayEntry.js";
import Target from "../models/Target.js";
import { getDemoCalendarData, setDemoCalendarData, updateDemoCalendarReflection } from "../utils/demoUserStore.js";
import Goal from "../models/Goal.js";
import { getDemoDashboardTargets } from "../utils/demoUserStore.js";

export const handleGetCalendarData = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    let startDate, endDate;

    if (month && year) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Default to current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    // Get all day entries for the month
    const dayEntries = await DayEntry.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    // Convert to the format expected by frontend
    const calendarData = {};

    for (const entry of dayEntries) {
      const dateKey = entry.date.toISOString().split("T")[0];

      // Get targets for this day to populate the targets array
      const dayStart = new Date(entry.date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(entry.date);
      dayEnd.setHours(23, 59, 59, 999);

      const targets = await Target.find({
        userId,
        date: { $gte: dayStart, $lte: dayEnd },
      }).populate("goalId");

      const formattedTargets = targets.map((target) => ({
        id: target._id.toString(),
        title: target.title,
        description: target.description,
        completed: target.completed,
        category: target.goalId?.category || "General",
        type: target.type,
        streak: target.streak,
      }));

      calendarData[dateKey] = {
        date: dateKey,
        completed: entry.completed,
        total: entry.total,
        targets: formattedTargets,
        reflection: entry.reflection,
        mood: entry.mood,
        highlights: entry.highlights,
      };
    }

    // Also get days that have targets but no day entry
    const allTargets = await Target.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).populate("goalId");

    // Group targets by date
    const targetsByDate = {};
    allTargets.forEach((target) => {
      const dateKey = target.date.toISOString().split("T")[0];
      if (!targetsByDate[dateKey]) {
        targetsByDate[dateKey] = [];
      }
      targetsByDate[dateKey].push(target);
    });

    // Add calendar entries for dates with targets but no day entry
    Object.keys(targetsByDate).forEach((dateKey) => {
      if (!calendarData[dateKey]) {
        const dayTargets = targetsByDate[dateKey];
        const completed = dayTargets.filter((t) => t.completed).length;
        const total = dayTargets.length;

        calendarData[dateKey] = {
          date: dateKey,
          completed,
          total,
          targets: dayTargets.map((target) => ({
            id: target._id.toString(),
            title: target.title,
            description: target.description,
            completed: target.completed,
            category: target.goalId?.category || "General",
            type: target.type,
            streak: target.streak,
          })),
          reflection: "",
          mood: undefined,
          highlights: [],
        };
      }
    });

    res.json(calendarData);
  } catch (error) {
    console.error("Calendar data error:", error);
    res.status(500).json({ error: "Failed to load calendar data" });
  }
};

export const handleGetDayData = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const dayDate = new Date(date);

    // Try to find existing day entry
    let dayEntry = await DayEntry.findOne({ userId, date: dayDate });

    // If no day entry exists, create one from targets
    if (!dayEntry) {
      const dayStart = new Date(dayDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayDate);
      dayEnd.setHours(23, 59, 59, 999);

      const targets = await Target.find({
        userId,
        date: { $gte: dayStart, $lte: dayEnd },
      }).populate("goalId");

      if (targets.length > 0) {
        const completed = targets.filter((t) => t.completed).length;
        const total = targets.length;

        dayEntry = new DayEntry({
          date: dayDate,
          userId,
          completed,
          total,
          targets: targets.map((target) => ({
            id: target._id,
            title: target.title,
            description: target.description,
            completed: target.completed,
            category: target.goalId?.category || "General",
            type: target.type,
            streak: target.streak,
          })),
        });

        await dayEntry.save();
      } else {
        return res.status(404).json({ error: "Day data not found" });
      }
    }

    res.json({
      date: dayEntry.date.toISOString().split("T")[0],
      completed: dayEntry.completed,
      total: dayEntry.total,
      targets: dayEntry.targets,
      reflection: dayEntry.reflection,
      mood: dayEntry.mood,
      highlights: dayEntry.highlights,
    });
  } catch (error) {
    console.error("Day data error:", error);
    res.status(500).json({ error: "Failed to load day data" });
  }
};

export const handleSaveReflection = async (req, res) => {
  try {
    const { date } = req.params;
    const { reflection } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!reflection) {
      return res.status(400).json({ error: "Reflection is required" });
    }

    // Handle demo user separately
    if (userId === "demo-user-123") {
      // Get existing calendar data for this day or create new
      let existingDayData = getDemoCalendarData(date);

      if (existingDayData) {
        // Update only the reflection, preserve existing targets and completion
        const updatedDay = updateDemoCalendarReflection(date, reflection);
        return res.json(updatedDay);
      } else {
        // If no existing data, this shouldn't happen if they opened the modal,
        // but create minimal data
        const newDayData = {
          date: date,
          completed: 0,
          total: 0,
          targets: [],
          reflection: reflection,
          mood: undefined,
          highlights: [],
        };
        setDemoCalendarData(date, newDayData);
        return res.json(newDayData);
      }
    }

    const dayDate = new Date(date);

    let dayEntry = await DayEntry.findOne({ userId, date: dayDate });

    if (!dayEntry) {
      // Get user's active daily goals to create targets
      const activeGoals = await Goal.find({
        userId,
        type: "daily",
        isActive: true
      });

      const targets = activeGoals.map(goal => ({
        id: goal._id.toString(),
        title: goal.title,
        description: goal.description,
        completed: false,
        category: goal.category,
        type: goal.type,
        streak: goal.streak || 0,
      }));

      // Create new day entry with current daily goals
      dayEntry = new DayEntry({
        date: dayDate,
        userId,
        reflection,
        completed: 0,
        total: targets.length,
        targets: targets,
      });
    } else {
      // Just update the reflection, preserve existing targets
      dayEntry.reflection = reflection;
    }

    await dayEntry.save();

    res.json({
      date: dayEntry.date.toISOString().split("T")[0],
      completed: dayEntry.completed,
      total: dayEntry.total,
      targets: dayEntry.targets,
      reflection: dayEntry.reflection,
      mood: dayEntry.mood,
      highlights: dayEntry.highlights,
    });
  } catch (error) {
    console.error("Save reflection error:", error);
    res.status(500).json({ error: "Failed to save reflection" });
  }
};

export const handleUpdateMood = async (req, res) => {
  try {
    const { date } = req.params;
    const { mood } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!mood) {
      return res.status(400).json({ error: "Mood is required" });
    }

    // Handle demo user separately
    if (userId === "demo-user-123") {
      const dashboardTargets = getDemoDashboardTargets();
      const completedCount = dashboardTargets.filter(t => t.completed).length;

      const demoDay = {
        date: date,
        completed: completedCount,
        total: dashboardTargets.length,
        targets: dashboardTargets,
        mood: mood,
        highlights: ["Great progress today!"],
      };

      return res.json(demoDay);
    }

    const dayDate = new Date(date);

    let dayEntry = await DayEntry.findOne({ userId, date: dayDate });

    if (!dayEntry) {
      dayEntry = new DayEntry({
        date: dayDate,
        userId,
        mood,
        completed: 0,
        total: 0,
        targets: [],
      });
    } else {
      dayEntry.mood = mood;
    }

    await dayEntry.save();

    res.json({
      date: dayEntry.date.toISOString().split("T")[0],
      completed: dayEntry.completed,
      total: dayEntry.total,
      targets: dayEntry.targets,
      reflection: dayEntry.reflection,
      mood: dayEntry.mood,
      highlights: dayEntry.highlights,
    });
  } catch (error) {
    console.error("Update mood error:", error);
    res.status(500).json({ error: "Failed to update mood" });
  }
};

export const handleAddHighlight = async (req, res) => {
  try {
    const { date } = req.params;
    const { highlight } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!highlight) {
      return res.status(400).json({ error: "Highlight is required" });
    }

    // Handle demo user separately
    if (userId === "demo-user-123") {
      const dashboardTargets = getDemoDashboardTargets();
      const completedCount = dashboardTargets.filter(t => t.completed).length;

      const demoDay = {
        date: date,
        completed: completedCount,
        total: dashboardTargets.length,
        targets: dashboardTargets,
        highlights: ["Great progress today!", highlight],
      };

      return res.json(demoDay);
    }

    const dayDate = new Date(date);

    let dayEntry = await DayEntry.findOne({ userId, date: dayDate });

    if (!dayEntry) {
      dayEntry = new DayEntry({
        date: dayDate,
        userId,
        highlights: [highlight],
        completed: 0,
        total: 0,
        targets: [],
      });
    } else {
      if (!dayEntry.highlights) {
        dayEntry.highlights = [];
      }
      dayEntry.highlights.push(highlight);
    }

    await dayEntry.save();

    res.json({
      date: dayEntry.date.toISOString().split("T")[0],
      completed: dayEntry.completed,
      total: dayEntry.total,
      targets: dayEntry.targets,
      reflection: dayEntry.reflection,
      mood: dayEntry.mood,
      highlights: dayEntry.highlights,
    });
  } catch (error) {
    console.error("Add highlight error:", error);
    res.status(500).json({ error: "Failed to add highlight" });
  }
};
