import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Sparkles,
  TrendingUp,
  Target,
  Crown,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsComingSoon() {
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
              Analytics
            </h1>
            <p className="text-muted-foreground">
              Advanced insights and progress tracking
            </p>
          </div>
        </div>

        {/* Coming Soon Banner */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/20">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              
              <div className="space-y-2">
                <Badge className="bg-warning/10 text-warning border-warning/20 mb-4">
                  <Clock className="h-3 w-3 mr-1" />
                  Coming Soon
                </Badge>
                <h2 className="text-3xl font-bold">
                  Advanced Analytics
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  We're building powerful analytics to help you understand your progress patterns and achieve your goals faster.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's Coming */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Progress Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Visualize your progress over time with beautiful charts and graphs showing completion rates, streaks, and consistency patterns.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-success" />
                Goal Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Discover which goals you excel at, identify improvement areas, and get personalized recommendations for better results.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-warning" />
                Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Understand your peak performance times, category breakdowns, and detailed completion statistics across all your goals.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stay Updated */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Stay Updated</CardTitle>
            <CardDescription className="text-center">
              We're working hard to bring you the best analytics experience
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              In the meantime, keep setting and achieving your goals! Your progress data is being saved and will be available as soon as analytics launches.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild>
                <Link to="/goals">
                  <Target className="h-4 w-4 mr-2" />
                  Set More Goals
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/calendar">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Calendar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Future Features Preview */}
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning" />
              Coming Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold">📊 Interactive Charts</h4>
                <p className="text-sm text-muted-foreground">
                  Beautiful, interactive visualizations of your progress data
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">🎯 Smart Recommendations</h4>
                <p className="text-sm text-muted-foreground">
                  AI-powered suggestions to optimize your goal achievement
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">📈 Trend Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Identify patterns and trends in your goal completion
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">📋 Progress Reports</h4>
                <p className="text-sm text-muted-foreground">
                  Generate detailed reports of your achievements and growth
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
