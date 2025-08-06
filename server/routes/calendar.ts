import { RequestHandler } from "express";

// Mock calendar data
let calendarData: Record<string, any> = {
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
  "2024-12-14": {
    date: "2024-12-14",
    completed: 1,
    total: 3,
    targets: [
      {
        id: "1",
        title: "Write 500 words",
        completed: false,
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
      "Tough day. Felt overwhelmed but at least managed to get some exercise. Tomorrow is a fresh start.",
    mood: "difficult",
  },
  "2024-12-13": {
    date: "2024-12-13",
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
    mood: "excellent",
  },
};

export const handleGetCalendarData: RequestHandler = (req, res) => {
  const month = parseInt(req.query.month as string);
  const year = parseInt(req.query.year as string);

  // In a real app, you'd filter by month/year
  // For now, return all data
  res.json(calendarData);
};

export const handleGetDayData: RequestHandler = (req, res) => {
  const { date } = req.params;

  const dayData = calendarData[date];
  if (!dayData) {
    return res.status(404).json({ error: "Day data not found" });
  }

  res.json(dayData);
};

export const handleSaveReflection: RequestHandler = (req, res) => {
  const { date } = req.params;
  const { reflection } = req.body;

  if (!reflection) {
    return res.status(400).json({ error: "Reflection is required" });
  }

  // Create day data if it doesn't exist
  if (!calendarData[date]) {
    calendarData[date] = {
      date,
      completed: 0,
      total: 0,
      targets: [],
    };
  }

  calendarData[date] = {
    ...calendarData[date],
    reflection,
  };

  res.json(calendarData[date]);
};

export const handleUpdateMood: RequestHandler = (req, res) => {
  const { date } = req.params;
  const { mood } = req.body;

  if (!mood) {
    return res.status(400).json({ error: "Mood is required" });
  }

  // Create day data if it doesn't exist
  if (!calendarData[date]) {
    calendarData[date] = {
      date,
      completed: 0,
      total: 0,
      targets: [],
    };
  }

  calendarData[date] = {
    ...calendarData[date],
    mood,
  };

  res.json(calendarData[date]);
};

export const handleAddHighlight: RequestHandler = (req, res) => {
  const { date } = req.params;
  const { highlight } = req.body;

  if (!highlight) {
    return res.status(400).json({ error: "Highlight is required" });
  }

  // Create day data if it doesn't exist
  if (!calendarData[date]) {
    calendarData[date] = {
      date,
      completed: 0,
      total: 0,
      targets: [],
      highlights: [],
    };
  }

  if (!calendarData[date].highlights) {
    calendarData[date].highlights = [];
  }

  calendarData[date].highlights.push(highlight);

  res.json(calendarData[date]);
};
