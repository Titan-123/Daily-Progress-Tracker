import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Target, CheckCircle2, XCircle, Heart, MessageSquare, Star,
  TrendingUp, Award, Book, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface DayData {
  date: Date;
  completed: number;
  total: number;
  targets: { id: string; title: string; completed: boolean; category: string }[];
  reflection?: string;
  mood?: 'excellent' | 'good' | 'okay' | 'difficult';
  highlights?: string[];
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [reflection, setReflection] = useState('');

  // Sample data for the calendar
  const calendarData: Record<string, DayData> = {
    '2024-12-16': {
      date: new Date('2024-12-16'),
      completed: 3,
      total: 3,
      targets: [
        { id: '1', title: 'Write 500 words', completed: true, category: 'Creative' },
        { id: '2', title: 'Study for 2 hours', completed: true, category: 'Learning' },
        { id: '3', title: 'Exercise 30 minutes', completed: true, category: 'Health' }
      ],
      reflection: 'Amazing day! Felt so productive and energized. The morning routine really helped set the tone.',
      mood: 'excellent',
      highlights: ['Finished a short story', 'Had a breakthrough in JavaScript concepts', 'Great workout session']
    },
    '2024-12-15': {
      date: new Date('2024-12-15'),
      completed: 2,
      total: 3,
      targets: [
        { id: '1', title: 'Write 500 words', completed: true, category: 'Creative' },
        { id: '2', title: 'Study for 2 hours', completed: false, category: 'Learning' },
        { id: '3', title: 'Exercise 30 minutes', completed: true, category: 'Health' }
      ],
      reflection: 'Good day overall. Missed study time because of an unexpected meeting, but still proud of what I accomplished.',
      mood: 'good'
    },
    '2024-12-14': {
      date: new Date('2024-12-14'),
      completed: 1,
      total: 3,
      targets: [
        { id: '1', title: 'Write 500 words', completed: false, category: 'Creative' },
        { id: '2', title: 'Study for 2 hours', completed: false, category: 'Learning' },
        { id: '3', title: 'Exercise 30 minutes', completed: true, category: 'Health' }
      ],
      reflection: 'Tough day. Felt overwhelmed but at least managed to get some exercise. Tomorrow is a fresh start.',
      mood: 'difficult'
    },
    '2024-12-13': {
      date: new Date('2024-12-13'),
      completed: 3,
      total: 3,
      targets: [
        { id: '1', title: 'Write 500 words', completed: true, category: 'Creative' },
        { id: '2', title: 'Study for 2 hours', completed: true, category: 'Learning' },
        { id: '3', title: 'Exercise 30 minutes', completed: true, category: 'Health' }
      ],
      mood: 'excellent'
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getDayData = (date: Date): DayData | null => {
    const dateKey = date.toISOString().split('T')[0];
    return calendarData[dateKey] || null;
  };

  const getCompletionRate = (dayData: DayData) => {
    return dayData.total === 0 ? 0 : Math.round((dayData.completed / dayData.total) * 100);
  };

  const getDayColor = (dayData: DayData | null) => {
    if (!dayData) return 'bg-background hover:bg-muted';
    const rate = getCompletionRate(dayData);
    if (rate === 100) return 'bg-success/20 hover:bg-success/30 border-success/30';
    if (rate >= 67) return 'bg-warning/20 hover:bg-warning/30 border-warning/30';
    if (rate > 0) return 'bg-accent/20 hover:bg-accent/30 border-accent/30';
    return 'bg-destructive/10 hover:bg-destructive/20 border-destructive/20';
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'excellent': return '🌟';
      case 'good': return '😊';
      case 'okay': return '😐';
      case 'difficult': return '😔';
      default: return '📅';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === 'next' ? 1 : -1), 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const saveReflection = () => {
    if (selectedDay) {
      // In a real app, this would save to a database
      const dateKey = selectedDay.date.toISOString().split('T')[0];
      if (calendarData[dateKey]) {
        calendarData[dateKey].reflection = reflection;
      }
      setSelectedDay(null);
      setReflection('');
    }
  };

  const weekStats = Object.values(calendarData)
    .filter(day => {
      const dayDate = new Date(day.date);
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return dayDate >= weekAgo && dayDate <= today;
    });

  const weeklyCompletion = weekStats.length > 0 
    ? Math.round((weekStats.reduce((sum, day) => sum + day.completed, 0) / weekStats.reduce((sum, day) => sum + day.total, 0)) * 100)
    : 0;

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
              Progress Calendar
            </h1>
            <p className="text-muted-foreground">Your journey of growth, day by day</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    {monthName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>Click on any day to view details and add reflections</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="space-y-4">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-2 text-sm font-medium text-muted-foreground">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 text-center">{day}</div>
                    ))}
                  </div>
                  
                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-2">
                    {days.map((date, index) => {
                      if (!date) {
                        return <div key={index} className="p-2 h-20"></div>;
                      }
                      
                      const dayData = getDayData(date);
                      return (
                        <Dialog key={date.toISOString()}>
                          <DialogTrigger asChild>
                            <div
                              className={`p-2 h-20 border-2 rounded-lg cursor-pointer transition-all ${getDayColor(dayData)} ${
                                isToday(date) ? 'ring-2 ring-primary' : ''
                              }`}
                              onClick={() => {
                                setSelectedDay(dayData);
                                setReflection(dayData?.reflection || '');
                              }}
                            >
                              <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-sm font-medium ${isToday(date) ? 'text-primary' : ''}`}>
                                    {date.getDate()}
                                  </span>
                                  {dayData && (
                                    <span className="text-xs">{getMoodEmoji(dayData.mood)}</span>
                                  )}
                                </div>
                                {dayData && (
                                  <div className="flex-1 flex flex-col justify-end">
                                    <div className="text-xs text-center mb-1">
                                      {dayData.completed}/{dayData.total}
                                    </div>
                                    <Progress 
                                      value={getCompletionRate(dayData)} 
                                      className="h-1" 
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogTrigger>
                          {dayData && (
                            <DialogContent className="sm:max-w-lg">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  {getMoodEmoji(dayData.mood)}
                                  {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </DialogTitle>
                                <DialogDescription>
                                  {dayData.completed} of {dayData.total} targets completed ({getCompletionRate(dayData)}%)
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                {/* Targets for the day */}
                                <div>
                                  <h4 className="font-semibold mb-2">Daily Targets</h4>
                                  <div className="space-y-2">
                                    {dayData.targets.map((target) => (
                                      <div key={target.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                                        {target.completed ? (
                                          <CheckCircle2 className="h-4 w-4 text-success" />
                                        ) : (
                                          <XCircle className="h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span className={target.completed ? '' : 'text-muted-foreground'}>
                                          {target.title}
                                        </span>
                                        <Badge variant="outline" className="ml-auto">
                                          {target.category}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Highlights */}
                                {dayData.highlights && (
                                  <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                      <Star className="h-4 w-4 text-warning" />
                                      Highlights
                                    </h4>
                                    <ul className="space-y-1">
                                      {dayData.highlights.map((highlight, index) => (
                                        <li key={index} className="text-sm text-muted-foreground">
                                          • {highlight}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Reflection */}
                                <div>
                                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Daily Reflection
                                  </h4>
                                  <Textarea
                                    value={reflection}
                                    onChange={(e) => setReflection(e.target.value)}
                                    placeholder="How did today go? What did you learn about yourself?"
                                    className="min-h-[100px]"
                                  />
                                  <Button 
                                    onClick={saveReflection} 
                                    className="w-full mt-2"
                                    disabled={!reflection.trim()}
                                  >
                                    Save Reflection
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Weekly Summary */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Completion Rate</span>
                    <span>{weeklyCompletion}%</span>
                  </div>
                  <Progress value={weeklyCompletion} />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {weeklyCompletion >= 80 ? "Outstanding week! 🌟" : 
                     weeklyCompletion >= 60 ? "Good progress! 💪" : 
                     "Keep going! Every day matters! 💚"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-success/20 border border-success/30"></div>
                  <span className="text-sm">100% Complete</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-warning/20 border border-warning/30"></div>
                  <span className="text-sm">67-99% Complete</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-accent/20 border border-accent/30"></div>
                  <span className="text-sm">1-66% Complete</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded bg-destructive/10 border border-destructive/20"></div>
                  <span className="text-sm">0% Complete</span>
                </div>
              </CardContent>
            </Card>

            {/* Reflection Prompt */}
            <Card className="border-accent/20 bg-accent/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Reflection Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">💭 What went well?</p>
                  <p className="text-muted-foreground">Celebrate your wins, no matter how small</p>
                </div>
                <div>
                  <p className="font-medium">🌱 What did you learn?</p>
                  <p className="text-muted-foreground">Growth comes from every experience</p>
                </div>
                <div>
                  <p className="font-medium">🎯 How can tomorrow be better?</p>
                  <p className="text-muted-foreground">Small adjustments lead to big changes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
