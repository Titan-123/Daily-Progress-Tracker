import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Target,
  TrendingUp,
  Heart,
  Star,
  CheckCircle2,
  Plus,
  BarChart3,
  Loader2,
  LogOut,
  User,
  Repeat,
  Clock,
  Crown,
  Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  api,
  type Target as TargetType,
  type Achievement,
  type DashboardData,
} from "@/lib/api";
import { toast } from "sonner";

export default function Index() {
  const [currentDate] = useState(new Date());
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const { user, logout, isPremium, hasAnalyticsAccess, refreshUser } = useAuth();

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Refresh dashboard data when page becomes visible (user returns from other pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDashboardData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.dashboard.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Failed to load dashboard data. Please try again.");
      // Fallback to mock data if API fails
      setDashboardData({
        targets: [
          {
            id: "1",
            title: "Write 500 words",
            description: "Creative writing practice",
            type: "daily",
            completed: false,
            streak: 3,
          },
          {
            id: "2",
            title: "Study for 2 hours",
            description: "Focus on JavaScript fundamentals",
            type: "daily",
            completed: true,
            streak: 7,
          },
          {
            id: "3",
            title: "Exercise 30 minutes",
            description: "Morning workout routine",
            type: "daily",
            completed: false,
            streak: 2,
          },
        ],
        achievements: [
          {
            id: "1",
            title: "7-Day Streak",
            description: "Completed daily goals for a week!",
            icon: "���",
            earned: true,
          },
          {
            id: "2",
            title: "Early Bird",
            description: "Started progress tracking before 8 AM",
            icon: "🌅",
            earned: true,
          },
          {
            id: "3",
            title: "Consistency Master",
            description: "Hit 90% weekly completion rate",
            icon: "⭐",
            earned: false,
          },
        ],
        weeklyProgress: 85,
        totalStreak: 12,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTarget = async (targetId: string) => {
    if (!dashboardData || toggling) return;

    try {
      setToggling(targetId);

      // Optimistic update
      const updatedTargets = dashboardData.targets.map((target) =>
        target.id === targetId
          ? { ...target, completed: !target.completed }
          : target,
      );
      setDashboardData({ ...dashboardData, targets: updatedTargets });

      // Make API call
      const updatedTarget = await api.dashboard.toggleTarget(targetId);

      // Update with server response
      const finalTargets = dashboardData.targets.map((target) =>
        target.id === targetId ? updatedTarget : target,
      );
      setDashboardData({ ...dashboardData, targets: finalTargets });

      toast.success(
        updatedTarget.completed ? "Habit completed! 🎉" : "Habit unchecked",
      );
    } catch (error) {
      console.error("Failed to toggle target:", error);
      toast.error("Failed to update habit. Please try again.");
      // Revert optimistic update on error
      await loadDashboardData();
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
          <Button onClick={loadDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  const {
    targets: todaysTargets,
    achievements,
    weeklyProgress,
    totalStreak,
  } = dashboardData;
  const completedCount = todaysTargets.filter(
    (target) => target.completed,
  ).length;
  const totalCount = todaysTargets.length;
  const completionRate =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // Separate recurring habits from one-off tasks (for future implementation)
  const recurringHabits = todaysTargets.filter(
    (target) => target.type === "daily",
  );
  const weeklyGoals = todaysTargets.filter(
    (target) => target.type === "weekly",
  );
  const monthlyGoals = todaysTargets.filter(
    (target) => target.type === "monthly",
  );

  const motivationalMessages = {
    excellent: [
      "You're absolutely crushing your goals today! 🌟",
      "Amazing progress on your targets! Keep it up! ✨",
      "Your dedication is truly inspiring! 🎉",
    ],
    good: [
      "Great progress on your goals! Almost there! 💪",
      "Fantastic work on achieving your targets! 🚀",
      "So proud of your commitment! 💫",
    ],
    encouraging: [
      "Every goal achieved is a step forward! 🌱",
      "Small steps lead to big achievements! Keep going! 💚",
      "Tomorrow brings new opportunities for progress! 🌈",
    ],
  };

  const getCurrentMessage = () => {
    if (completionRate >= 80)
      return motivationalMessages.excellent[
        Math.floor(Math.random() * motivationalMessages.excellent.length)
      ];
    if (completionRate >= 50)
      return motivationalMessages.good[
        Math.floor(Math.random() * motivationalMessages.good.length)
      ];
    return motivationalMessages.encouraging[
      Math.floor(Math.random() * motivationalMessages.encouraging.length)
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      {/* Navigation Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & App Name */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-primary">
                <Heart className="h-6 w-6 fill-current" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Daily Progress
                </h1>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium"
              >
                <Target className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/goals"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Target className="h-4 w-4" />
                Goals
              </Link>
              <Link
                to="/analytics"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
                <Badge variant="outline" className="text-xs">
                  Coming Soon
                </Badge>
              </Link>
              <Link
                to="/calendar"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Calendar className="h-4 w-4" />
                Calendar
              </Link>
              <Link
                to="/pricing"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Crown className="h-4 w-4" />
                Pricing
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {!isPremium && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-warning text-warning hover:bg-warning/10"
                >
                  <a
                    href="/checkout?plan=premium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade
                  </a>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refreshUser()}
                title="Refresh subscription status"
              >
                🔄
              </Button>
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    {isPremium && <Crown className="h-3 w-3 text-warning" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                    <Badge
                      variant={isPremium ? "default" : "outline"}
                      className="text-xs"
                    >
                      {isPremium ? "Premium" : "Free"}
                    </Badge>
                  </div>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <User className="h-4 w-4 text-primary" />
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:ml-2 sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-lg text-muted-foreground">
              {currentDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h2 className="text-2xl font-bold">
              Welcome back, {user?.name}! 👋
            </h2>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Current Streak */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-primary/20 rounded-lg">🔥</div>
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-primary">
                  {totalStreak} days
                </div>
                <p className="text-sm text-muted-foreground">
                  Keep building those habits!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Today's Progress */}
          <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-success/20 rounded-lg">🎯</div>
                Today's Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-success">
                  {completionRate}%
                </div>
                <p className="text-sm text-muted-foreground">
                  {completedCount} of {totalCount} completed
                </p>
                <Progress value={completionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-warning" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-warning">
                  {weeklyProgress}%
                </div>
                <p className="text-sm text-muted-foreground">
                  Weekly consistency
                </p>
                <Progress value={weeklyProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Motivational Message */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-xl font-semibold text-primary">
                {getCurrentMessage()}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Today's Habits */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Today's Goals
                    </CardTitle>
                    <CardDescription>
                      Your daily, weekly, and monthly targets
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadDashboardData}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <TrendingUp className="h-4 w-4" />
                      )}
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/goals">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Goal
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaysTargets.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No goals set yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start setting daily, weekly, and monthly goals to track
                      your progress!
                    </p>
                    <Button asChild>
                      <Link to="/goals">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Goal
                      </Link>
                    </Button>
                  </div>
                ) : (
                  todaysTargets.map((target) => (
                    <div
                      key={target.id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        target.completed
                          ? "border-success/30 bg-success/5"
                          : "border-border hover:border-primary/30"
                      } ${toggling === target.id ? "opacity-50" : ""}`}
                      onClick={() => toggleTarget(target.id)}
                    >
                      <div className="flex items-center gap-3">
                        {toggling === target.id ? (
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        ) : (
                          <CheckCircle2
                            className={`h-6 w-6 ${
                              target.completed
                                ? "text-success fill-current"
                                : "text-muted-foreground"
                            }`}
                          />
                        )}
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${
                              target.completed
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {target.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {target.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${
                              target.type === "daily"
                                ? "bg-primary/10 text-primary border-primary/20"
                                : target.type === "weekly"
                                  ? "bg-warning/10 text-warning border-warning/20"
                                  : "bg-success/10 text-success border-success/20"
                            }`}
                          >
                            {target.type}
                          </Badge>
                          {target.streak > 0 && (
                            <Badge variant="outline" className="text-warning">
                              🔥 {target.streak}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-warning fill-current" />
                  Achievements
                </CardTitle>
                <CardDescription>
                  Your habit-building milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.slice(0, 3).map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-3 rounded-lg border ${
                        achievement.earned
                          ? "border-warning/30 bg-warning/5"
                          : "border-border bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div className="flex-1">
                          <h4
                            className={`font-medium ${
                              !achievement.earned && "text-muted-foreground"
                            }`}
                          >
                            {achievement.title}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                        {achievement.earned && (
                          <Badge className="text-xs">Earned!</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  asChild
                  variant="outline"
                  className="w-full mt-4"
                  size="sm"
                >
                  <Link to="/analytics">View All Achievements</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
