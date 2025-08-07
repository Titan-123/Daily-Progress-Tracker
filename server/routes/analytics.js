import Target from '../models/Target.js';
import Goal from '../models/Goal.js';
import { 
  calculateStreaks, 
  calculateWeeklyCompletion, 
  calculateMonthlyCompletion,
  getWeeklyData,
  analyzeStrengthsAndWeaknesses
} from '../utils/analytics.js';

// For demo purposes, we'll use a default user ID
const DEFAULT_USER_ID = '60d0fe4f5311236168a109ca';

export const handleGetAnalytics = async (req, res) => {
  try {
    const userId = req.user?.id || DEFAULT_USER_ID;

    // Calculate all analytics data
    const [
      currentStreak,
      weeklyCompletion,
      monthlyCompletion,
      weeklyData,
      strengthsAndWeaknesses,
      totalTargetsCompleted
    ] = await Promise.all([
      calculateStreaks(userId),
      calculateWeeklyCompletion(userId),
      calculateMonthlyCompletion(userId),
      getWeeklyData(userId),
      analyzeStrengthsAndWeaknesses(userId),
      Target.countDocuments({ userId, completed: true })
    ]);

    // Calculate best streak (simplified - in real app, you'd track this over time)
    const bestStreak = Math.max(currentStreak, 21); // Placeholder

    // Calculate consistency score based on recent performance
    const consistencyScore = Math.round((weeklyCompletion + monthlyCompletion) / 2);

    // Generate monthly trends (simplified)
    const monthlyTrends = [
      { week: 'Week 1', completion: monthlyCompletion + 5 },
      { week: 'Week 2', completion: monthlyCompletion - 8 },
      { week: 'Week 3', completion: monthlyCompletion + 12 },
      { week: 'Week 4', completion: weeklyCompletion },
    ].map(item => ({
      ...item,
      completion: Math.max(0, Math.min(100, item.completion))
    }));

    const analyticsData = {
      weeklyCompletion,
      monthlyCompletion,
      currentStreak,
      bestStreak,
      totalTargetsCompleted,
      consistencyScore,
      improvementAreas: strengthsAndWeaknesses.improvementAreas,
      strengths: strengthsAndWeaknesses.strengths,
      weeklyData,
      monthlyTrends
    };

    res.json(analyticsData);

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to load analytics data' });
  }
};

export const handleGetWeeklyData = async (req, res) => {
  try {
    const userId = req.user?.id || DEFAULT_USER_ID;
    const offset = parseInt(req.query.offset) || 0;
    
    const weeklyData = await getWeeklyData(userId, offset);
    res.json(weeklyData);

  } catch (error) {
    console.error('Weekly data error:', error);
    res.status(500).json({ error: 'Failed to load weekly data' });
  }
};

export const handleGetMonthlyTrends = async (req, res) => {
  try {
    const userId = req.user?.id || DEFAULT_USER_ID;
    
    // Generate monthly trends for the past 4 weeks
    const trends = [];
    for (let i = 3; i >= 0; i--) {
      const weekCompletion = await calculateWeeklyCompletion(userId, i);
      trends.push({
        week: `Week ${4 - i}`,
        completion: weekCompletion
      });
    }

    res.json(trends);

  } catch (error) {
    console.error('Monthly trends error:', error);
    res.status(500).json({ error: 'Failed to load monthly trends' });
  }
};
