// API base URL - you can configure this for your backend
const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:3000/api";

// Get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// API utility function to handle requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
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
    completed: boolean;
    category: string;
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
