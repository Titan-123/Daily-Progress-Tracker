// API base URL - you can configure this for your backend
const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "/api" : "/api";

// Get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Check if we're in demo mode
const isDemoMode = () => {
  const token = getAuthToken();
  return token === "demo-token-123";
};

// Demo data
const getDemoData = (endpoint: string) => {
  if (endpoint === "/dashboard") {
    return {
      targets: [
        {
          id: "1",
          title: "Write 500 words",
          description: "Creative writing practice",
          type: "daily",
          completed: true,
          streak: 7,
        },
        {
          id: "2",
          title: "Exercise 30 minutes",
          description: "Morning workout routine",
          type: "daily",
          completed: false,
          streak: 12,
        },
        {
          id: "3",
          title: "Read for 1 hour",
          description: "Daily reading habit",
          type: "daily",
          completed: true,
          streak: 5,
        },
      ],
      achievements: [
        {
          id: "1",
          title: "Week Warrior",
          description: "Completed goals for 7 days straight!",
          icon: "🔥",
          earned: true,
        },
        {
          id: "2",
          title: "Early Bird",
          description: "Started progress tracking before 8 AM",
          icon: "🌅",
          earned: true,
        },
      ],
      weeklyProgress: 85,
      totalStreak: 12,
    };
  }

  if (endpoint === "/analytics") {
    return {
      weeklyCompletion: 78,
      monthlyCompletion: 82,
      currentStreak: 12,
      bestStreak: 21,
      totalTargetsCompleted: 156,
      consistencyScore: 85,
      improvementAreas: ["Weekend consistency", "Evening targets"],
      strengths: ["Morning routine", "Exercise habits", "Writing practice"],
      habitStrength: {
        "Write 500 words": 92,
        "Exercise 30 minutes": 85,
        "Read for 1 hour": 78,
        "Drink 8 glasses of water": 95,
        "Meditate 10 minutes": 65,
        "Study programming": 55,
      },
      weeklyData: [
        { day: "Mon", completion: 100, completed: 3, total: 3 },
        { day: "Tue", completion: 67, completed: 2, total: 3 },
        { day: "Wed", completion: 100, completed: 3, total: 3 },
        { day: "Thu", completion: 100, completed: 3, total: 3 },
        { day: "Fri", completion: 33, completed: 1, total: 3 },
        { day: "Sat", completion: 67, completed: 2, total: 3 },
        { day: "Sun", completion: 100, completed: 3, total: 3 },
      ],
      monthlyTrends: [
        { week: "Week 1", completion: 85 },
        { week: "Week 2", completion: 72 },
        { week: "Week 3", completion: 91 },
        { week: "Week 4", completion: 78 },
      ],
    };
  }

  if (endpoint === "/goals") {
    return [
      {
        id: "1",
        title: "Write 500 words",
        description: "Creative writing practice to develop storytelling skills",
        type: "daily",
        category: "Creative",
        target: "500 words",
        streak: 7,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "2",
        title: "Exercise 30 minutes",
        description: "Morning workout to stay healthy and energized",
        type: "daily",
        category: "Health",
        target: "30 minutes",
        streak: 12,
        isActive: true,
        createdAt: "2024-01-02T00:00:00Z",
      },
      {
        id: "3",
        title: "Read for 1 hour",
        description: "Daily reading to expand knowledge and perspective",
        type: "daily",
        category: "Learning",
        target: "1 hour",
        streak: 5,
        isActive: true,
        createdAt: "2024-01-03T00:00:00Z",
      },
    ];
  }

  // Calendar endpoints
  if (endpoint.startsWith("/calendar")) {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    return {
      [`${currentYear}-${currentMonth.toString().padStart(2, '0')}-16`]: {
        date: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-16`,
        completed: 3,
        total: 3,
        targets: [
          { id: "1", title: "Write 500 words", completed: true, category: "Creative", type: "daily", streak: 7 },
          { id: "2", title: "Exercise 30 minutes", completed: true, category: "Health", type: "daily", streak: 12 },
          { id: "3", title: "Read for 1 hour", completed: true, category: "Learning", type: "daily", streak: 5 },
        ],
        reflection: "Amazing day! Felt so productive and energized.",
        mood: "excellent" as const,
        highlights: ["Finished a short story", "Great workout session"],
      },
      [`${currentYear}-${currentMonth.toString().padStart(2, '0')}-15`]: {
        date: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-15`,
        completed: 2,
        total: 3,
        targets: [
          { id: "1", title: "Write 500 words", completed: true, category: "Creative", type: "daily", streak: 6 },
          { id: "2", title: "Exercise 30 minutes", completed: false, category: "Health", type: "daily", streak: 11 },
          { id: "3", title: "Read for 1 hour", completed: true, category: "Learning", type: "daily", streak: 4 },
        ],
        mood: "good" as const,
      },
      [`${currentYear}-${currentMonth.toString().padStart(2, '0')}-14`]: {
        date: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-14`,
        completed: 1,
        total: 3,
        targets: [
          { id: "1", title: "Write 500 words", completed: false, category: "Creative", type: "daily", streak: 5 },
          { id: "2", title: "Exercise 30 minutes", completed: true, category: "Health", type: "daily", streak: 11 },
          { id: "3", title: "Read for 1 hour", completed: false, category: "Learning", type: "daily", streak: 3 },
        ],
        mood: "okay" as const,
      },
    };
  }

  return null;
};

// API utility function to handle requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  // Demo mode - return mock data
  if (isDemoMode()) {
    const demoData = getDemoData(endpoint);
    if (demoData) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(demoData as T), 300); // Simulate network delay
      });
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  // Get auth token and add to headers
  const token = getAuthToken();

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Handle authentication errors
    if (response.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      throw new Error("Authentication failed");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error ||
          `API Error: ${response.status} ${response.statusText}`,
      );
    }

    // Handle 204 No Content responses (like delete operations)
    if (response.status === 204) {
      return null;
    }

    // Handle responses with content
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    // Fallback for other content types
    return null;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// Types for API responses
export interface Target {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly";
  completed: boolean;
  streak: number;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly";
  category: string;
  target: string;
  streak: number;
  isActive: boolean;
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  category: string;
  target: string;
  streak: number;
  bestStreak: number;
  isActive: boolean;
  createdAt: string;
  lastCompletedDate?: string;
}

export interface DailyTarget {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  completedAt?: string;
  dueDate: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
}

export interface DayData {
  date: string;
  completed: number;
  total: number;
  targets: {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    category: string;
    type: string;
    streak: number;
  }[];
  reflection?: string;
  mood?: "excellent" | "good" | "okay" | "difficult";
  highlights?: string[];
}

export interface AnalyticsData {
  weeklyCompletion: number;
  monthlyCompletion: number;
  currentStreak: number;
  bestStreak: number;
  totalTargetsCompleted: number;
  consistencyScore: number;
  improvementAreas: string[];
  strengths: string[];
  habitStrength: Record<string, number>;
  weeklyData: {
    day: string;
    completion: number;
    completed: number;
    total: number;
  }[];
  monthlyTrends: { week: string; completion: number }[];
}

export interface DashboardData {
  targets: Target[];
  achievements: Achievement[];
  weeklyProgress: number;
  totalStreak: number;
}

// Authentication API calls
export const authApi = {
  async login(email: string, password: string) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async register(name: string, email: string, password: string) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  async getProfile() {
    return apiRequest("/auth/profile");
  },

  async updateProfile(updates: any) {
    return apiRequest("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },
};

// Dashboard API calls
export const dashboardApi = {
  async getDashboardData(): Promise<DashboardData> {
    return apiRequest<DashboardData>("/dashboard");
  },

  async toggleTarget(targetId: string): Promise<Target> {
    return apiRequest<Target>(`/targets/${targetId}/toggle`, {
      method: "POST",
    });
  },
};

// Goals API calls
export const goalsApi = {
  async getGoals(): Promise<Goal[]> {
    return apiRequest<Goal[]>("/goals");
  },

  async createGoal(
    goalData: Omit<Goal, "id" | "streak" | "isActive" | "createdAt">,
  ): Promise<Goal> {
    return apiRequest<Goal>("/goals", {
      method: "POST",
      body: JSON.stringify(goalData),
    });
  },

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal> {
    return apiRequest<Goal>(`/goals/${goalId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  async deleteGoal(goalId: string): Promise<void> {
    return apiRequest<void>(`/goals/${goalId}`, {
      method: "DELETE",
    });
  },

  async toggleGoalStatus(goalId: string): Promise<Goal> {
    return apiRequest<Goal>(`/goals/${goalId}/toggle`, {
      method: "POST",
    });
  },
};

// Analytics API calls
export const analyticsApi = {
  async getAnalyticsData(): Promise<AnalyticsData> {
    return apiRequest<AnalyticsData>("/analytics");
  },

  async getWeeklyData(
    weekOffset: number = 0,
  ): Promise<AnalyticsData["weeklyData"]> {
    return apiRequest<AnalyticsData["weeklyData"]>(
      `/analytics/weekly?offset=${weekOffset}`,
    );
  },

  async getMonthlyTrends(): Promise<AnalyticsData["monthlyTrends"]> {
    return apiRequest<AnalyticsData["monthlyTrends"]>("/analytics/monthly");
  },
};

// Calendar API calls
export const calendarApi = {
  async getCalendarData(
    month: number,
    year: number,
  ): Promise<Record<string, DayData>> {
    return apiRequest<Record<string, DayData>>(
      `/calendar?month=${month}&year=${year}`,
    );
  },

  async getDayData(date: string): Promise<DayData | null> {
    return apiRequest<DayData | null>(`/calendar/day/${date}`);
  },

  async saveReflection(date: string, reflection: string): Promise<DayData> {
    return apiRequest<DayData>(`/calendar/day/${date}/reflection`, {
      method: "POST",
      body: JSON.stringify({ reflection }),
    });
  },

  async updateMood(date: string, mood: DayData["mood"]): Promise<DayData> {
    return apiRequest<DayData>(`/calendar/day/${date}/mood`, {
      method: "POST",
      body: JSON.stringify({ mood }),
    });
  },

  async addHighlight(date: string, highlight: string): Promise<DayData> {
    return apiRequest<DayData>(`/calendar/day/${date}/highlights`, {
      method: "POST",
      body: JSON.stringify({ highlight }),
    });
  },
};

// Export all APIs
export const api = {
  auth: authApi,
  dashboard: dashboardApi,
  goals: goalsApi,
  analytics: analyticsApi,
  calendar: calendarApi,
};
