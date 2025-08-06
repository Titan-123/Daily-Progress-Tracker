import { useState, useEffect } from 'react';
import { Calendar, Target, TrendingUp, Heart, Star, CheckCircle2, Plus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface Target {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  streak: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
}

export default function Index() {
  const [currentDate] = useState(new Date());
  const [todaysTargets, setTodaysTargets] = useState<Target[]>([
    { id: '1', title: 'Write 500 words', description: 'Creative writing practice', type: 'daily', completed: false, streak: 3 },
    { id: '2', title: 'Study for 2 hours', description: 'Focus on JavaScript fundamentals', type: 'daily', completed: true, streak: 7 },
    { id: '3', title: 'Exercise 30 minutes', description: 'Morning workout routine', type: 'daily', completed: false, streak: 2 },
  ]);

  const [weeklyProgress] = useState(85);
  const [totalStreak] = useState(12);
  const [achievements] = useState<Achievement[]>([
    { id: '1', title: '7-Day Streak', description: 'Completed daily goals for a week!', icon: '🔥', earned: true },
    { id: '2', title: 'Early Bird', description: 'Started progress tracking before 8 AM', icon: '🌅', earned: true },
    { id: '3', title: 'Consistency Master', description: 'Hit 90% weekly completion rate', icon: '⭐', earned: false },
  ]);

  const completedCount = todaysTargets.filter(target => target.completed).length;
  const totalCount = todaysTargets.length;
  const completionRate = Math.round((completedCount / totalCount) * 100);

  const motivationalMessages = {
    excellent: [
      "You're absolutely crushing it today! 🌟",
      "Look at you being amazing! Keep it up! ✨",
      "Your dedication is truly inspiring! 🎉"
    ],
    good: [
      "You're doing great! Almost there! 💪",
      "Fantastic progress! You've got this! 🚀",
      "So proud of your consistency! 💫"
    ],
    encouraging: [
      "Every step forward counts! You're building something beautiful! 🌱",
      "It's okay to start small - you're still moving forward! 💚",
      "Tomorrow is a fresh start, and I believe in you! 🌈"
    ]
  };

  const getCurrentMessage = () => {
    if (completionRate >= 80) return motivationalMessages.excellent[Math.floor(Math.random() * motivationalMessages.excellent.length)];
    if (completionRate >= 50) return motivationalMessages.good[Math.floor(Math.random() * motivationalMessages.good.length)];
    return motivationalMessages.encouraging[Math.floor(Math.random() * motivationalMessages.encouraging.length)];
  };

  const toggleTarget = (id: string) => {
    setTodaysTargets(targets => 
      targets.map(target => 
        target.id === id ? { ...target, completed: !target.completed } : target
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Heart className="h-8 w-8 fill-current" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Daily Progress Companion
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Your gentle guide to building amazing habits, one day at a time
          </p>
        </div>

        {/* Motivational Message */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-2xl font-semibold text-primary">{getCurrentMessage()}</p>
              <p className="text-muted-foreground">
                Today is {currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Today's Targets */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Today's Targets
                    </CardTitle>
                    <CardDescription>
                      {completedCount} of {totalCount} completed ({completionRate}%)
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Target
                  </Button>
                </div>
                <Progress value={completionRate} className="h-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                {todaysTargets.map((target) => (
                  <div 
                    key={target.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      target.completed 
                        ? 'border-success/30 bg-success/5' 
                        : 'border-border hover:border-primary/30'
                    }`}
                    onClick={() => toggleTarget(target.id)}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 
                        className={`h-6 w-6 ${
                          target.completed ? 'text-success fill-current' : 'text-muted-foreground'
                        }`} 
                      />
                      <div className="flex-1">
                        <h3 className={`font-semibold ${target.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {target.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{target.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={target.type === 'daily' ? 'default' : 'secondary'}>
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
                ))}
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-warning fill-current" />
                  Recent Achievements
                </CardTitle>
                <CardDescription>Celebrating your amazing progress!</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`p-3 rounded-lg border ${
                        achievement.earned 
                          ? 'border-warning/30 bg-warning/5' 
                          : 'border-border bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <h4 className={`font-medium ${!achievement.earned && 'text-muted-foreground'}`}>
                            {achievement.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                        {achievement.earned && (
                          <Badge className="ml-auto">Earned!</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Current Streak */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    🔥
                  </div>
                  Current Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">{totalStreak} days</div>
                  <p className="text-sm text-muted-foreground">
                    You're on fire! Keep the momentum going!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{weeklyProgress}%</span>
                  </div>
                  <Progress value={weeklyProgress} />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Amazing consistency this week! 🌟
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  View Calendar
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Set New Goals
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
