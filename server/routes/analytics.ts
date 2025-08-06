import { RequestHandler } from "express";

const mockAnalyticsData = {
  weeklyCompletion: 78,
  monthlyCompletion: 82,
  currentStreak: 12,
  bestStreak: 21,
  totalTargetsCompleted: 156,
  consistencyScore: 85,
  improvementAreas: ['Weekend consistency', 'Evening targets', 'Study goals'],
  strengths: ['Morning routine', 'Exercise habits', 'Writing practice'],
  weeklyData: [
    { day: 'Mon', completion: 100, completed: 3, total: 3 },
    { day: 'Tue', completion: 67, completed: 2, total: 3 },
    { day: 'Wed', completion: 100, completed: 3, total: 3 },
    { day: 'Thu', completion: 100, completed: 3, total: 3 },
    { day: 'Fri', completion: 33, completed: 1, total: 3 },
    { day: 'Sat', completion: 67, completed: 2, total: 3 },
    { day: 'Sun', completion: 100, completed: 3, total: 3 },
  ],
  monthlyTrends: [
    { week: 'Week 1', completion: 85 },
    { week: 'Week 2', completion: 72 },
    { week: 'Week 3', completion: 91 },
    { week: 'Week 4', completion: 78 },
  ]
};

export const handleGetAnalytics: RequestHandler = (_req, res) => {
  res.json(mockAnalyticsData);
};

export const handleGetWeeklyData: RequestHandler = (req, res) => {
  const offset = parseInt(req.query.offset as string) || 0;
  
  // In a real app, you'd calculate based on the offset
  // For now, just return the same weekly data
  res.json(mockAnalyticsData.weeklyData);
};

export const handleGetMonthlyTrends: RequestHandler = (_req, res) => {
  res.json(mockAnalyticsData.monthlyTrends);
};
