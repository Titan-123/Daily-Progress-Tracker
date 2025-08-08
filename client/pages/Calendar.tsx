import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Target,
  CheckCircle2,
  XCircle,
  Heart,
  MessageSquare,
  Star,
  TrendingUp,
  Award,
  Book,
  Zap,
  Loader2,
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
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api, type DayData } from "@/lib/api";
import { toast } from "sonner";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [reflection, setReflection] = useState("");
  const [calendarData, setCalendarData] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load calendar data when month changes
  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
      const year = currentDate.getFullYear();
      const data = await api.calendar.getCalendarData(month, year);
      setCalendarData(data);
    } catch (error) {
      console.error("Failed to load calendar data:", error);
      toast.error("Failed to load calendar data. Please try again.");
      // Fallback to mock data if API fails
      setCalendarData({
        "2024-12-16": {
          date: "2024-12-16",
          completed: 3,
          total: 3,
          targets: [
            {
              id: "1",
              title: "Write 500 words",
              completed: true,
              category: "Creative",
            },
            {
              id: "2",
              title: "Study for 2 hours",
              completed: true,
              category: "Learning",
            },
            {
              id: "3",
              title: "Exercise 30 minutes",
              completed: true,
              category: "Health",
            },
          ],
          reflection:
            "Amazing day! Felt so productive and energized. The morning routine really helped set the tone.",
          mood: "excellent",
          highlights: [
            "Finished a short story",
            "Had a breakthrough in JavaScript concepts",
            "Great workout session",
          ],
        },
        "2024-12-15": {
          date: "2024-12-15",
          completed: 2,
          total: 3,
          targets: [
            {
              id: "1",
              title: "Write 500 words",
              completed: true,
              category: "Creative",
            },
            {
              id: "2",
              title: "Study for 2 hours",
              completed: false,
              category: "Learning",
            },
            {
              id: "3",
              title: "Exercise 30 minutes",
              completed: true,
              category: "Health",
            },
          ],
          reflection:
            "Good day overall. Missed study time because of an unexpected meeting, but still proud of what I accomplished.",
          mood: "good",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDayData = async (date: Date) => {
    try {
      // Use local date string to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      const dayData = await api.calendar.getDayData(dateString);
      if (dayData) {
        setSelectedDay(dayData);
        setReflection(dayData.reflection || "");
      }
    } catch (error) {
      console.error("Failed to load day data:", error);
      toast.error("Failed to load day details");
    }
  };

  const saveReflection = async () => {
    if (!selectedDay || !reflection.trim()) return;

    try {
      setSaving(true);
      const updatedDay = await api.calendar.saveReflection(
        selectedDay.date,
        reflection,
      );

      // Update local data
      setCalendarData((prev) => ({
        ...prev,
        [selectedDay.date]: updatedDay,
      }));

      setSelectedDay(null);
      setReflection("");
      toast.success("Reflection saved! 📝");
    } catch (error) {
      console.error("Failed to save reflection:", error);
      toast.error("Failed to save reflection. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateMood = async (date: string, mood: DayData["mood"]) => {
    try {
      const updatedDay = await api.calendar.updateMood(date, mood);
      setCalendarData((prev) => ({
        ...prev,
        [date]: updatedDay,
      }));
      toast.success("Mood updated! 😊");
    } catch (error) {
      console.error("Failed to update mood:", error);
      toast.error("Failed to update mood");
    }
  };

  const addHighlight = async (date: string, highlight: string) => {
    try {
      const updatedDay = await api.calendar.addHighlight(date, highlight);
      setCalendarData((prev) => ({
        ...prev,
        [date]: updatedDay,
      }));
      toast.success("Highlight added! ⭐");
    } catch (error) {
      console.error("Failed to add highlight:", error);
      toast.error("Failed to add highlight");
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
    // Use local date string to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;
    return calendarData[dateKey] || null;
  };

  const getCompletionRate = (dayData: DayData) => {
    return dayData.total === 0
      ? 0
      : Math.round((dayData.completed / dayData.total) * 100);
  };

  const getDayColor = (dayData: DayData | null) => {
    if (!dayData) return "bg-background hover:bg-muted";
    const rate = getCompletionRate(dayData);
    if (rate === 100)
      return "bg-success/20 hover:bg-success/30 border-success/30";
    if (rate >= 67)
      return "bg-warning/20 hover:bg-warning/30 border-warning/30";
    if (rate > 0) return "bg-accent/20 hover:bg-accent/30 border-accent/30";
    return "bg-destructive/10 hover:bg-destructive/20 border-destructive/20";
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case "excellent":
        return "🌟";
      case "good":
        return "😊";
      case "okay":
        return "😐";
      case "difficult":
        return "😔";
      default:
        return "📅";
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + (direction === "next" ? 1 : -1),
        1,
      ),
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weekStats = Object.values(calendarData).filter((day) => {
    const dayDate = new Date(day.date);
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return dayDate >= weekAgo && dayDate <= today;
  });

  const weeklyCompletion =
    weekStats.length > 0
      ? Math.round(
          (weekStats.reduce((sum, day) => sum + day.completed, 0) /
            weekStats.reduce((sum, day) => sum + day.total, 0)) *
            100,
        )
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your calendar...</p>
        </div>
      </div>
    );
  }

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
            <p className="text-muted-foreground">
              Your journey of growth, day by day
            </p>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("prev")}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth("next")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Click on any day to view details and add reflections
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="space-y-4">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-2 text-sm font-medium text-muted-foreground">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div key={day} className="p-2 text-center">
                          {day}
                        </div>
                      ),
                    )}
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
                                isToday(date) ? "ring-2 ring-primary" : ""
                              }`}
                              onClick={() => {
                                const dayData = getDayData(date);
                                if (dayData) {
                                  setSelectedDay(dayData);
                                  setReflection(dayData.reflection || "");
                                } else {
                                  loadDayData(date);
                                }
                              }}
                            >
                              <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between mb-1">
                                  <span
                                    className={`text-sm font-medium ${isToday(date) ? "text-primary" : ""}`}
                                  >
                                    {date.getDate()}
                                  </span>
                                  {dayData && (
                                    <span className="text-xs">
                                      {getMoodEmoji(dayData.mood)}
                                    </span>
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
                          {selectedDay &&
                            selectedDay.date ===
                              `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` && (
                              <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    {getMoodEmoji(selectedDay.mood)}
                                    {new Date(
                                      selectedDay.date,
                                    ).toLocaleDateString("en-US", {
                                      weekday: "long",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {selectedDay.completed} of{" "}
                                    {selectedDay.total} targets completed (
                                    {getCompletionRate(selectedDay)}%)
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                  {/* Goals for the day */}
                                  <div>
                                    <h4 className="font-semibold mb-2">
                                      Goals for This Day
                                    </h4>
                                    <div className="space-y-3">
                                      {selectedDay.targets.map((target) => (
                                        <div
                                          key={target.id}
                                          className={`p-3 rounded-lg border ${
                                            target.completed
                                              ? "border-success/30 bg-success/5"
                                              : "border-muted bg-muted/30"
                                          }`}
                                        >
                                          <div className="flex items-start gap-3">
                                            {target.completed ? (
                                              <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
                                            ) : (
                                              <XCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                              <h5
                                                className={`font-medium ${
                                                  target.completed
                                                    ? "line-through text-muted-foreground"
                                                    : ""
                                                }`}
                                              >
                                                {target.title}
                                              </h5>
                                              {target.description && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                  {target.description}
                                                </p>
                                              )}
                                              <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="outline">
                                                  {target.category}
                                                </Badge>
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
                                                  <Badge
                                                    variant="outline"
                                                    className="text-warning"
                                                  >
                                                    🔥 {target.streak}
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                      {selectedDay.targets.length === 0 && (
                                        <div className="text-center py-6 text-muted-foreground">
                                          <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                          <p>No goals were set for this day</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Highlights */}
                                  {selectedDay.highlights && (
                                    <div>
                                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Star className="h-4 w-4 text-warning" />
                                        Highlights
                                      </h4>
                                      <ul className="space-y-1">
                                        {selectedDay.highlights.map(
                                          (highlight, index) => (
                                            <li
                                              key={index}
                                              className="text-sm text-muted-foreground"
                                            >
                                              • {highlight}
                                            </li>
                                          ),
                                        )}
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
                                      onChange={(e) =>
                                        setReflection(e.target.value)
                                      }
                                      placeholder="How did today go? What did you learn about yourself?"
                                      className="min-h-[100px]"
                                    />
                                    <Button
                                      onClick={saveReflection}
                                      className="w-full mt-2"
                                      disabled={!reflection.trim() || saving}
                                    >
                                      {saving ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Saving...
                                        </>
                                      ) : (
                                        "Save Reflection"
                                      )}
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
                    {weeklyCompletion >= 80
                      ? "Outstanding week! 🌟"
                      : weeklyCompletion >= 60
                        ? "Good progress! 💪"
                        : "Keep going! Every day matters! 💚"}
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
                  <p className="text-muted-foreground">
                    Celebrate your wins, no matter how small
                  </p>
                </div>
                <div>
                  <p className="font-medium">🌱 What did you learn?</p>
                  <p className="text-muted-foreground">
                    Growth comes from every experience
                  </p>
                </div>
                <div>
                  <p className="font-medium">🎯 How can tomorrow be better?</p>
                  <p className="text-muted-foreground">
                    Small adjustments lead to big changes
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
