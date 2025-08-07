// Fallback mock data when MongoDB is not available
let mockTargets = [
  { 
    id: '1', 
    title: 'Write 500 words', 
    description: 'Creative writing practice', 
    type: 'daily', 
    completed: false, 
    streak: 3 
  },
  { 
    id: '2', 
    title: 'Study for 2 hours', 
    description: 'Focus on JavaScript fundamentals', 
    type: 'daily', 
    completed: true, 
    streak: 7 
  },
  { 
    id: '3', 
    title: 'Exercise 30 minutes', 
    description: 'Morning workout routine', 
    type: 'daily', 
    completed: false, 
    streak: 2 
  },
];

const mockAchievements = [
  { 
    id: '1', 
    title: '7-Day Streak', 
    description: 'Completed daily goals for a week!', 
    icon: '🔥', 
    earned: true 
  },
  { 
    id: '2', 
    title: 'Early Bird', 
    description: 'Started progress tracking before 8 AM', 
    icon: '🌅', 
    earned: true 
  },
  { 
    id: '3', 
    title: 'Consistency Master', 
    description: 'Hit 90% weekly completion rate', 
    icon: '⭐', 
    earned: false 
  },
];

export const handleGetDashboardFallback = (req, res) => {
  console.log('📋 Using fallback dashboard data (MongoDB not connected)');
  res.json({
    targets: mockTargets,
    achievements: mockAchievements,
    weeklyProgress: 85,
    totalStreak: 12,
  });
};

export const handleToggleTargetFallback = (req, res) => {
  const { targetId } = req.params;
  
  const targetIndex = mockTargets.findIndex(t => t.id === targetId);
  if (targetIndex === -1) {
    return res.status(404).json({ error: 'Target not found' });
  }

  // Toggle the completed status
  mockTargets[targetIndex] = {
    ...mockTargets[targetIndex],
    completed: !mockTargets[targetIndex].completed,
  };

  console.log(`🎯 Toggled target ${targetId} (fallback mode)`);
  res.json(mockTargets[targetIndex]);
};
