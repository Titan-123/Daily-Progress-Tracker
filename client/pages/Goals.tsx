import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Target, Plus, Edit2, Trash2, Calendar, 
  Clock, Repeat, Star, Heart, CheckCircle2, Save 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  category: string;
  target: string;
  streak: number;
  isActive: boolean;
  createdAt: Date;
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Write 500 words',
      description: 'Creative writing practice to develop my storytelling skills',
      type: 'daily',
      category: 'Creative',
      target: '500 words',
      streak: 7,
      isActive: true,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      title: 'Study programming',
      description: 'Focus on JavaScript fundamentals and practice coding challenges',
      type: 'daily',
      category: 'Learning',
      target: '2 hours',
      streak: 12,
      isActive: true,
      createdAt: new Date('2024-01-02')
    },
    {
      id: '3',
      title: 'Exercise routine',
      description: 'Morning workout to stay healthy and energized',
      type: 'daily',
      category: 'Health',
      target: '30 minutes',
      streak: 5,
      isActive: true,
      createdAt: new Date('2024-01-05')
    },
    {
      id: '4',
      title: 'Read books',
      description: 'Expand knowledge and enjoy fiction',
      type: 'weekly',
      category: 'Learning',
      target: '3 books',
      streak: 2,
      isActive: true,
      createdAt: new Date('2024-01-01')
    },
    {
      id: '5',
      title: 'Complete a project',
      description: 'Finish and ship a meaningful coding project',
      type: 'monthly',
      category: 'Professional',
      target: '1 project',
      streak: 1,
      isActive: true,
      createdAt: new Date('2024-01-01')
    }
  ]);

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'daily' as 'daily' | 'weekly' | 'monthly',
    category: '',
    target: ''
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const categories = ['Health', 'Learning', 'Creative', 'Professional', 'Personal', 'Social'];

  const addGoal = () => {
    if (!newGoal.title || !newGoal.description || !newGoal.category || !newGoal.target) return;

    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      streak: 0,
      isActive: true,
      createdAt: new Date()
    };

    setGoals([...goals, goal]);
    setNewGoal({ title: '', description: '', type: 'daily', category: '', target: '' });
    setIsDialogOpen(false);
  };

  const toggleGoalStatus = (id: string) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, isActive: !goal.isActive } : goal
    ));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(goal => goal.id !== id));
  };

  const getGoalsByType = (type: 'daily' | 'weekly' | 'monthly') => {
    return goals.filter(goal => goal.type === type);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Clock className="h-4 w-4" />;
      case 'weekly': return <Calendar className="h-4 w-4" />;
      case 'monthly': return <Repeat className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-primary/10 text-primary border-primary/20';
      case 'weekly': return 'bg-warning/10 text-warning border-warning/20';
      case 'monthly': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted';
    }
  };

  const GoalCard = ({ goal }: { goal: Goal }) => (
    <Card className={`transition-all ${goal.isActive ? 'border-primary/20' : 'border-muted bg-muted/30'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${getTypeColor(goal.type)}`}>
              {getTypeIcon(goal.type)}
            </div>
            <div>
              <CardTitle className={`text-lg ${!goal.isActive && 'text-muted-foreground'}`}>
                {goal.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{goal.category}</Badge>
                <Badge variant="secondary">{goal.target}</Badge>
                {goal.streak > 0 && (
                  <Badge className="bg-warning/10 text-warning border-warning/20">
                    🔥 {goal.streak}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleGoalStatus(goal.id)}
            >
              {goal.isActive ? 'Pause' : 'Resume'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteGoal(goal.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className={`text-sm ${!goal.isActive && 'text-muted-foreground'}`}>
          {goal.description}
        </p>
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>Created {goal.createdAt.toLocaleDateString()}</span>
          {goal.isActive && (
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-success" />
              <span>Active</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Goal Setting
              </h1>
              <p className="text-muted-foreground">Create meaningful targets that inspire your daily journey</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create a New Goal</DialogTitle>
                <DialogDescription>
                  Set up a meaningful target that will help you grow and thrive!
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Write in journal"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What does this goal mean to you?"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Frequency</Label>
                    <Select
                      value={newGoal.type}
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                        setNewGoal({ ...newGoal, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newGoal.category}
                      onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Target Amount</Label>
                  <Input
                    id="target"
                    placeholder="e.g., 30 minutes, 500 words, 1 book"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  />
                </div>
                <Button onClick={addGoal} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Motivational Message */}
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Heart className="h-8 w-8 text-primary fill-current" />
              <div>
                <p className="text-xl font-semibold text-primary">
                  You have {goals.filter(g => g.isActive).length} active goals! 🌟
                </p>
                <p className="text-muted-foreground">
                  Each goal is a step toward the amazing person you're becoming. Be kind to yourself as you grow!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals by Type */}
        <Tabs defaultValue="daily" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Daily ({getGoalsByType('daily').length})
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekly ({getGoalsByType('weekly').length})
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Monthly ({getGoalsByType('monthly').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <div className="space-y-4">
              {getGoalsByType('daily').length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No daily goals yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Daily goals help build consistent habits that transform your life!
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      Create Your First Daily Goal
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                getGoalsByType('daily').map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <div className="space-y-4">
              {getGoalsByType('weekly').length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No weekly goals yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Weekly goals help you focus on bigger achievements and milestones!
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      Create Your First Weekly Goal
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                getGoalsByType('weekly').map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="space-y-4">
              {getGoalsByType('monthly').length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Repeat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No monthly goals yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Monthly goals help you achieve substantial progress and meaningful changes!
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      Create Your First Monthly Goal
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                getGoalsByType('monthly').map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Tips Card */}
        <Card className="border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-warning fill-current" />
              Goal Setting Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">🎯 Make it Specific</h4>
                <p className="text-sm text-muted-foreground">
                  Instead of "exercise more," try "walk for 30 minutes every morning"
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🌱 Start Small</h4>
                <p className="text-sm text-muted-foreground">
                  Better to do 10 minutes daily than 2 hours once a week
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">💝 Connect to Your Why</h4>
                <p className="text-sm text-muted-foreground">
                  Write meaningful descriptions that remind you why this goal matters
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🎉 Celebrate Progress</h4>
                <p className="text-sm text-muted-foreground">
                  Every streak, no matter how small, is worth celebrating!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
