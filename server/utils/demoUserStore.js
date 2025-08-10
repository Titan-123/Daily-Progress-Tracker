// Simple in-memory store for demo user data
let demoUserData = {
  subscription: {
    tier: "free",
    status: "active",
    startDate: new Date().toISOString(),
  },
  dashboardTargets: [], // Start with no goals for fresh user experience
  calendarData: {} // Store day-specific data
};

export const getDemoUserSubscription = () => {
  return demoUserData.subscription;
};

export const updateDemoUserSubscription = (subscriptionData) => {
  demoUserData.subscription = {
    ...demoUserData.subscription,
    ...subscriptionData,
  };
  console.log("Demo user subscription updated:", demoUserData.subscription);
  return demoUserData.subscription;
};

export const getDemoDashboardTargets = () => {
  return demoUserData.dashboardTargets;
};

export const updateDemoTargetCompletion = (targetId, completed) => {
  const target = demoUserData.dashboardTargets.find(t => t.id === targetId);
  if (target) {
    target.completed = completed;
    console.log(`Demo target ${targetId} completion updated to:`, completed);
  }
  return demoUserData.dashboardTargets;
};

export const addDemoGoal = (goalData) => {
  const newGoal = {
    id: Date.now().toString(), // Simple ID generation
    title: goalData.title,
    description: goalData.description,
    type: goalData.type,
    category: goalData.category,
    target: goalData.target,
    completed: false,
    streak: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  // If it's a daily goal, also add it to dashboard targets
  if (goalData.type === "daily") {
    demoUserData.dashboardTargets.push({
      id: newGoal.id,
      title: newGoal.title,
      description: newGoal.description,
      type: newGoal.type,
      category: newGoal.category,
      completed: false,
      streak: 0,
    });
  }

  console.log("Added new demo goal:", newGoal);
  return newGoal;
};

export const resetDemoUser = () => {
  demoUserData.subscription = {
    tier: "free",
    status: "active",
    startDate: new Date().toISOString(),
  };
  demoUserData.dashboardTargets = []; // Reset to empty goals
};
