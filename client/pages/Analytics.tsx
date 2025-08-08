import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Target,
  TrendingUp,
  BarChart3,
  Heart,
  Flame,
  Trophy,
  Star,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Loader2,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, type AnalyticsData } from "@/lib/api";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Analytics() {
  const { isPremium, hasAnalyticsAccess } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");

  // Load analytics data on component mount
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await api.analytics.getAnalyticsData();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Failed to load analytics data:", error);
      toast.error("Failed to load analytics data. Please try again.");
      // Fallback to mock data if API fails
      setAnalyticsData({
        weeklyCompletion: 78,
        monthlyCompletion: 82,
        currentStreak: 12,
        bestStreak: 21,
        totalTargetsCompleted: 156,
        consistencyScore: 85,
        improvementAreas: [
          "Weekend consistency",
          "Evening targets",
          "Study goals",
        ],
        strengths: ["Morning routine", "Exercise habits", "Writing practice"],
        habitStrength: {
          "Morning Routine": 92,
          Exercise: 85,
          Writing: 78,
          "Study Time": 45,
          "Drink Water": 95,
          "Read Books": 55,
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
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyData = async (weekOffset: number = 0) => {
    try {
      const weeklyData = await api.analytics.getWeeklyData(weekOffset);
      if (analyticsData) {
        setAnalyticsData({ ...analyticsData, weeklyData });
      }
    } catch (error) {
      console.error("Failed to load weekly data:", error);
      toast.error("Failed to load weekly data");
    }
  };

  const loadMonthlyTrends = async () => {
    try {
      const monthlyTrends = await api.analytics.getMonthlyTrends();
      if (analyticsData) {
        setAnalyticsData({ ...analyticsData, monthlyTrends });
      }
    } catch (error) {
      console.error("Failed to load monthly trends:", error);
      toast.error("Failed to load monthly trends");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  // Premium access gate
  if (!hasAnalyticsAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Analytics
              </h1>
              <p className="text-muted-foreground">
                Advanced insights into your progress
              </p>
            </div>
          </div>

          {/* Premium Upgrade Card */}
          <div className="max-w-2xl mx-auto mt-20">
            <Card className="border-2 border-warning/20 bg-gradient-to-br from-warning/5 to-accent/10 text-center">
              <CardContent className="p-12">
                <div className="space-y-6">
                  <div className="p-4 rounded-full bg-warning/10 w-fit mx-auto">
                    <Crown className="h-12 w-12 text-warning" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Premium Feature</h2>
                    <p className="text-muted-foreground text-lg">
                      Advanced analytics are available with Premium subscription
                    </p>
                  </div>
                  <div className="space-y-3 text-left bg-background/50 rounded-lg p-6">
                    <h3 className="font-semibold mb-3">With Premium Analytics, you get:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm">Weekly completion trends</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm">Monthly progress analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm">Streak tracking & insights</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm">Habit strength analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm">Performance predictions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm">Data export capabilities</span>
                      </div>
                    </div>
                  </div>
                  <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                    <Link to="/pricing">
                      <Crown className="h-5 w-5 mr-2" />
                      Upgrade to Premium - $9.99/month
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    30-day money-back guarantee • Cancel anytime
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Failed to load analytics data</p>
          <Button onClick={loadAnalyticsData}>Try Again</Button>
        </div>
      </div>
    );
  }

  const getMotivationalInsight = () => {
    const { weeklyCompletion, currentStreak, consistencyScore } = analyticsData;

    if (weeklyCompletion >= 80 && currentStreak >= 10) {
      return {
        message:
          "You're absolutely unstoppable! Your consistency is building incredible momentum! 🚀",
        type: "excellent" as const,
        icon: "🌟",
      };
    } else if (weeklyCompletion >= 60 && currentStreak >= 5) {
      return {
        message:
          "Great progress! You're building solid habits that will serve you well! 💪",
        type: "good" as const,
        icon: "⭐",
      };
    } else {
      return {
        message:
          "Every small step matters! You're learning and growing with each day! 🌱",
        type: "encouraging" as const,
        icon: "💚",
      };
    }
  };

  const insight = getMotivationalInsight();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Progress Analytics
            </h1>
            <p className="text-muted-foreground">
              Understanding your journey and celebrating growth
            </p>
          </div>
        </div>

        {/* Motivational Insight Banner */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{insight.icon}</div>
              <div>
                <p className="text-xl font-semibold text-primary">
                  {insight.message}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your data shows beautiful patterns of growth and dedication!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="charts" className="space-y-6">
            {/* Weekly Progress Line Chart */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Progress Trend</CardTitle>
                  <CardDescription>
                    Your daily completion rates this week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={analyticsData.weeklyData}>
                      <defs>
                        <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis
                        dataKey="day"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: any) => [`${value}%`, "Completion"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="completion"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#colorCompletion)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Goal Performance Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Goal Performance Distribution</CardTitle>
                  <CardDescription>
                    How your goals are performing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: 'Crushing It',
                            value: Object.values(analyticsData.habitStrength).filter(rate => rate >= 80).length,
                            color: 'hsl(var(--success))'
                          },
                          {
                            name: 'Steady Progress',
                            value: Object.values(analyticsData.habitStrength).filter(rate => rate >= 60 && rate < 80).length,
                            color: 'hsl(var(--primary))'
                          },
                          {
                            name: 'Needs Focus',
                            value: Object.values(analyticsData.habitStrength).filter(rate => rate < 60).length,
                            color: 'hsl(var(--warning))'
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { color: 'hsl(142 76% 36%)' }, // success
                          { color: 'hsl(221 83% 53%)' }, // primary
                          { color: 'hsl(38 92% 50%)' },  // warning
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: any) => [`${value} goals`, ""]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trends Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Completion Trends</CardTitle>
                <CardDescription>
                  Weekly completion rates over the past month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis
                      dataKey="week"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any) => [`${value}%`, "Completion Rate"]}
                    />
                    <Bar
                      dataKey="completion"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Individual Goal Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Individual Goal Performance</CardTitle>
                <CardDescription>
                  Completion rates for each of your goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.entries(analyticsData.habitStrength).map(([name, rate]) => ({
                      name: name.length > 15 ? name.substring(0, 15) + '...' : name,
                      fullName: name,
                      rate: rate
                    })).sort((a, b) => b.rate - a.rate)}
                    layout="horizontal"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any, name: any, props: any) => [
                        `${value}%`,
                        props.payload.fullName
                      ]}
                    />
                    <Bar
                      dataKey="rate"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-success/20 bg-success/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      Current Streak
                    </CardTitle>
                    <Flame className="h-4 w-4 text-warning" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    {analyticsData.currentStreak} days
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Best: {analyticsData.bestStreak} days
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      Weekly Rate
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData.weeklyCompletion}%
                  </div>
                  <div className="flex items-center text-xs text-success">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +5% from last week
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      Total Completed
                    </CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData.totalTargetsCompleted}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    targets achieved
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      Consistency
                    </CardTitle>
                    <Star className="h-4 w-4 text-warning" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData.consistencyScore}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    reliability score
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Progress Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>This Week's Progress</CardTitle>
                    <CardDescription>
                      Daily completion rates and target achievement
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadWeeklyData()}
                  >
                    Refresh Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={analyticsData.weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis
                        dataKey="day"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: any) => [`${value}%`, "Completion"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="completion"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Detailed breakdown */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Detailed Breakdown</h4>
                  <div className="grid grid-cols-7 gap-2">
                    {analyticsData.weeklyData.map((day) => (
                      <div key={day.day} className="text-center">
                        <div className="text-xs font-medium mb-1">{day.day}</div>
                        <div className="text-xs text-muted-foreground">
                          {day.completed}/{day.total}
                        </div>
                        <Badge
                          variant={
                            day.completion === 100
                              ? "default"
                              : day.completion >= 67
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {day.completion}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {/* Monthly Trends */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Monthly Completion Trend</CardTitle>
                      <CardDescription>
                        Weekly averages over the past month
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMonthlyTrends}
                    >
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.monthlyTrends.map((week, index) => (
                      <div key={week.week} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{week.week}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {week.completion}%
                            </span>
                            {index > 0 && (
                              <div className="flex items-center">
                                {week.completion >
                                analyticsData.monthlyTrends[index - 1]
                                  .completion ? (
                                  <ArrowUpRight className="h-3 w-3 text-success" />
                                ) : (
                                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <Progress value={week.completion} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Goal Insights</CardTitle>
                  <CardDescription>
                    Your goal performance and patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(analyticsData.habitStrength).length > 0 ? (
                    <div className="space-y-4">
                      {/* Top Performers */}
                      {Object.entries(analyticsData.habitStrength).filter(
                        ([, rate]) => rate >= 80,
                      ).length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-success flex items-center gap-2 mb-2">
                            <Trophy className="h-4 w-4" />
                            Crushing It! (80%+ completion)
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(analyticsData.habitStrength)
                              .filter(([, rate]) => rate >= 80)
                              .sort(([, a], [, b]) => b - a)
                              .map(([goalName, rate]) => (
                                <div
                                  key={goalName}
                                  className="flex items-center justify-between p-2 bg-success/5 rounded-lg border border-success/20"
                                >
                                  <span className="text-sm font-medium">
                                    {goalName}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-success font-semibold">
                                      {rate}%
                                    </span>
                                    <Star className="h-3 w-3 text-warning fill-current" />
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Needs Attention */}
                      {Object.entries(analyticsData.habitStrength).filter(
                        ([, rate]) => rate < 60,
                      ).length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-warning flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4" />
                            Needs Focus (Under 60%)
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(analyticsData.habitStrength)
                              .filter(([, rate]) => rate < 60)
                              .sort(([, a], [, b]) => a - b) // Sort lowest first
                              .map(([goalName, rate]) => (
                                <div
                                  key={goalName}
                                  className="flex items-center justify-between p-2 bg-warning/5 rounded-lg border border-warning/20"
                                >
                                  <span className="text-sm">{goalName}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-warning">
                                      {rate}%
                                    </span>
                                    <Target className="h-3 w-3 text-warning" />
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Steady Progress */}
                      {Object.entries(analyticsData.habitStrength).filter(
                        ([, rate]) => rate >= 60 && rate < 80,
                      ).length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-primary flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4" />
                            Steady Progress (60-79%)
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(analyticsData.habitStrength)
                              .filter(([, rate]) => rate >= 60 && rate < 80)
                              .sort(([, a], [, b]) => b - a)
                              .map(([goalName, rate]) => (
                                <div
                                  key={goalName}
                                  className="flex items-center justify-between p-2 bg-primary/5 rounded-lg border border-primary/20"
                                >
                                  <span className="text-sm">{goalName}</span>
                                  <span className="text-sm text-primary">
                                    {rate}%
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Insights */}
                      <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                        <h4 className="text-sm font-semibold mb-2">
                          💡 Quick Insights
                        </h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {Object.entries(analyticsData.habitStrength).length >
                            0 && (
                            <>
                              <p>
                                • You have{" "}
                                {
                                  Object.values(
                                    analyticsData.habitStrength,
                                  ).filter((rate) => rate >= 80).length
                                }{" "}
                                goals performing excellently
                              </p>
                              <p>
                                • Focus on improving{" "}
                                {Object.values(
                                  analyticsData.habitStrength,
                                ).filter((rate) => rate < 60).length || 0}{" "}
                                goals that need attention
                              </p>
                              <p>
                                • Your average completion rate is{" "}
                                {Math.round(
                                  Object.values(
                                    analyticsData.habitStrength,
                                  ).reduce((sum, rate) => sum + rate, 0) /
                                    Object.values(analyticsData.habitStrength)
                                      .length,
                                )}
                                %
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No daily goals found</p>
                      <p className="text-sm">
                        Create some daily goals to see insights!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Strengths */}
              <Card className="border-success/20 bg-success/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-success" />
                    Your Strengths
                  </CardTitle>
                  <CardDescription>
                    Areas where you're absolutely thriving!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.strengths.map((strength, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-background/50"
                      >
                        <Star className="h-4 w-4 text-warning fill-current" />
                        <span className="font-medium">{strength}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 rounded-lg bg-background/30">
                    <p className="text-sm text-muted-foreground">
                      💪 You're showing incredible consistency in these areas!
                      These strengths are the foundation for building even more
                      amazing habits.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Growth Areas */}
              <Card className="border-warning/20 bg-warning/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-warning" />
                    Growth Opportunities
                  </CardTitle>
                  <CardDescription>
                    Gentle areas to focus on for even more success
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.improvementAreas.map((area, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-background/50"
                      >
                        <Target className="h-4 w-4 text-warning" />
                        <span className="font-medium">{area}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 rounded-lg bg-background/30">
                    <p className="text-sm text-muted-foreground">
                      🌱 Remember, growth happens gradually! Pick one area to
                      focus on this week. Small, consistent improvements lead to
                      big transformations.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Encouraging Message */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/20">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <Heart className="h-8 w-8 text-primary mx-auto fill-current" />
                  <h3 className="text-xl font-semibold">
                    You're Doing Amazing! 🌟
                  </h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Your analytics tell a story of dedication, growth, and
                    resilience. Every data point represents a moment you chose
                    to show up for yourself. That's something to be truly proud
                    of!
                  </p>
                  <Button asChild className="mt-4">
                    <Link to="/goals">
                      Set New Goals
                      <Target className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
