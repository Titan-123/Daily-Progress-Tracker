import mongoose from "mongoose";
import connectDB from "./config/database.js";
import User from "./models/User.js";
import Goal from "./models/Goal.js";
import Target from "./models/Target.js";
import DayEntry from "./models/DayEntry.js";
import { Achievement, UserAchievement } from "./models/Achievement.js";

const DEFAULT_USER_ID = "60d0fe4f5311236168a109ca";

const seedData = async () => {
  try {
    await connectDB();

    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Goal.deleteMany({}),
      Target.deleteMany({}),
      DayEntry.deleteMany({}),
      Achievement.deleteMany({}),
      UserAchievement.deleteMany({}),
    ]);

    // Create default user
    const user = new User({
      _id: DEFAULT_USER_ID,
      name: "Demo User",
      email: "demo@example.com",
      password: "password123",
      timezone: "UTC",
      preferences: {
        theme: "light",
        notifications: true,
        reminderTime: "09:00",
      },
      streaks: {
        current: 5,
        best: 12,
        lastActiveDate: new Date(),
      },
    });
    await user.save();
    console.log("✅ Created demo user");

    // Create default goals
    const goals = [
      {
        title: "Write 500 words",
        description:
          "Creative writing practice to develop my storytelling skills",
        type: "daily",
        category: "Creative",
        target: "500 words",
        userId: DEFAULT_USER_ID,
        streak: 7,
        isActive: true,
      },
      {
        title: "Study programming",
        description:
          "Focus on JavaScript fundamentals and practice coding challenges",
        type: "daily",
        category: "Learning",
        target: "2 hours",
        userId: DEFAULT_USER_ID,
        streak: 12,
        isActive: true,
      },
      {
        title: "Exercise routine",
        description: "Morning workout to stay healthy and energized",
        type: "daily",
        category: "Health",
        target: "30 minutes",
        userId: DEFAULT_USER_ID,
        streak: 5,
        isActive: true,
      },
      {
        title: "Read books",
        description: "Expand knowledge and enjoy fiction",
        type: "weekly",
        category: "Learning",
        target: "2 books",
        userId: DEFAULT_USER_ID,
        streak: 2,
        isActive: true,
      },
      {
        title: "Complete a project",
        description: "Finish and ship a meaningful coding project",
        type: "monthly",
        category: "Professional",
        target: "1 project",
        userId: DEFAULT_USER_ID,
        streak: 1,
        isActive: true,
      },
    ];

    const createdGoals = await Goal.insertMany(goals);
    console.log("✅ Created default goals");

    // Create targets for the past week
    const today = new Date();
    const targets = [];

    for (let i = 7; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      targetDate.setHours(0, 0, 0, 0);

      // Create daily targets
      const dailyGoals = createdGoals.filter((g) => g.type === "daily");

      for (const goal of dailyGoals) {
        const completed = Math.random() > 0.3; // 70% completion rate

        targets.push({
          title: goal.title,
          description: goal.description,
          type: goal.type,
          completed,
          streak: completed ? goal.streak : 0,
          date: targetDate,
          userId: DEFAULT_USER_ID,
          goalId: goal._id,
          completedAt: completed
            ? new Date(
                targetDate.getTime() + Math.random() * 24 * 60 * 60 * 1000,
              )
            : null,
        });
      }
    }

    await Target.insertMany(targets);
    console.log("✅ Created targets for the past week");

    // Create some day entries
    const dayEntries = [];
    for (let i = 5; i >= 0; i--) {
      const entryDate = new Date(today);
      entryDate.setDate(today.getDate() - i);
      entryDate.setHours(0, 0, 0, 0);

      const dayTargets = targets.filter(
        (t) => t.date.toDateString() === entryDate.toDateString(),
      );

      const completed = dayTargets.filter((t) => t.completed).length;
      const total = dayTargets.length;

      const reflections = [
        "Great day! Felt productive and focused on my goals.",
        "Had some challenges but managed to push through most tasks.",
        "Amazing progress today! Really proud of my consistency.",
        "Tough day but I'm learning to be kind to myself.",
        "Fantastic momentum! The habits are really building up.",
        "Good day overall, excited to continue tomorrow!",
      ];

      const moods = ["excellent", "good", "okay", "difficult"];
      const mood =
        completed / total >= 0.8
          ? "excellent"
          : completed / total >= 0.6
            ? "good"
            : completed / total >= 0.3
              ? "okay"
              : "difficult";

      dayEntries.push({
        date: entryDate,
        userId: DEFAULT_USER_ID,
        reflection: reflections[Math.floor(Math.random() * reflections.length)],
        mood,
        highlights:
          completed >= 2
            ? [
                "Made significant progress on writing",
                "Had a great workout session",
                "Learned something new today",
              ].slice(0, Math.min(completed, 3))
            : [],
        completed,
        total,
        targets: dayTargets.map((t) => ({
          id: t.goalId,
          title: t.title,
          completed: t.completed,
          category:
            createdGoals.find((g) => g._id.equals(t.goalId))?.category ||
            "General",
        })),
      });
    }

    await DayEntry.insertMany(dayEntries);
    console.log("✅ Created day entries with reflections");

    // Create default achievements
    const achievements = [
      {
        title: "7-Day Streak",
        description: "Completed daily goals for a week!",
        icon: "🔥",
        type: "streak",
        criteria: { streakDays: 7 },
        isGlobal: true,
      },
      {
        title: "Early Bird",
        description: "Started progress tracking before 8 AM",
        icon: "🌅",
        type: "special",
        criteria: {},
        isGlobal: true,
      },
      {
        title: "Consistency Master",
        description: "Hit 90% weekly completion rate",
        icon: "⭐",
        type: "consistency",
        criteria: { completionRate: 90 },
        isGlobal: true,
      },
      {
        title: "Goal Setter",
        description: "Created your first goal!",
        icon: "🎯",
        type: "milestone",
        criteria: { targetCount: 1 },
        isGlobal: true,
      },
      {
        title: "Habit Builder",
        description: "Completed 50 targets total",
        icon: "🏗️",
        type: "milestone",
        criteria: { targetCount: 50 },
        isGlobal: true,
      },
    ];

    const createdAchievements = await Achievement.insertMany(achievements);
    console.log("✅ Created default achievements");

    // Award some achievements to the user
    const userAchievements = [
      {
        userId: DEFAULT_USER_ID,
        achievementId: createdAchievements[0]._id, // 7-Day Streak
        earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        progress: 100,
      },
      {
        userId: DEFAULT_USER_ID,
        achievementId: createdAchievements[3]._id, // Goal Setter
        earnedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        progress: 100,
      },
    ];

    await UserAchievement.insertMany(userAchievements);
    console.log("✅ Awarded achievements to user");

    console.log("🎉 Database seeding completed successfully!");

    // Display summary
    console.log("\n📊 Seeded Data Summary:");
    console.log(`👤 Users: ${await User.countDocuments()}`);
    console.log(`🎯 Goals: ${await Goal.countDocuments()}`);
    console.log(`📝 Targets: ${await Target.countDocuments()}`);
    console.log(`📅 Day Entries: ${await DayEntry.countDocuments()}`);
    console.log(`🏆 Achievements: ${await Achievement.countDocuments()}`);
    console.log(
      `🎖️ User Achievements: ${await UserAchievement.countDocuments()}`,
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed script
seedData();
