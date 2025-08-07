import Target from '../models/Target.js';
import Goal from '../models/Goal.js';
import { UserAchievement, Achievement } from '../models/Achievement.js';
import { calculateStreaks, calculateWeeklyCompletion } from '../utils/analytics.js';

// For demo purposes, we'll use a default user ID
// In a real app, this would come from authentication middleware
const DEFAULT_USER_ID = '60d0fe4f5311236168a109ca';

export const handleGetDashboard = async (req, res) => {
  try {
    const userId = req.user?.id || DEFAULT_USER_ID;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's targets
    const todayTargets = await Target.find({
      userId,
      date: { $gte: today, $lt: tomorrow }
    }).populate('goalId');

    // If no targets for today, create them from active goals
    if (todayTargets.length === 0) {
      const activeGoals = await Goal.find({ userId, isActive: true, type: 'daily' });
      
      const newTargets = [];
      for (const goal of activeGoals) {
        const target = new Target({
          title: goal.title,
          description: goal.description,
          type: goal.type,
          userId: goal.userId,
          goalId: goal._id,
          date: today,
          completed: false,
          streak: goal.streak
        });
        newTargets.push(await target.save());
      }
      
      // Populate the goalId for the response
      const populatedTargets = await Target.populate(newTargets, { path: 'goalId' });
      todayTargets.push(...populatedTargets);
    }

    // Format targets for frontend
    const targets = todayTargets.map(target => ({
      id: target._id.toString(),
      title: target.title,
      description: target.description,
      type: target.type,
      completed: target.completed,
      streak: target.streak
    }));

    // Get user achievements
    const userAchievements = await UserAchievement.find({ userId })
      .populate('achievementId')
      .sort({ earnedAt: -1 })
      .limit(10);

    const achievements = userAchievements.map(ua => ({
      id: ua.achievementId._id.toString(),
      title: ua.achievementId.title,
      description: ua.achievementId.description,
      icon: ua.achievementId.icon,
      earned: true
    }));

    // Add some default achievements if none exist
    if (achievements.length === 0) {
      achievements.push(
        {
          id: '1',
          title: '7-Day Streak',
          description: 'Completed daily goals for a week!',
          icon: '🔥',
          earned: false
        },
        {
          id: '2',
          title: 'Early Bird',
          description: 'Started progress tracking before 8 AM',
          icon: '🌅',
          earned: false
        },
        {
          id: '3',
          title: 'Consistency Master',
          description: 'Hit 90% weekly completion rate',
          icon: '⭐',
          earned: false
        }
      );
    }

    // Calculate stats
    const currentStreak = await calculateStreaks(userId);
    const weeklyProgress = await calculateWeeklyCompletion(userId);

    res.json({
      targets,
      achievements,
      weeklyProgress,
      totalStreak: currentStreak
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
};

export const handleToggleTarget = async (req, res) => {
  try {
    const { targetId } = req.params;
    
    const target = await Target.findById(targetId);
    if (!target) {
      return res.status(404).json({ error: 'Target not found' });
    }

    // Toggle completion
    target.completed = !target.completed;
    target.completedAt = target.completed ? new Date() : null;

    // Update streak logic
    if (target.completed) {
      target.streak += 1;
      
      // Also update the parent goal's streak
      const goal = await Goal.findById(target.goalId);
      if (goal) {
        goal.streak = Math.max(goal.streak, target.streak);
        goal.lastCompletedDate = new Date();
        await goal.save();
      }
    } else {
      // If uncompleting, we might want to adjust streak
      // For simplicity, we'll keep the streak as is
    }

    await target.save();

    res.json({
      id: target._id.toString(),
      title: target.title,
      description: target.description,
      type: target.type,
      completed: target.completed,
      streak: target.streak
    });

  } catch (error) {
    console.error('Toggle target error:', error);
    res.status(500).json({ error: 'Failed to toggle target' });
  }
};
