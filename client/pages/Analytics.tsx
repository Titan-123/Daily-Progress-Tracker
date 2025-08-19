// TEMPORARILY DISABLED - PREMIUM ANALYTICS CODE COMMENTED FOR LATER USE
// Import the coming soon page instead
import AnalyticsComingSoon from "./AnalyticsComingSoon";

export default function Analytics() {
  // TEMPORARY: Show coming soon page instead of analytics
  return <AnalyticsComingSoon />;
}

/* 
ORIGINAL PREMIUM ANALYTICS CODE (COMMENTED FOR LATER USE):
==========================================================

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
  Download,
  Sparkles,
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
          "Write 500 words": 92,
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

  // Rest of the analytics component code would be here...
  // Including all the charts, insights, and premium features
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
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
        
        // All the analytics charts and components would be here...
      </div>
    </div>
  );
}

END OF COMMENTED ANALYTICS CODE
=================================
*/
