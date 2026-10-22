export interface Habit {
  id: string;
  name: string;
  time: string; // e.g., "04:00 AM"
  duration: string; // e.g., "60 mins"
  startHour: number; // 1 to 12
  startMinute: number; // 0, 15, 30, 45, etc.
  startAmPm: 'AM' | 'PM';
  durationMinutes: number; // 30, 60, 90, 120, etc.
  graceMinutes: number; // e.g. 15 minutes window after task end time to check in
  avatar: string; // Emoji avatar e.g. "🏋️‍♂️", "📚", "🧘", "💻"
  category?: string; // e.g., "Health", "Fitness", "Deep Work"
  createdAt: number;
}

export type DayCompletionMap = Record<number, boolean>; // dayNumber (1..31) -> boolean

export interface MonthHabitRecord {
  // key is habitId -> DayCompletionMap
  [habitId: string]: DayCompletionMap;
}

export type MoodType = 'great' | 'good' | 'neutral' | 'low' | 'energized' | '';

export interface DayWellness {
  mood: MoodType;
  sleepHours: number | null; // e.g., 7.5
}

export type MonthWellnessRecord = Record<number, DayWellness>; // dayNumber -> DayWellness

export interface TrackerMonthKey {
  year: number; // e.g. 2026
  month: number; // 0-indexed: 0 = January, 2 = March, etc.
}

export interface DayInfo {
  dayNumber: number;
  dayOfWeek: string; // "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"
  fullDayName: string;
  isWeekend: boolean;
  isToday: boolean;
  dateKey: string; // "YYYY-MM-DD"
}

export interface WeekGroup {
  weekNumber: number;
  weekLabel: string; // "Week 1", "Week 2", ...
  days: DayInfo[];
  colSpan: number;
}

export interface HabitAnalytics {
  habitId: string;
  habit: Habit;
  goal: number;
  actual: number;
  left: number;
  percentage: number;
  currentStreak: number;
  longestStreak: number;
}

export type TaskTimeStatus = 
  | 'completed'       // Already checked off
  | 'in_window'       // Finished task, in the 15-min check-in window!
  | 'upcoming'        // Has not finished yet today (before end time)
  | 'expired'         // Check-in window closed today, marked undone!
  | 'future'          // Future calendar day
  | 'past_missed';    // Past calendar day, was never checked
